from fastapi import APIRouter
from app.models.schemas import BioRequest, BioResponse
from app.services import llm

router = APIRouter(tags=["bio"])

_FALLBACK = (
    "I am a practicing Muslim seeking a righteous life partner who shares my values "
    "and commitment to building a halal home. I value honesty, kindness, and a strong "
    "connection to faith in daily life."
)


@router.post("/bio-suggestion", response_model=BioResponse)
def suggest_bio(req: BioRequest) -> BioResponse:
    """Generate a short marriage profile bio based on user details."""
    # Sanitize user-controlled fields (strip newlines, cap length) before they
    # go into the LLM prompt — prevents prompt injection via profile fields.
    def s(v, n=60):
        return str(v).replace("\n", " ").replace("\r", " ").strip()[:n] if v else None

    interests_str = ", ".join(s(i, 30) or "" for i in req.interests[:5]) if req.interests else ""
    lang_note = "Write in Arabic (Modern Standard Arabic)." if req.language == "ar" else "Write in English."
    parts = [p for p in [
        f"{req.age}y" if req.age else None,
        s(req.gender),
        s(req.country),
        s(req.occupation),
        s(req.education),
        f"{s(req.lifestyle)} lifestyle" if req.lifestyle else None,
        s(req.sect),
        f"interests: {interests_str}" if interests_str else None,
    ] if p]

    prompt = (
        f"Write a genuine, warm Muslim marriage profile bio (3-4 sentences). "
        f"Profile: {', '.join(parts) or 'not provided'}. "
        f"Tone: sincere, grounded in Islamic values, no clichés. {lang_note} "
        f"Output only the bio text, nothing else."
    )

    result = llm.ask(prompt, cache_prefix="bio", max_tokens=180)
    return BioResponse(bio=result or _FALLBACK)
