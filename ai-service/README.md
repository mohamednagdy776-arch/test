# AI Service

FastAPI microservice handling the Tayyibt matchmaking and recommendation engine.

## Stack

- Framework: FastAPI (Python)
- ML: scikit-learn / custom scoring (Phase 1), ML models (Phase 2)
- Cache: Redis (match results, frequent queries)
- Communication: Internal HTTP API called by the backend

## Folder Structure

```
ai-service/
├── app/
│   ├── api/                # FastAPI route handlers
│   │   └── v1/
│   │       ├── matching.py # POST /match, GET /score
│   │       └── health.py   # Health check
│   ├── core/               # Config, settings, startup
│   ├── models/             # Pydantic request/response schemas
│   ├── services/           # Scoring and ranking logic
│   │   ├── scoring.py      # Weighted compatibility scoring
│   │   ├── ranking.py      # Match ranking engine
│   │   └── features.py     # Feature extraction from profiles
│   ├── utils/              # Helpers, normalizers
│   └── main.py             # App entry point
├── tests/                  # Unit tests for scoring logic
├── requirements.txt
├── Dockerfile
└── .env
```

## Scoring Model

```
Final Score =
  (religious_score  * 0.30) +
  (lifestyle_score  * 0.25) +
  (interests_score  * 0.20) +
  (location_score   * 0.15) +
  (other_score      * 0.10)
```

## API Response Format

```json
{
  "compatibilityScore": 87,
  "matchReasons": ["Similar religious values", "Compatible lifestyle"]
}
```

## Standards

- Response time target: < 200ms
- Cache results in Redis
- Never expose internal scoring weights in public responses
- Weights must be configurable via config/env — never hardcoded
- Handle missing profile fields gracefully (partial scoring)
- Follow `ai-matching-logic.md` for full algorithm spec
