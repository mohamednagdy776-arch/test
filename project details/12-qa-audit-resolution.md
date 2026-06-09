# 12 — QA Audit Resolution

This document tracks the June 2026 master QA audit findings (48 issues) and their resolution status.

**Status legend:** ✅ Fixed · 🔧 In progress · 📋 Planned · ℹ️ Clarified (not a defect / config)

---

## Critical (6)

| ID | Issue | Status | Resolution |
|----|-------|--------|-----------|
| C-01 | Admin panel publicly accessible | 📋 | Add IP allowlist / basic-auth in nginx for `/admin` |
| C-02 | Missing Terms & Privacy pages | ✅ | Added `/terms` and `/privacy` pages |
| C-03 | Chat system broken (GET 403 / POST 500) | ✅ | Added `POST /chat/conversations`; fixed message send |
| C-04 | Internal UUIDs exposed in matching UI | ✅ | Match cards no longer render raw UUIDs |
| C-05 | Stored XSS | ✅ | Server-side HTML sanitization on post/comment/bio input |
| C-06 | Session isolation / data leakage | ℹ️ | Verified: dashboard counters were static placeholders, not cross-user data; placeholders removed (see L-05) |

---

## High (16)

| ID | Issue | Status | Resolution |
|----|-------|--------|-----------|
| H-01 | Missing mobile navigation | ✅ | Added responsive mobile nav drawer |
| H-02 | Unsupported "Custom" gender option | ✅ | Removed from registration UI |
| H-03 | Admin panel unstyled | 📋 | Admin CSS build fix (separate app) |
| H-04 | Branding "Tayyibat" vs "Tayyibt" | ✅ | Standardized to "Tayyibt" |
| H-05 | Invalid routes redirect to login (no 404) | ✅ | Custom 404 page now shown |
| H-06 | `/friends/suggestions` returns 500 | ✅ | Fixed malformed query in FriendsService |
| H-07 | RSC prefetch 503 errors | ℹ️ | Caused by transient cold-start; mitigated by health checks |
| H-08 | Inputs lose focus while typing | ✅ | Removed inline component definitions causing remounts |
| H-09 | Group posts endpoints 404 | ✅ | Added `GET/POST /groups/:id/posts` |
| H-10 | Group listing APIs 500 | ✅ | Fixed group queries |
| H-11 | Pages APIs 500 | ✅ | Fixed pages queries |
| H-12 | Account settings not populated | ✅ | Settings now hydrate from `/users/me` |
| H-13 | Subscription button non-functional | 📋 | Checkout flow stub documented |
| H-14 | JWT in localStorage | 📋 | Documented; HttpOnly cookie migration planned |
| H-15 | Missing robots.txt | ✅ | Added `robots.txt` |
| H-16 | Missing sitemap.xml | ✅ | Added `sitemap.xml` |

---

## Medium (18)

| ID | Issue | Status | Resolution |
|----|-------|--------|-----------|
| M-01 | Missing meta description | ✅ | Added metadata to root layout |
| M-02 | Password rules not displayed | ✅ | Added password hint on register |
| M-03 | Missing placeholder text | ✅ | Added input placeholders |
| M-04 | Missing client-side validation | ✅ | Inline validation on auth forms |
| M-05 | Missing custom 404 page | ✅ | Added `not-found.tsx` content |
| M-06 | "Remember me" duration unexplained | ✅ | Added tooltip/label |
| M-07 | Excessive API polling | ✅ | Added React Query `staleTime`/refetch controls |
| M-08 | Wrong country auto-population | ✅ | Phone-country mapping fixed |
| M-09 | Persistent upgrade widget | ✅ | Made dismissible |
| M-10 | Terms checkbox state handling | ✅ | Controlled checkbox via React state |
| M-11 | 2FA missing QR code | ✅ | Render QR from otpauth URI |
| M-12 | Profile data inconsistencies | ✅ | Profile fields map correctly age/country/city |
| M-13 | Group creation missing validation | ✅ | Required-field validation + feedback |
| M-14 | Corrupted chat date formatting | ✅ | Fixed date formatter |
| M-15 | Memories "0 years ago" | ✅ | Corrected relative-date calc |
| M-16 | Search returns empty results | ✅ | Fixed earlier (search rewrite) |
| M-17 | Birth date label corruption | ✅ | Fixed encoding (UTF-8) |
| M-18 | Unexpected password field icon | ✅ | Corrected icon rendering |

---

## Low (8)

| ID | Issue | Status | Resolution |
|----|-------|--------|-----------|
| L-01 | Stock photos in testimonials | ℹ️ | Content decision; flagged for marketing |
| L-02 | Unverified statistics | ✅ | Removed unverified claims |
| L-03 | Missing admin favicon | ✅ | Added favicon |
| L-04 | Matching lacks new-user guidance | ✅ | Added empty-state onboarding |
| L-05 | Dashboard shows fake activity | ✅ | Replaced placeholders with real counts (0 for new users) |
| L-06 | Group creation redirect bug | ✅ | Redirects to created group |
| L-07 | Watch page missing upload CTA | ✅ | Added upload button |
| L-08 | Mixed Arabic/English labels | ✅ | Translated privacy selector |

---

## Backend Stability Fixes (from automated test suite)

These were found by `scripts/run-tests.py` and addressed alongside the audit. **All verified passing (145/145).**

| Finding | Status | Resolution |
|---------|--------|-----------|
| `/friends/suggestions` 500 | ✅ | Guarded empty `friendIds` (was `IN ()` syntax error) |
| `/friends/request` 500 | ✅ | Global `QueryErrorFilter` maps FK violation → 400 |
| `/blocks` POST 500 | ✅ | Same FK→400 mapping; works with valid user ids |
| `/posts/:id/save` 500 | ✅ | Fixed raw SQL: correct columns (`id`,`saved_at`) |
| `/groups/:id/posts` 404 | ✅ | Added GET/POST group-posts routes (H-09) |
| `POST /chat/conversations` 404 | ✅ | Added direct-conversation endpoint (C-03) |
| Chat edit/delete/react/search fail | ✅ | Made path-param DTO fields optional; loaded `sender` relation |
| Invalid UUID → 500 | ✅ | Global exception filter → 400 |
| Refresh-token 401 | ✅ | Stopped UPDATE with empty-string session id |
| Private post visible to others | ✅ | Enforced `only_me` audience on GET (5.11) |
| Stored XSS | ✅ | Input sanitizer strips `<script>`/`onerror`/`javascript:` |

### Verification

```
scripts/run-tests.py — 16 sections, 145 cases
✅ Passed:   145/145
⚠️ Warnings:   0/145
❌ Failed:     0/145
```

---

## Summary

| Severity | Total | Fixed | Planned/Clarified |
|----------|-------|-------|-------------------|
| Critical | 6 | 4 | 2 |
| High | 16 | 12 | 4 |
| Medium | 18 | 18 | 0 |
| Low | 8 | 6 | 2 |
| **Total** | **48** | **40** | **8** |

Items marked 📋 Planned are infrastructure/product decisions (admin network isolation, admin styling, subscription checkout, JWT cookie migration) documented for the next iteration. Items marked ℹ️ were clarified as non-defects or configuration concerns.

> This file reflects the resolution effort. Each code fix is described in the relevant area doc and verified by the test suite where applicable.
