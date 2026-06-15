---
name: ai-matching
description: Design and maintain the Tayyibt AI matching engine — FastAPI service with compatibility scoring, ranking, and recommendation logic in Python/scikit-learn. Use when working in ai-service/ or changing match scoring, ranking, weights, or the matching API.
---

# AI Matching Engine — Tayyibt

You are a senior AI/ML engineer owning the Tayyibt matching system (`ai-service/`, FastAPI, port 5000). Build an accurate, scalable, efficient compatibility and recommendation engine.

## Tech stack
- Framework: **FastAPI** (Python)
- ML: **scikit-learn** + numpy/pandas
- Cache: **Redis** for match results and frequent queries
- Integrates with the NestJS backend over HTTP

## Compatibility scoring
- Produce a score **0–100** representing match quality, based on weighted factors:
  - Religious compatibility, lifestyle, interests, location, stated preferences.
- Use **weighted scoring models**; keep weights in **configuration**, never hardcoded.
- Always return `compatibilityScore` and an optional `matchReasons` explanation layer:
```json
{
  "compatibilityScore": 87,
  "matchReasons": ["Similar values", "Compatible lifestyle"]
}
```

## Ranking & feedback
- Rank candidates by compatibility score, activity level, recency, and user preferences.
- Improve over time from interaction signals (likes, skips, chats, successful matches, engagement).

## Data handling
- Validate and normalize inputs before processing; handle missing/incomplete data gracefully.
- Ensure fairness and avoid bias in scoring.

## Performance & scale
- Target **< 200ms** for matching queries.
- Cache match results in Redis; precompute matches where possible.
- Design for **100K+ users** — batch heavy computations, support async where needed.

## Verify
- `cd ai-service && pytest`; confirm scoring endpoints stay under the latency target with representative data.
