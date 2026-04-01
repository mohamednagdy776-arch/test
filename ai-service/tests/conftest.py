"""Shared test fixtures."""

import pytest
from app.models.schemas import UserProfile


@pytest.fixture
def sample_user_a() -> UserProfile:
    return UserProfile(
        user_id="user-a",
        sect="sunni",
        prayer_level=4.0,
        religious_commitment=4.0,
        cultural_level=3.0,
        lifestyle_type="moderate",
        interests=["reading", "travel", "cooking"],
        age=28,
        country="Egypt",
        city="Cairo",
        children_count=0,
        wants_children=True,
    )


@pytest.fixture
def sample_user_b() -> UserProfile:
    return UserProfile(
        user_id="user-b",
        sect="sunni",
        prayer_level=3.0,
        religious_commitment=3.0,
        cultural_level=4.0,
        lifestyle_type="active",
        interests=["reading", "sports", "travel"],
        age=26,
        country="Egypt",
        city="Alexandria",
        children_count=0,
        wants_children=True,
    )
