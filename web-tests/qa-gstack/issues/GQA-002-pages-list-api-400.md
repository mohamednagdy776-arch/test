# GQA-002: Pages list endpoints return 400 "Invalid identifier format"

| Field | Value |
|-------|-------|
| **Severity** | High |
| **Area** | Backend / Pages |
| **Route(s)** | `/pages` (web) → `GET /api/v1/pages/{created,suggested}` |
| **Status** | Confirmed (fresh request, valid Bearer token) |

## What happens
The Pages page loads but lists nothing. The list calls fail:

```
GET /api/v1/pages/created          → 400
GET /api/v1/pages/suggested?limit=5 → 400

Body: {"success":false,"statusCode":400,"message":"Invalid identifier format"}
```

## Likely cause (not fixed — reporting only)
Same pattern as GQA-001: a `GET /pages/:id` route with UUID validation is
catching the literal segments `created` and `suggested`. Route ordering /
param-pipe issue in the pages controller.

## Reproduce
```bash
curl -s "https://145-14-158-100.sslip.io/api/v1/pages/created" \
  -H "Authorization: Bearer $TOK"   # → 400 Invalid identifier format
```

## Impact
Pages feature is non-functional — no created/suggested pages render.

> Report only — not fixed. Related: [[GQA-001-groups-list-api-400]].
