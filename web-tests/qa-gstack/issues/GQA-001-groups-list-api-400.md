# GQA-001: Groups list endpoints return 400 "Invalid identifier format"

| Field | Value |
|-------|-------|
| **Severity** | High |
| **Area** | Backend / Groups |
| **Route(s)** | `/groups` (web) → `GET /api/v1/groups/{public,private,suggested,pending}` |
| **Status** | Confirmed (fresh request, valid Bearer token) |

## What happens
The Groups page loads its shell but shows no groups. Every groups list call fails:

```
GET /api/v1/groups/public?page=1&limit=20&category=  → 400
GET /api/v1/groups/private?page=1&limit=20           → 400
GET /api/v1/groups/suggested?limit=5                 → 400
GET /api/v1/groups/pending                           → 400

Body: {"success":false,"statusCode":400,"message":"Invalid identifier format"}
```

## Likely cause (not fixed — reporting only)
"Invalid identifier format" is a UUID-validation rejection. A `GET /groups/:id`
route whose `:id` is validated as a UUID is matching the literal segments
`public` / `private` / `suggested` / `pending` and rejecting them. This is a
**route-ordering / param-pipe** problem in the groups controller: the static
routes must be declared before (or excluded from) the `:id` route.

## Reproduce
```bash
TOK=$(curl -s -X POST https://145-14-158-100.sslip.io/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@tayyibt.com","password":"Test1234"}' \
  | grep -oE '"accessToken":"[^"]+"' | sed 's/.*://;s/"//g')
curl -s "https://145-14-158-100.sslip.io/api/v1/groups/public?page=1&limit=20" \
  -H "Authorization: Bearer $TOK"
# → 400 Invalid identifier format
```

## Impact
Groups feature is non-functional — users cannot browse, discover, or see pending groups.

> Report only — not fixed.
