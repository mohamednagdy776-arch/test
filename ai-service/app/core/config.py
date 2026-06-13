from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")
    DEBUG: bool = False
    REDIS_URL: str = "redis://localhost:6379"
    # Deny browser cross-origin by default. The AI service is internal
    # (backend calls it server-to-server, which CORS doesn't gate); set
    # explicit origins via env only if it is ever exposed to a browser.
    ALLOWED_ORIGINS: List[str] = []

    # Scoring weights — religious compatibility is highest priority in Islamic matchmaking
    WEIGHT_RELIGIOUS: float = 0.35
    WEIGHT_LIFESTYLE: float = 0.25
    WEIGHT_OTHER: float = 0.20    # age, children, education
    WEIGHT_LOCATION: float = 0.12
    WEIGHT_INTERESTS: float = 0.08

    # Local LLM — Ollama + Gemma 3 4B
    OLLAMA_URL: str = "http://ollama:11434"
    OLLAMA_MODEL: str = "gemma3:4b"
    # Arabic is token-dense; 150 truncated 2-sentence reasons mid-word.
    LLM_MAX_TOKENS: int = 400
    LLM_TEMPERATURE: float = 0.3   # low = consistent, focused output
    LLM_CACHE_TTL: int = 604800    # 7 days — match reasons rarely change



settings = Settings()
