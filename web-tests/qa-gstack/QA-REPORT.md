# GStack QA Report — Tayyibt Web (report-only)

- **Target:** https://145-14-158-100.sslip.io
- **Date:** 2026-06-12
- **Tool:** GStack `/qa-only` (headless Chromium `browse`) — browser-driven, report only, nothing fixed
- **Auth:** admin@tayyibt.com (tokens injected into localStorage)
- **Scope:** all 36 routes scanned; backend endpoints confirmed directly with a valid Bearer token
- **Health score:** **68 / 100 — Fair.** Public, auth, dashboard, search and settings pages render clean. Core *social* features (Groups, Pages, profile-by-username) are functionally broken because their data APIs reject the request.

## Headline finding (root cause)

Several list/detail APIs return **HTTP 400 `{"success":false,"statusCode":400,"message":"Invalid identifier format"}`**. The common cause is **route ordering + a UUID validation pipe**: a `:id` route that validates its param as a UUID is declared *before* (or catches) the literal sub-paths, so requests to static segments and to username lookups are rejected as malformed UUIDs.

Confirmed directly (fresh request, valid token — not a browser/session issue):

| Endpoint | Status | Body |
|----------|:------:|------|
| `GET /api/v1/groups/public?page=1&limit=20` | 400 | Invalid identifier format |
| `GET /api/v1/groups/private?page=1&limit=20` | 400 | Invalid identifier format |
| `GET /api/v1/groups/suggested?limit=5` | 400 | Invalid identifier format |
| `GET /api/v1/groups/pending` | 400 | Invalid identifier format |
| `GET /api/v1/pages/created` | 400 | Invalid identifier format |
| `GET /api/v1/pages/suggested?limit=5` | 400 | Invalid identifier format |
| `GET /api/v1/users/tamerfarouk21` (username) | 400 | Invalid identifier format |
| `GET /api/v1/pages/{id}/posts?page=1&limit=20` | 404 | — |
| `GET /api/v1/users/me` | 200 | works (control) |

User-facing effect: **/groups, /pages, and every `/[username]` profile page load their shell but show no data** (the API calls fail).

## Issues (one file each in `issues/`)

| ID | Severity | Area | Summary |
|----|----------|------|---------|
| [GQA-001](issues/GQA-001-groups-list-api-400.md) | High | Backend/Groups | All `/groups/*` list endpoints return 400 "Invalid identifier format" → Groups page has no data |
| [GQA-002](issues/GQA-002-pages-list-api-400.md) | High | Backend/Pages | `/pages/created` & `/pages/suggested` return 400 → Pages page has no data |
| [GQA-003](issues/GQA-003-user-by-username-400.md) | High | Backend/Profiles | `/users/{username}` returns 400; only UUID/`me` works → every `/[username]` profile is broken |
| [GQA-004](issues/GQA-004-page-posts-404.md) | Medium | Backend/Pages | `/pages/{id}/posts` returns 404 → page-detail feed empty |
| [GQA-005](issues/GQA-005-mockups-mobile-overflow.md) | Medium | Web/Responsive | `/mockups` overflows ~230px on a 375px viewport (desktop layout, not responsive) |
| [GQA-006](issues/GQA-006-login-invalid-credentials-no-error.md) | Medium | Web/Auth | `/login` shows no inline error for invalid credentials (needs UI confirmation) |
| [GQA-007](issues/GQA-007-dynamic-route-chunk-404-deploy-skew.md) | Low* | Web/Deploy | Dynamic routes 404 on `_next/static` chunks — **likely deploy skew**, not a per-page bug |
| [GQA-008](issues/GQA-008-settings-language-redirect-login.md) | Low | Web/Auth | `/settings/language` bounced to `/login` once during the scan — could not reproduce reliably |

\* GQA-007 is low-confidence as a persistent defect: the homepage currently serves fresh chunk hashes that load fine, so the 404s are most likely a stale in-memory build manifest after the redeploy that happened during testing. The same skew accounts for most of the "console errors" the Playwright pass flagged on profile/dynamic pages (Playwright ISSUE-001/006/007) — the *real* defect on those pages is the API 400/404 above, not the chunk 404s.

## Per-route scan summary

- **Clean (0 console errors, correct final URL):** `/`, `/privacy`, `/terms`, `/mockups`, `/login`, `/register`, `/forgot-password`, `/verify-email`, `/reset-password/[token]`, `/dashboard`, `/profile`, `/search`, `/upgrade`, `/pages`, `/events`, `/saved`, `/chat`, `/friends`, `/matching`, `/memories`, `/notifications`, `/posts`, `/watch`, `/settings`, `/settings/{account,appearance,help,notifications,privacy,security,report}`
- **Console errors from real API failures:** `/groups`, `/pages` (the 400s above)
- **Console errors from deploy-skew chunk 404s:** `/admin`, `/tamerfarouk21`, `/pages/[id]`, `/groups/[id]`
- **Unexpected redirect to /login:** `/settings/language` (once), `/groups/[id]` (once) — not reliably reproducible

## Evidence

- `screenshots/groups-desktop.png` — Groups page rendered with no group data
- `screenshots/mockups-mobile.png` — `/mockups` horizontal overflow on mobile
- `scan.txt` — raw 36-route scan output

## Method note

This is a second pass complementing the Playwright suite in `web-tests/`. GStack's value here was isolating the **shared backend root cause** ("Invalid identifier format" / route ordering) and separating **real backend bugs** (GQA-001..004) from **transient deploy-skew console noise** (GQA-007). Report only — no code changed.
