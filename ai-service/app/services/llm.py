"""
Thin Ollama wrapper with Redis caching.

Design principles:
  - Every prompt is short (< 200 input tokens, < 180 output tokens)
  - Results cached by prompt hash so repeated calls cost nothing
  - Graceful degradation: returns None on timeout / model not ready
"""
import hashlib
import httpx
import redis as redis_lib
from app.core.config import settings

_redis_client = None


def _get_redis():
    global _redis_client
    if _redis_client is None:
        try:
            _redis_client = redis_lib.from_url(settings.REDIS_URL, decode_responses=True)
            _redis_client.ping()
        except Exception:
            _redis_client = None
    return _redis_client


def _key(prefix: str, text: str) -> str:
    return f"llm:{prefix}:{hashlib.sha256(text.encode()).hexdigest()}"


def ask(prompt: str, cache_prefix: str = "gen", max_tokens: int | None = None) -> str | None:
    """
    Send a prompt to the local Gemma model via Ollama.
    Returns the response string, or None if the model is unavailable.
    Results are cached in Redis for LLM_CACHE_TTL seconds.
    """
    max_tok = max_tokens or settings.LLM_MAX_TOKENS
    cache_key = _key(cache_prefix, prompt)

    r = _get_redis()
    if r:
        try:
            cached = r.get(cache_key)
            if cached:
                return cached
        except Exception:
            pass

    try:
        resp = httpx.post(
            f"{settings.OLLAMA_URL}/api/generate",
            json={
                "model": settings.OLLAMA_MODEL,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "num_predict": max_tok,
                    "temperature": settings.LLM_TEMPERATURE,
                    "top_p": 0.9,
                    "repeat_penalty": 1.1,
                },
            },
            timeout=60,
        )
        resp.raise_for_status()
        text = resp.json().get("response", "").strip()
        if text and r:
            try:
                r.setex(cache_key, settings.LLM_CACHE_TTL, text)
            except Exception:
                pass
        return text or None
    except Exception as e:
        print(f"[llm] Ollama unavailable ({type(e).__name__}): {e}")
        return None


def is_ready() -> bool:
    """Check whether Ollama has the model loaded and ready."""
    try:
        r = httpx.get(f"{settings.OLLAMA_URL}/api/tags", timeout=5)
        models = [m["name"] for m in r.json().get("models", [])]
        return any(settings.OLLAMA_MODEL.split(":")[0] in m for m in models)
    except Exception:
        return False
