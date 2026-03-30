from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    DEBUG: bool = False
    REDIS_URL: str = "redis://localhost:6379"
    ALLOWED_ORIGINS: List[str] = ["*"]

    # Scoring weights — configurable via env, never hardcoded
    WEIGHT_RELIGIOUS: float = 0.30
    WEIGHT_LIFESTYLE: float = 0.25
    WEIGHT_INTERESTS: float = 0.20
    WEIGHT_LOCATION: float = 0.15
    WEIGHT_OTHER: float = 0.10

    class Config:
        env_file = ".env"


settings = Settings()
