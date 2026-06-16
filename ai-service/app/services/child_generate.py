"""
AI child image prediction pipeline (zero disk I/O):
  Step 1 – gemma3:4b (Ollama vision) analyses both parent photos and writes
            a detailed description of the predicted child.
  Step 2 – Stable Diffusion LCM generates a wholly new portrait image from
            that description (CPU inference, ~2-3 min).
"""
from __future__ import annotations
import base64, io, os
import httpx
import torch
from diffusers import DiffusionPipeline, LCMScheduler

OLLAMA_URL = os.environ.get("OLLAMA_URL", "http://ollama:11434")
VISION_MODEL = "gemma3:4b"
HF_CACHE = os.environ.get("HF_HOME", "/app/model-cache")

_pipe = None


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


def _describe_child(p1_b64: str, p2_b64: str) -> str:
    """Ask Ollama vision model to describe the predicted child's appearance."""
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
    r.raise_for_status()
    return r.json()["response"].strip()


def predict_child(p1_b64: str, p2_b64: str) -> str:
    """Generate a child portrait from two parent images. Zero disk writes."""
    p1 = _clean(p1_b64)
    p2 = _clean(p2_b64)

    # Step 1: vision LLM → child description prompt
    child_prompt = _describe_child(p1, p2)

    # Step 2: Stable Diffusion LCM → new image
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
