from __future__ import annotations
import base64, hashlib, io, logging, os
import cv2
import httpx
import torch
from diffusers import AutoPipelineForImage2Image, LCMScheduler
from PIL import Image
from app.services.child_blend import _decode, _crop, _morph, _childify

log = logging.getLogger(__name__)

OLLAMA_URL  = os.environ.get("OLLAMA_URL", "http://ollama:11434")
VISION_MODEL = "gemma3:4b"
HF_CACHE    = os.environ.get("HF_HOME", "/app/model-cache")
KEEP_ALIVE  = "2h"
_pipe       = None


def _load_pipe() -> AutoPipelineForImage2Image:
    global _pipe
    if _pipe is not None:
        return _pipe
    os.makedirs(HF_CACHE, exist_ok=True)
    # Image-to-image (same cached LCM Dreamshaper weights, no extra download) so the
    # parents' actual blended face conditions the generation instead of text alone.
    _pipe = AutoPipelineForImage2Image.from_pretrained(
        "SimianLuo/LCM_Dreamshaper_v7",
        cache_dir=HF_CACHE,
        torch_dtype=torch.float32,
        safety_checker=None,
        requires_safety_checker=False,
        local_files_only=True,
    )
    _pipe.scheduler = LCMScheduler.from_config(_pipe.scheduler.config)
    _pipe.to("cpu")
    return _pipe


def _parent_blend_image(p1_b64: str, p2_b64: str) -> Image.Image:
    """Genuine Delaunay morph of BOTH parent faces -> 512x512 RGB init image.
    This is what ties the generated child to the specific uploaded parents."""
    img1 = _crop(_decode(p1_b64))
    img2 = _crop(_decode(p2_b64))
    morph = _childify(_morph(img1, img2, size=512))
    return Image.fromarray(cv2.cvtColor(morph, cv2.COLOR_BGR2RGB))


def _clean(b64: str) -> str:
    return b64.split(",", 1)[1] if "," in b64 else b64


def _resize_for_ollama(b64: str, max_px: int = 512) -> str:
    """Resize image to max_px on the longest side and re-encode as JPEG.
    Keeps large phone photos from overflowing Ollama's token context."""
    raw = base64.b64decode(b64)
    img = Image.open(io.BytesIO(raw)).convert("RGB")
    w, h = img.size
    if max(w, h) > max_px:
        scale = max_px / max(w, h)
        img = img.resize((int(w * scale), int(h * scale)), Image.LANCZOS)
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=85)
    return base64.b64encode(buf.getvalue()).decode()


def warm_up() -> None:
    """Force both the Ollama vision model and the diffusers pipeline resident
    in memory ahead of the first real request. Without this, whichever request
    lands first after a deploy (ai-service always restarts fresh, resetting
    `_pipe`) or after a >keep_alive idle gap pays the full cold-load cost on
    top of normal generation time, which is what was blowing past the 360s
    nginx/backend timeout budget and producing 504s (#387). Call from FastAPI
    startup in a background thread — best-effort, never raises."""
    try:
        httpx.post(
            f"{OLLAMA_URL}/api/generate",
            json={"model": VISION_MODEL, "prompt": "hi", "stream": False, "keep_alive": KEEP_ALIVE},
            timeout=300.0,
        )
    except Exception:
        log.warning("child-prediction warm-up: Ollama not reachable yet", exc_info=True)
    try:
        _load_pipe()
    except Exception:
        log.warning("child-prediction warm-up: diffusers pipe load failed", exc_info=True)


def _describe_child(p1_b64: str, p2_b64: str) -> str:
    log.info("Sending images to Ollama (sizes: %d / %d chars)", len(p1_b64), len(p2_b64))
    try:
        r = httpx.post(
            f"{OLLAMA_URL}/api/generate",
            json={
                "model": VISION_MODEL,
                "prompt": (
                    "You are looking at photos of two parents. "
                    "Based on their facial features, predict what their biological child would look like. "
                    "Write a single concise image-generation prompt (max 60 words) starting with "
                    "'A young child with' and describing: skin tone, eye colour and shape, "
                    "nose shape, lips, hair colour and texture, face shape. "
                    "End with: soft natural lighting, photorealistic portrait, high detail. "
                    "Output only the prompt, nothing else."
                ),
                "images": [p1_b64, p2_b64],
                "stream": False,
                # Default keep_alive unloads the 3.3GB model after 5 idle
                # minutes; a cold reload made this call take well over a
                # minute instead of the ~6s it takes once resident. Keep it
                # loaded for 2h so only a request after a long idle
                # gap pays that cost (#141, extended further for #387).
                "keep_alive": KEEP_ALIVE,
            },
            timeout=300.0,
        )
        if not r.is_success:
            log.error("Ollama %d: %s", r.status_code, r.text[:400])
            r.raise_for_status()
        desc = r.json()["response"].strip()
        log.info("Ollama description: %s", desc[:120])
        return desc
    except httpx.HTTPStatusError as exc:
        raise ValueError(f"Ollama error {exc.response.status_code}: {exc.response.text[:200]}") from exc


def predict_child(p1_b64: str, p2_b64: str) -> str:
    p1 = _resize_for_ollama(_clean(p1_b64))
    p2 = _resize_for_ollama(_clean(p2_b64))

    child_prompt = _describe_child(p1, p2)

    # Real per-parent face blend drives the generation; text only refines it.
    init_image = _parent_blend_image(p1_b64, p2_b64)

    # Seed = parent-derived component XOR per-request randomness: different parents
    # diverge, and repeated runs on the same pair still vary (pose), without ever
    # collapsing to a single fixed result.
    parent_seed = int.from_bytes(
        hashlib.sha256((p1 + p2).encode()).digest()[:4], "big"
    )
    seed = (parent_seed ^ int.from_bytes(os.urandom(4), "big")) & 0xFFFFFFFF
    generator = torch.Generator(device="cpu").manual_seed(seed)

    pipe = _load_pipe()
    # 8 steps / guidance 1.0 only ever cost ~45s total (diffusion is cheap here
    # -- the real time sink was Ollama, see keep_alive above) but produced the
    # soft, low-detail "painting" look reported in #141. More steps + a bit
    # more prompt adherence for real detail; still modest since LCM schedulers
    # are tuned for few steps and don't keep improving indefinitely.
    image = pipe(
        prompt=child_prompt,
        image=init_image,
        strength=0.55,
        negative_prompt="blurry, distorted, ugly, deformed, cartoon, anime, painting, illustration, airbrushed, soft focus",
        num_inference_steps=16,
        guidance_scale=1.8,
        generator=generator,
    ).images[0]

    buf = io.BytesIO()
    image.save(buf, format="JPEG", quality=92)
    return base64.b64encode(buf.getvalue()).decode()
