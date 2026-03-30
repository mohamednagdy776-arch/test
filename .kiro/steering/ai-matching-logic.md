# AI Matching Logic

## Overview

- Phase 1: Rule-based weighted scoring
- Phase 2: Hybrid (rule-based + ML with behavioral learning)

Each user pair receives a Compatibility Score (0–100).

---

## Weight Distribution

| Category       | Weight |
|----------------|--------|
| Religious      | 30%    |
| Lifestyle      | 25%    |
| Interests      | 20%    |
| Location       | 15%    |
| Other Factors  | 10%    |

---

## Scoring Formula

```
Final Score =
  (religious_score  * 0.30) +
  (lifestyle_score  * 0.25) +
  (interests_score  * 0.20) +
  (location_score   * 0.15) +
  (other_score      * 0.10)
```

Each category score is normalized between 0 and 1 before applying weights.

---

## Feature Categories

- Religious: sect, prayer level, Quran memorization, commitment level
- Lifestyle: cultural level, lifestyle type (conservative/moderate/open), future goals
- Interests: sports, social activities, travel, cultural interests
- Demographics: age diff, marital status, children count, education
- Location: country, city, distance
- Preferences: desire for children, relocation willingness, preferred country
- Health: general compatibility (Phase 2, consent-based)

---

## API Response Format

```json
{
  "compatibilityScore": 87,
  "matchReasons": [
    "Similar religious values",
    "Compatible lifestyle"
  ]
}
```

---

## Performance Requirements

- Response time: < 200ms for matching queries
- Cache match results in Redis
- Precompute matches where possible
- Batch processing for heavy computations
- Designed for 100K+ users

---

## Algorithm Rules

- Use weighted scoring models with configurable weights (no hardcoding)
- Keep logic modular and adjustable
- Ensure fairness — avoid bias
- Normalize all inputs before processing
- Handle missing/incomplete data gracefully
- Do NOT expose internal scoring logic in public APIs
