from typing import Optional


def normalize(value: Optional[float], min_val: float = 0, max_val: float = 5) -> float:
    """Normalize a value to 0-1 range. Returns 0.5 if value is missing (neutral)."""
    if value is None:
        return 0.5
    return max(0.0, min(1.0, (value - min_val) / (max_val - min_val)))


def match_strings(a: Optional[str], b: Optional[str]) -> float:
    """Returns 1.0 if strings match, 0.5 if either is missing, 0.0 if different."""
    if a is None or b is None:
        return 0.5
    return 1.0 if a.lower() == b.lower() else 0.0


def match_lists(a: Optional[list], b: Optional[list]) -> float:
    """Returns overlap ratio between two lists. Returns 0.5 if either is missing."""
    if not a or not b:
        return 0.5
    overlap = len(set(a) & set(b))
    total = len(set(a) | set(b))
    return overlap / total if total > 0 else 0.5
