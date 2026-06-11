# GQA-004: Page-detail posts endpoint returns 404

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Area** | Backend / Pages |
| **Route(s)** | `/pages/{id}` (web) → `GET /api/v1/pages/{id}/posts?page=1&limit=20` |
| **Status** | Confirmed (fresh request, valid Bearer token) |

## What happens
```
GET /api/v1/pages/110e2521-454e-4008-8af9-d89882dc3070/posts?page=1&limit=20 → 404
```
The page-detail view loads but its posts feed is empty.

## Likely cause (not fixed — reporting only)
Either the `:id/posts` sub-route is not implemented/registered, or the parent
`/pages/:id` resolution fails first (see GQA-002 route-ordering). A valid page id
was used (pulled from the database), so the 404 points at the posts sub-route
itself rather than a missing page.

## Reproduce
```bash
curl -s -o /dev/null -w "%{http_code}\n" \
  "https://145-14-158-100.sslip.io/api/v1/pages/110e2521-454e-4008-8af9-d89882dc3070/posts?page=1&limit=20" \
  -H "Authorization: Bearer $TOK"   # → 404
```

## Impact
Page detail pages show no posts.

> Report only — not fixed.
