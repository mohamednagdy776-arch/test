"""
Profile completeness tips — pure rule-based, no LLM.
Tells users which fields to fill in to improve their match quality.
"""
from fastapi import APIRouter
from app.models.schemas import ProfileTipsRequest, ProfileTipsResponse

router = APIRouter(tags=["profile"])

_FIELD_TIPS = [
    ("sect",                 "Add your sect to improve religious compatibility matching."),
    ("prayer_level",         "Set your prayer level — it's the top factor in religious matching."),
    ("religious_commitment", "Add your religious commitment level for better matches."),
    ("lifestyle_type",       "Set your lifestyle type (conservative / moderate / open)."),
    ("interests",            "Add interests to find people with shared hobbies."),
    ("age",                  "Add your age — age compatibility is a key matching factor."),
    ("country",              "Add your country to find nearby matches."),
    ("city",                 "Add your city to narrow down local matches."),
    ("wants_children",       "Specify whether you want children — avoids incompatible matches."),
    ("education_level",      "Add your education level for better compatibility scoring."),
    ("willing_to_relocate",  "Let matches know if you're open to relocating."),
    ("bio",                  "Write a bio — profiles with bios get significantly more attention."),
]


def _completeness(profile) -> int:
    filled = sum(
        1 for field, _ in _FIELD_TIPS
        if getattr(profile, field, None) not in (None, [], "")
    )
    return round(filled / len(_FIELD_TIPS) * 100)


@router.post("/profile-tips", response_model=ProfileTipsResponse)
def get_profile_tips(req: ProfileTipsRequest) -> ProfileTipsResponse:
    """Return actionable tips for fields that are missing from the profile."""
    profile = req.profile
    missing_tips = [
        tip
        for field, tip in _FIELD_TIPS
        if getattr(profile, field, None) in (None, [], "")
    ]
    score = _completeness(profile)
    return ProfileTipsResponse(tips=missing_tips[:5], completeness_score=score)
