from __future__ import annotations
import base64, io, logging, os
import httpx
import torch
from diffusers import DiffusionPipeline, LCMScheduler
from PIL import Image

log = logging.getLogger(__name__)

OLLAMA_URL  = os.environ.get("OLLAMA_URL", "http://ollama:11434")
VISION_MODEL = "gemma3:4b"
HF_CACHE    = os.environ.get("HF_HOME", "/app/model-cache")
_pipe       = None


def _load_pipe() -> DiffusionPipeline:
    global _pipe
    if _pipe is not None:
        return _pipe
    os.makedirs(HF_CACHE, exist_ok=True)
    _pipe = DiffusionPipeline.from_pretrained(
        "SimianLuo/LCM_Dreamshaper_v7",
        cache_dir=HF_CACHE,
        torch_dtype=torch.float32,
        safety_checker=None,
        requires_safety_checker=False,
    )
    _pipe.scheduler = LCMScheduler.from_config(_pipe.scheduler.config)
    _pipe.to("cpu")
    return _pipe


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

    pipe = _load_pipe()
    image = pipe(
        prompt=child_prompt,
        negative_prompt="blurry, distorted, ugly, deformed, cartoon, anime, painting",
        num_inference_steps=8,
        guidance_scale=0.0,
        width=512,
        height=512,
    ).images[0]

    buf = io.BytesIO()
    image.save(buf, format="JPEG", quality=92)
    return base64.b64encode(buf.getvalue()).decode()
