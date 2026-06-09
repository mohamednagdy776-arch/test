# 06 — AI Service (FastAPI + Gemma 3)

## Purpose

A standalone FastAPI microservice that powers all AI features:
- Compatibility scoring (matchmaking)
- AI-generated match reasons
- Profile bio suggestions
- Conversation icebreakers
- Content moderation
- Profile completeness tips

It uses a **hybrid design**: deterministic rule-based scoring on the hot path, with a **local Gemma 3 4B LLM** (via Ollama) for natural-language generation. LLM calls are minimized and cached to keep server load low.

---

## Application Structure

```
ai-service/app/
├── main.py                 # FastAPI app + router registration + lifespan
├── core/
│   └── config.py           # Pydantic settings (weights, Ollama, cache)
├── models/
│   └── schemas.py          # Pydantic request/response models
├── services/
│   ├── scoring.py          # Compatibility scoring orchestration
│   ├── features.py         # Per-dimension feature extractors
│   ├── llm.py              # Ollama wrapper + Redis cache
│   └── ranking.py          # Candidate ranking helpers
├── api/v1/
│   ├── matching.py         # POST /match
│   ├── bio.py              # POST /bio-suggestion
│   ├── icebreaker.py       # POST /icebreaker
│   ├── moderate.py         # POST /moderate
│   ├── profile_tips.py     # POST /profile-tips
│   └── health.py           # GET /health
└── utils/
    └── normalizer.py       # Value normalization helpers
```

---

## Configuration (`core/config.py`)

```python
class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")
    DEBUG: bool = False
    REDIS_URL: str = "redis://localhost:6379"
    ALLOWED_ORIGINS: List[str] = ["*"]

    # Scoring weights — religious compatibility highest priority
    WEIGHT_RELIGIOUS: float = 0.35
    WEIGHT_LIFESTYLE: float = 0.25
    WEIGHT_OTHER:     float = 0.20   # age, children, education
    WEIGHT_LOCATION:  float = 0.12
    WEIGHT_INTERESTS: float = 0.08

    # Local LLM — Ollama + Gemma 3 4B
    OLLAMA_URL:   str = "http://ollama:11434"
    OLLAMA_MODEL: str = "gemma3:4b"
    LLM_MAX_TOKENS:  int   = 150
    LLM_TEMPERATURE: float = 0.3
    LLM_CACHE_TTL:   int   = 604800   # 7 days
```

The weights are overridable via environment variables.

---

## Endpoints

All under `/api/v1` (proxied as `/ai/api/v1` publicly). Health is at `/health` (publicly `/ai/health`).

### `POST /match`
Compatibility score between two users.
- **Request**: `{ user_a: UserProfile, user_b: UserProfile }`
- **Response**: `{ compatibilityScore: float (0–100), matchReasons: string[] }`
- Same-gender pairs → score `0`.

### `POST /bio-suggestion`
Generates a marriage-profile bio.
- **Request**: age, gender, country, occupation, education, lifestyle, sect, interests, `language` (`en`/`ar`).
- **Response**: `{ bio: string }`.

### `POST /icebreaker`
3 respectful conversation starters for a match.
- **Request**: user IDs, score, shared interests, other person's country/occupation.
- **Response**: `{ starters: string[] }` (exactly 3).

### `POST /moderate`
Checks content against Islamic community guidelines.
- **Request**: `{ content, content_type }`.
- **Response**: `{ is_appropriate: bool, reason?: string }`.
- Fast keyword filter first; LLM judgment for borderline content (cached by content hash).

### `POST /profile-tips`
Profile completeness guidance (pure rule-based, no LLM).
- **Request**: `{ profile: UserProfile }`.
- **Response**: `{ tips: string[], completeness_score: int (0–100) }`.

### `GET /health`
`{ "status": "ok", "service": "ai-service" }`.

---

## Scoring Algorithm

### 1. Rule-based score (instant)

Five feature extractors (`features.py`) each return a 0–1 sub-score:

| Extractor | Inputs |
|-----------|--------|
| `extract_religious_score` | sect match, prayer_level product, religious_commitment product |
| `extract_lifestyle_score` | lifestyle_type match, cultural_level product |
| `extract_interests_score` | interest list overlap (Jaccard) |
| `extract_location_score` | country (0.7) + city (0.3) match |
| `extract_other_score` | age proximity, wants_children alignment, education proximity |

Final score:
```
score = (religious*0.35 + lifestyle*0.25 + interests*0.08
         + location*0.12 + other*0.20) * 100
score = min(100, score)        # capped at 100
```

Missing values normalize to a neutral `0.5` so partial profiles still score.

### 2. LLM reasons (gated + cached)

Only when `score >= 40`:
- Build a short prompt with both profiles + the score.
- Call Ollama (`gemma3:4b`, ≤120 tokens).
- Cache the result in Redis for 7 days, keyed by a **symmetric** key (same regardless of A/B order).
- If Ollama is unavailable, fall back to rule-generated reasons.

This keeps the LLM off the hot path for poor matches and avoids recomputation.

---

## LLM Wrapper (`services/llm.py`)

```python
def ask(prompt, cache_prefix="gen", max_tokens=None):
    # 1. check Redis cache by md5(prompt)
    # 2. POST to {OLLAMA_URL}/api/generate with model + options
    # 3. cache the response for LLM_CACHE_TTL
    # 4. return text, or None if Ollama unavailable
```

Design principles:
- Every prompt is short (<200 input, <180 output tokens).
- Results cached by prompt hash → repeated calls cost nothing.
- Graceful degradation: returns `None` on timeout / model-not-ready, callers fall back.

`is_ready()` checks `/api/tags` to confirm the model is loaded (logged at startup).

---

## Resource Efficiency Summary

| Technique | Effect |
|-----------|--------|
| Rule-based hot path | No LLM call for scoring itself |
| Score gate (≥40) | LLM skipped for poor matches |
| Redis caching (7d) | Same pair/content never recomputed |
| Low `num_predict` (≤150) | Fast CPU inference |
| Symmetric cache keys | A↔B reuse the same cached reasons |
| Keyword pre-filter (moderation) | Most content resolved without LLM |
| Rule-only profile-tips | No LLM at all for tips |
