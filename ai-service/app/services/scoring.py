"""
Compatibility scoring engine.

Flow:
  1. Rule-based score (instant, no LLM) — deterministic 0-100
  2. LLM reasons (Gemma via Ollama, cached per user-pair) — only when score >= 40
     Falls back to rule-generated reasons if LLM is unavailable.
"""
from app.models.schemas import UserProfile, MatchResponse
from app.services.features import (
    extract_religious_score,
    extract_lifestyle_score,
    extract_interests_score,
    extract_location_score,
    extract_other_score,
)
from app.core.config import settings
from app.services import llm


def _is_same_gender(a: UserProfile, b: UserProfile) -> bool:
    if not a.gender or not b.gender:
        return False
    male   = {"male", "ذكر", "m"}
    female = {"female", "أنثى", "f"}
    ag = a.gender.strip().lower()
    bg = b.gender.strip().lower()
    return (ag in male and bg in male) or (ag in female and bg in female)


def _pct(x: float) -> float:
    """Clamp a 0-1 sub-score to a 0-100 percentage."""
    return round(max(0.0, min(1.0, x)) * 100, 1)


def _rule_based(a: UserProfile, b: UserProfile):
    """Pure rule-based score — fast, no network calls."""
    religious, r1 = extract_religious_score(a, b)
    lifestyle,  r2 = extract_lifestyle_score(a, b)
    interests,  r3 = extract_interests_score(a, b)
    location,   r4 = extract_location_score(a, b)
    other,      r5 = extract_other_score(a, b)

    score = min(100.0, (
        religious * settings.WEIGHT_RELIGIOUS +
        lifestyle * settings.WEIGHT_LIFESTYLE +
        interests * settings.WEIGHT_INTERESTS +
        location  * settings.WEIGHT_LOCATION +
        other     * settings.WEIGHT_OTHER
    ) * 100)

    breakdown = {
        "religious": _pct(religious),
        "lifestyle": _pct(lifestyle),
        "interests": _pct(interests),
        "location":  _pct(location),
        "other":     _pct(other),
    }

    reasons = r1 + r2 + r3 + r4 + r5
    return round(score, 1), reasons, breakdown


def _llm_reasons(a: UserProfile, b: UserProfile, score: float) -> list[str] | None:
    """
    Ask Gemma for 2-3 concise match-reason bullets.
    Cache key is symmetric (same regardless of who is A vs B).
    Returns None when Ollama is unavailable — caller uses rule reasons instead.
    """
    cache_prefix = "reasons:" + ":".join(sorted([a.user_id, b.user_id]))

    # Sanitize user-controlled fields before interpolation: strip newlines and
    # cap length so a profile can't inject adversarial instructions (prompt
    # injection) into the matching engine.
    def s(v, n=40):
        return str(v).replace("\n", " ").replace("\r", " ").strip()[:n] if v else "?"

    prompt = (
        "Islamic marriage compatibility — give 2-3 short bullet points explaining "
        "the key compatibility factors between these profiles. Be direct, no intro.\n"
        f"A: {a.age or '?'}y {s(a.gender)}, sect={s(a.sect)}, "
        f"prayer={a.prayer_level or '?'}/5, {s(a.country)}, "
        f"lifestyle={s(a.lifestyle_type)}\n"
        f"B: {b.age or '?'}y {s(b.gender)}, sect={s(b.sect)}, "
        f"prayer={b.prayer_level or '?'}/5, {s(b.country)}, "
        f"lifestyle={s(b.lifestyle_type)}\n"
        f"Score: {score}/100"
    )

    text = llm.ask(prompt, cache_prefix=cache_prefix, max_tokens=120)
    if not text:
        return None

    lines = [l.lstrip("•-*·123.) ").strip() for l in text.splitlines() if l.strip()]
    bullets = [l for l in lines if len(l) > 8][:3]
    return bullets if bullets else None


def calculate_compatibility(a: UserProfile, b: UserProfile) -> MatchResponse:
    if _is_same_gender(a, b):
        return MatchResponse(
            compatibilityScore=0.0,
            matchReasons=["لا توافق - نفس الجنس", "Islamic matchmaking requires opposite-gender pairing"],
            breakdown={"religious": 0.0, "lifestyle": 0.0, "interests": 0.0, "location": 0.0, "other": 0.0},
        )

    score, rule_reasons, breakdown = _rule_based(a, b)

    # Only call LLM for viable matches — saves resources on poor matches
    llm_reasons = _llm_reasons(a, b, score) if score >= 40 else None

    reasons = llm_reasons or rule_reasons or ["Potential compatibility"]
    return MatchResponse(compatibilityScore=score, matchReasons=reasons, breakdown=breakdown)
