"""Match ranking engine - sorts and filters candidates by compatibility."""

from typing import List, Tuple
from ..models.schemas import UserProfile, MatchResponse
from .scoring import calculate_compatibility


def rank_candidates(
    target: UserProfile,
    candidates: List[UserProfile],
    top_n: int = 20,
    min_score: float = 30.0,
) -> List[Tuple[UserProfile, MatchResponse]]:
    """Rank candidates against a target user by compatibility score.

    Args:
        target: The user to match against
        candidates: List of potential matches
        top_n: Maximum number of results to return
        min_score: Minimum compatibility score threshold (0-100)

    Returns:
        List of (candidate, match_response) tuples sorted by score descending
    """
    scored: List[Tuple[UserProfile, MatchResponse]] = []

    for candidate in candidates:
        if candidate.user_id == target.user_id:
            continue

        result = calculate_compatibility(target, candidate)
        if result.compatibilityScore >= min_score:
            scored.append((candidate, result))

    scored.sort(key=lambda x: x[1].compatibilityScore, reverse=True)
    return scored[:top_n]


def batch_rank(
    users: List[UserProfile],
    top_n: int = 20,
    min_score: float = 30.0,
) -> dict[str, List[Tuple[str, float]]]:
    """Precompute top matches for all users.

    Args:
        users: List of all user profiles
        top_n: Number of top matches per user
        min_score: Minimum compatibility score

    Returns:
        Dict mapping user_id to list of (candidate_id, score) tuples
    """
    results: dict[str, List[Tuple[str, float]]] = {}

    for user in users:
        matches = rank_candidates(user, users, top_n, min_score)
        results[user.user_id] = [
            (candidate.user_id, match.compatibilityScore)
            for candidate, match in matches
        ]

    return results


def get_match_explanation(
    user_a: UserProfile,
    user_b: UserProfile,
    match_response: MatchResponse,
) -> dict:
    """Generate a detailed explanation of why two users match.

    Returns:
        Dict with score breakdown and human-readable reasons
    """
    return {
        "overall_score": match_response.compatibilityScore,
        "reasons": match_response.matchReasons,
        "compatibility_level": _score_to_level(match_response.compatibilityScore),
    }


def _score_to_level(score: float) -> str:
    """Convert numeric score to human-readable compatibility level."""
    if score >= 90:
        return "Excellent match"
    elif score >= 75:
        return "Strong match"
    elif score >= 60:
        return "Good match"
    elif score >= 45:
        return "Moderate match"
    else:
        return "Low compatibility"
