"""Unit tests for the scoring module."""

import pytest
from app.models.schemas import UserProfile, MatchRequest
from app.services.scoring import calculate_compatibility
from app.services.features import (
    extract_religious_score,
    extract_lifestyle_score,
    extract_interests_score,
    extract_location_score,
    extract_other_score,
)


def make_user(**kwargs) -> UserProfile:
    defaults = {
        "user_id": "test-user",
        "sect": "sunni",
        "prayer_level": 4.0,
        "religious_commitment": 4.0,
        "cultural_level": 3.0,
        "lifestyle_type": "moderate",
        "interests": ["reading", "travel"],
        "age": 28,
        "country": "Egypt",
        "city": "Cairo",
        "children_count": 0,
        "wants_children": True,
    }
    defaults.update(kwargs)
    return UserProfile(**defaults)


class TestReligiousScore:
    def test_same_sect_high_prayer(self):
        user_a = make_user(sect="sunni", prayer_level=5.0, religious_commitment=5.0)
        user_b = make_user(
            user_id="b", sect="sunni", prayer_level=5.0, religious_commitment=5.0
        )
        score, reason = extract_religious_score(user_a, user_b)
        assert score > 0.8
        assert reason is not None

    def test_different_sect(self):
        user_a = make_user(sect="sunni")
        user_b = make_user(user_id="b", sect="shia")
        score, _ = extract_religious_score(user_a, user_b)
        assert score < 0.5

    def test_none_values(self):
        user_a = make_user(sect=None, prayer_level=None)
        user_b = make_user(user_id="b", sect=None, prayer_level=None)
        score, _ = extract_religious_score(user_a, user_b)
        assert 0.0 <= score <= 1.0


class TestLifestyleScore:
    def test_same_lifestyle(self):
        user_a = make_user(lifestyle_type="active", cultural_level=4.0)
        user_b = make_user(user_id="b", lifestyle_type="active", cultural_level=4.0)
        score, reason = extract_lifestyle_score(user_a, user_b)
        assert score > 0.7

    def test_different_lifestyle(self):
        user_a = make_user(lifestyle_type="active")
        user_b = make_user(user_id="b", lifestyle_type="relaxed")
        score, _ = extract_lifestyle_score(user_a, user_b)
        assert score < 0.7


class TestInterestsScore:
    def test_identical_interests(self):
        user_a = make_user(interests=["reading", "travel", "cooking"])
        user_b = make_user(user_id="b", interests=["reading", "travel", "cooking"])
        score, reason = extract_interests_score(user_a, user_b)
        assert score == 1.0
        assert reason is not None

    def test_no_overlap(self):
        user_a = make_user(interests=["reading", "travel"])
        user_b = make_user(user_id="b", interests=["sports", "gaming"])
        score, _ = extract_interests_score(user_a, user_b)
        assert score == 0.0

    def test_partial_overlap(self):
        user_a = make_user(interests=["reading", "travel", "cooking"])
        user_b = make_user(user_id="b", interests=["reading", "sports"])
        score, _ = extract_interests_score(user_a, user_b)
        assert 0.0 < score < 1.0


class TestLocationScore:
    def test_same_city(self):
        user_a = make_user(country="Egypt", city="Cairo")
        user_b = make_user(user_id="b", country="Egypt", city="Cairo")
        score, reason = extract_location_score(user_a, user_b)
        assert score == 1.0

    def test_same_country_diff_city(self):
        user_a = make_user(country="Egypt", city="Cairo")
        user_b = make_user(user_id="b", country="Egypt", city="Alexandria")
        score, reason = extract_location_score(user_a, user_b)
        assert 0.5 < score < 1.0

    def test_different_country(self):
        user_a = make_user(country="Egypt", city="Cairo")
        user_b = make_user(user_id="b", country="Saudi Arabia", city="Riyadh")
        score, _ = extract_location_score(user_a, user_b)
        assert score < 0.5


class TestOtherScore:
    def test_close_age_same_children_pref(self):
        user_a = make_user(age=28, wants_children=True)
        user_b = make_user(user_id="b", age=27, wants_children=True)
        score, reason = extract_other_score(user_a, user_b)
        assert score > 0.7

    def test_large_age_gap(self):
        user_a = make_user(age=25)
        user_b = make_user(user_id="b", age=50)
        score, _ = extract_other_score(user_a, user_b)
        assert score < 0.5


class TestFullCompatibility:
    def test_highly_compatible(self):
        user_a = make_user()
        user_b = make_user(user_id="b")
        result = calculate_compatibility(user_a, user_b)
        assert result.compatibilityScore > 50
        assert len(result.matchReasons) > 0

    def test_score_range(self):
        user_a = make_user()
        user_b = make_user(
            user_id="b",
            sect="shia",
            lifestyle_type="relaxed",
            interests=["sports"],
            country="USA",
            city="New York",
            age=50,
        )
        result = calculate_compatibility(user_a, user_b)
        assert 0 <= result.compatibilityScore <= 100
