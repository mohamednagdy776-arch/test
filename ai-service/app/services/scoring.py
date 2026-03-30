from app.models.schemas import UserProfile, MatchResponse
from app.services.features import (
    extract_religious_score,
    extract_lifestyle_score,
    extract_interests_score,
    extract_location_score,
    extract_other_score,
)
from app.core.config import settings


def calculate_compatibility(user_a: UserProfile, user_b: UserProfile) -> MatchResponse:
    """
    Weighted compatibility scoring.
    All weights are configurable via settings — never hardcoded.
    """
    religious, r1 = extract_religious_score(user_a, user_b)
    lifestyle, r2 = extract_lifestyle_score(user_a, user_b)
    interests, r3 = extract_interests_score(user_a, user_b)
    location, r4 = extract_location_score(user_a, user_b)
    other, r5 = extract_other_score(user_a, user_b)

    final_score = (
        religious  * settings.WEIGHT_RELIGIOUS +
        lifestyle  * settings.WEIGHT_LIFESTYLE +
        interests  * settings.WEIGHT_INTERESTS +
        location   * settings.WEIGHT_LOCATION +
        other      * settings.WEIGHT_OTHER

    )

    # Combine all match reasons
    reasons = r1 + r2 + r3 + r4 + r5

    return MatchResponse(
        compatibilityScore=round(final_score * 100, 1),
        matchReasons=reasons if reasons else ["Potential compatibility"],
    )
