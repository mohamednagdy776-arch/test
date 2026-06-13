"""
Content moderation for posts, comments, and bios.

Fast path: keyword filter (no LLM, instant).
Slow path: Gemma judgment for borderline content (cached by content hash).
"""
import hashlib
from fastapi import APIRouter
from app.models.schemas import ModerateRequest, ModerateResponse
from app.services import llm

router = APIRouter(tags=["moderation"])

_BANNED_KEYWORDS = [
    "porn", "sex", "nude", "naked", "alcohol", "drugs", "beer", "wine",
    "خمر", "مخدرات", "جنس",
]


def _quick_filter(text: str) -> bool:
    """Returns False (block) if obvious violations found."""
    lower = text.lower()
    return not any(kw in lower for kw in _BANNED_KEYWORDS)


@router.post("/moderate", response_model=ModerateResponse)
def moderate_content(req: ModerateRequest) -> ModerateResponse:
    """Check whether content is appropriate for an Islamic marriage platform."""
    if not req.content or len(req.content.strip()) < 3:
        return ModerateResponse(is_appropriate=True)

    # Fast keyword check first
    if not _quick_filter(req.content):
        return ModerateResponse(
            is_appropriate=False,
            reason="Content violates Islamic community guidelines.",
        )

    # LLM check — cached by content hash so same content is only checked once.
    # Sanitize content_type (user-supplied) before it enters the prompt to block
    # prompt injection via that field.
    content_type = str(req.content_type or "post").replace("\n", " ").replace("\r", " ").strip()[:30]
    content_hash = hashlib.sha256(req.content.encode()).hexdigest()[:32]
    cache_prefix = f"mod:{content_type}:{content_hash}"

    prompt = (
        f"You moderate an Islamic marriage platform. "
        f"Is this {content_type} appropriate for the community? "
        f"Reply with YES or NO on the first line, then one short reason.\n"
        f'Content: "{req.content[:400]}"'
    )

    result = llm.ask(prompt, cache_prefix=cache_prefix, max_tokens=60)
    if not result:
        return ModerateResponse(is_appropriate=True)

    first_line = result.strip().splitlines()[0].upper()
    is_ok = first_line.startswith("YES")
    reason = None
    if not is_ok:
        lines = result.strip().splitlines()
        reason = lines[1].strip() if len(lines) > 1 else "Does not meet community standards."
    return ModerateResponse(is_appropriate=is_ok, reason=reason)
