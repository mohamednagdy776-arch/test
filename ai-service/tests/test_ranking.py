"""Unit tests for the ranking module."""

import pytest
from app.models.schemas import UserProfile
from app.services.ranking import (
    rank_candidates,
    batch_rank,
    get_match_explanation,
    _score_to_level,
)
from app.services.scoring import calculate_compatibility


def make_user(user_id: str = "test", **kwargs) -> UserProfile:
    defaults = {
        "user_id": user_id,
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


class TestRankCandidates:
    def test_returns_sorted_results(self):
        target = make_user("target")
        candidates = [
            make_user("c1", sect="shia", country="USA"),
            make_user("c2"),
            make_user("c3", interests=["reading", "travel", "cooking"]),
        ]
        results = rank_candidates(target, candidates, top_n=10)
        scores = [r[1].compatibilityScore for r in results]
        assert scores == sorted(scores, reverse=True)

    def test_excludes_self(self):
        target = make_user("target")
        candidates = [target, make_user("other")]
        results = rank_candidates(target, candidates)
        ids = [r[0].user_id for r in results]
        assert "target" not in ids

    def test_respects_top_n(self):
        target = make_user("target")
        candidates = [make_user(f"c{i}") for i in range(50)]
        results = rank_candidates(target, candidates, top_n=5)
        assert len(results) <= 5

    def test_respects_min_score(self):
        target = make_user("target")
        candidates = [
            make_user(
                "c1", sect="shia", country="USA", interests=["x"], lifestyle_type="x"
            ),
            make_user("c2"),
        ]
        results = rank_candidates(target, candidates, min_score=80.0)
        for _, match in results:
            assert match.compatibilityScore >= 80.0


class TestBatchRank:
    def test_returns_dict(self):
        users = [make_user(f"u{i}") for i in range(3)]
        results = batch_rank(users, top_n=2)
        assert isinstance(results, dict)
        assert len(results) == 3

    def test_no_self_matches(self):
        users = [make_user(f"u{i}") for i in range(3)]
        results = batch_rank(users, top_n=10)
        for user_id, matches in results.items():
            match_ids = [m[0] for m in matches]
            assert user_id not in match_ids


class TestScoreToLevel:
    def test_excellent(self):
        assert _score_to_level(95) == "Excellent match"

    def test_strong(self):
        assert _score_to_level(80) == "Strong match"

    def test_good(self):
        assert _score_to_level(65) == "Good match"

    def test_moderate(self):
        assert _score_to_level(50) == "Moderate match"

    def test_low(self):
        assert _score_to_level(30) == "Low compatibility"


class TestMatchExplanation:
    def test_returns_dict(self):
        user_a = make_user("a")
        user_b = make_user("b")
        match = calculate_compatibility(user_a, user_b)
        explanation = get_match_explanation(user_a, user_b, match)
        assert "overall_score" in explanation
        assert "reasons" in explanation
        assert "compatibility_level" in explanation
