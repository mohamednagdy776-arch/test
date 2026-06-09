from app.models.schemas import UserProfile
from app.utils.normalizer import normalize, match_strings, match_lists
from typing import Tuple


def extract_religious_score(a: UserProfile, b: UserProfile) -> Tuple[float, list]:
    reasons = []
    # Normalize sect strings for case-insensitive comparison
    sect_a = a.sect.strip().lower() if a.sect else None
    sect_b = b.sect.strip().lower() if b.sect else None
    scores = [
        match_strings(sect_a, sect_b),
        normalize(a.prayer_level) * normalize(b.prayer_level) * 2,  # both high = good
        normalize(a.religious_commitment) * normalize(b.religious_commitment) * 2,
    ]
    score = sum(scores) / len(scores)
    if score > 0.7:
        reasons.append("Similar religious values")
    return score, reasons


def extract_lifestyle_score(a: UserProfile, b: UserProfile) -> Tuple[float, list]:
    reasons = []
    scores = [
        match_strings(a.lifestyle_type, b.lifestyle_type),
        normalize(a.cultural_level) * normalize(b.cultural_level) * 2,
    ]
    score = sum(scores) / len(scores)
    if score > 0.7:
        reasons.append("Compatible lifestyle")
    return score, reasons


def extract_interests_score(a: UserProfile, b: UserProfile) -> Tuple[float, list]:
    reasons = []
    score = match_lists(a.interests, b.interests)
    if score > 0.5:
        reasons.append("Shared interests")
    return score, reasons


def extract_location_score(a: UserProfile, b: UserProfile) -> Tuple[float, list]:
    reasons = []
    country_match = match_strings(a.country, b.country)
    city_match = match_strings(a.city, b.city)
    score = (country_match * 0.7) + (city_match * 0.3)
    if country_match == 1.0:
        reasons.append("Same country")
    return score, reasons


def extract_other_score(a: UserProfile, b: UserProfile) -> Tuple[float, list]:
    reasons = []
    scores = []

    # Age compatibility — closer ages score higher
    if a.age and b.age:
        age_diff = abs(a.age - b.age)
        scores.append(max(0.0, 1.0 - (age_diff / 20)))
    else:
        scores.append(0.5)

    # Children preference alignment
    if a.wants_children is not None and b.wants_children is not None:
        scores.append(1.0 if a.wants_children == b.wants_children else 0.0)
    else:
        scores.append(0.5)

    # Education level compatibility
    if a.education_level is not None and b.education_level is not None:
        edu_diff = abs(a.education_level - b.education_level)
        scores.append(max(0.0, 1.0 - (edu_diff / 10)))
    else:
        scores.append(0.5)

    score = sum(scores) / len(scores)
    if score > 0.7:
        reasons.append("Compatible life goals")
    return score, reasons


def extract_image_compatibility(a: UserProfile, b: UserProfile, image_a_path: str = None, image_b_path: str = None) -> Tuple[float, list]:
    """
    Extract compatibility features from profile images using AI vision analysis.
    Analyzes facial expressions, attire, and overall presentation for alignment.
    Returns a score and reasons.
    """
    reasons = []
    
    # If image paths are provided and NVIDIA API is available, analyze them
    # This is a placeholder for future image-based analysis integration
    # For now, returns neutral score
    if image_a_path and image_b_path:
        try:
            # Future: integrate with NVIDIA Vision API
            pass
        except Exception:
            pass
    
    return 0.5, reasons  # Neutral default