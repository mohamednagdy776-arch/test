# GQA-003: Profile-by-username `/users/{username}` returns 400

| Field | Value |
|-------|-------|
| **Severity** | High |
| **Area** | Backend / Profiles |
| **Route(s)** | `/[username]` (web, e.g. `/tamerfarouk21`, `/admin`) → `GET /api/v1/users/{username}` |
| **Status** | Confirmed (fresh request, valid Bearer token) |

## What happens
```
GET /api/v1/users/tamerfarouk21  → 400 {"message":"Invalid identifier format"}
GET /api/v1/users/me             → 200 (control — works)
```
The `/[username]` profile page renders its shell but cannot load the profile.

## Likely cause (not fixed — reporting only)
`GET /api/v1/users/:id` validates `:id` as a UUID, so a **username** is rejected
as an invalid identifier. The web app links to profiles by username
(`/[username]`) and calls `/users/{username}`, which the backend can't resolve.
Either the endpoint needs a username lookup (e.g. `/users/by-username/:username`
or accept both), or the frontend must resolve username → id first.

## Reproduce
```bash
curl -s "https://145-14-158-100.sslip.io/api/v1/users/tamerfarouk21" \
  -H "Authorization: Bearer $TOK"   # → 400 Invalid identifier format
```

## Impact
Every public profile opened by username is broken — a core social navigation path.

> Report only — not fixed. Related: [[GQA-001-groups-list-api-400]].
