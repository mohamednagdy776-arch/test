from pydantic import BaseModel
from typing import Optional, List, Dict


class UserProfile(BaseModel):
    """Input profile for matching — all fields optional for partial scoring."""
    user_id: str

    # Religious
    sect: Optional[str] = None
    prayer_level: Optional[int] = None           # 0-5
    quran_memorization: Optional[int] = None     # 0-5
    religious_commitment: Optional[int] = None   # 0-5

    # Lifestyle
    cultural_level: Optional[int] = None         # 0-5
    lifestyle_type: Optional[str] = None         # conservative | moderate | open
    future_goals: Optional[str] = None

    # Interests
    interests: Optional[List[str]] = None

    # Demographics
    age: Optional[int] = None
    marital_status: Optional[str] = None
    children_count: Optional[int] = None
    education_level: Optional[int] = None        # 0-5
    gender: Optional[str] = None
    job_title: Optional[str] = None
    bio: Optional[str] = None

    # Location
    country: Optional[str] = None
    city: Optional[str] = None

    # Preferences
    wants_children: Optional[bool] = None
    willing_to_relocate: Optional[bool] = None
    preferred_country: Optional[str] = None


class MatchRequest(BaseModel):
    user_a: UserProfile
    user_b: UserProfile


class MatchResponse(BaseModel):
    compatibilityScore: float
    matchReasons: List[str]
    # Per-dimension sub-scores (0-100 each): religious, lifestyle, interests,
    # location, other. Lets the client show a REAL compatibility breakdown
    # instead of fabricating bars from the single total score (#741).
    breakdown: Optional[Dict[str, float]] = None


# ── Bio suggestion ─────────────────────────────────────────────────────────────

class BioRequest(BaseModel):
    age: Optional[int] = None
    gender: Optional[str] = None
    country: Optional[str] = None
    occupation: Optional[str] = None
    education: Optional[str] = None
    lifestyle: Optional[str] = None
    sect: Optional[str] = None
    interests: Optional[List[str]] = None
    language: str = "en"   # "en" | "ar"


class BioResponse(BaseModel):
    bio: str


# ── Icebreaker ─────────────────────────────────────────────────────────────────

class IcebreakerRequest(BaseModel):
    user_a_id: str
    user_b_id: str
    score: float
    shared_interests: Optional[List[str]] = None
    user_b_country: Optional[str] = None
    user_b_occupation: Optional[str] = None


class IcebreakerResponse(BaseModel):
    starters: List[str]


# ── Content moderation ────────────────────────────────────────────────────────

class ModerateRequest(BaseModel):
    content: str
    content_type: str = "post"   # post | comment | bio


class ModerateResponse(BaseModel):
    is_appropriate: bool
    reason: Optional[str] = None


# ── Profile tips ──────────────────────────────────────────────────────────────

class ProfileTipsRequest(BaseModel):
    profile: UserProfile


class ProfileTipsResponse(BaseModel):
    tips: List[str]
    completeness_score: int   # 0-100
