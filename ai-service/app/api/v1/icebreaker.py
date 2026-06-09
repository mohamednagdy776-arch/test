from fastapi import APIRouter
from app.models.schemas import IcebreakerRequest, IcebreakerResponse
from app.services import llm

router = APIRouter(tags=["icebreaker"])

_FALLBACK = [
    "What do you enjoy most about your work or studies?",
    "What values matter most to you in daily life?",
    "What are you hoping to build together in a marriage?",
]


@router.post("/icebreaker", response_model=IcebreakerResponse)
def generate_icebreaker(req: IcebreakerRequest) -> IcebreakerResponse:
    """Generate 3 respectful conversation starters for a new match."""
    # Symmetric cache: same result regardless of who is A vs B
    cache_prefix = "ice:" + ":".join(sorted([req.user_a_id, req.user_b_id]))

    context_parts = [p for p in [
        req.user_b_country,
        req.user_b_occupation,
        (", ".join(req.shared_interests[:3]) + " (shared interests)") if req.shared_interests else None,
    ] if p]
    context = "; ".join(context_parts) if context_parts else "general"

    prompt = (
        f"Muslim marriage platform. Generate 3 respectful, halal conversation starters "
        f"for two people with a {req.score:.0f}/100 compatibility score.\n"
        f"Context about the other person: {context}.\n"
        f"Rules: each starter under 20 words, no personal or inappropriate questions, "
        f"positive tone. Output only the 3 starters, one per line, no numbering."
    )

    text = llm.ask(prompt, cache_prefix=cache_prefix, max_tokens=140)
    if not text:
        return IcebreakerResponse(starters=_FALLBACK)

    lines = [l.strip().lstrip("•-*123.) ") for l in text.splitlines() if l.strip()]
    starters = [l for l in lines if 8 < len(l) < 200][:3]
    return IcebreakerResponse(starters=starters or _FALLBACK)
