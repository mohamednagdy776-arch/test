# GQA-006: Login shows no inline error for invalid credentials

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Area** | Web / Auth |
| **Route** | `/login` |
| **Status** | Flagged by the Playwright suite; needs a manual UI confirmation |

## What happens
Submitting wrong credentials on `/login` does not surface the expected inline
Arabic error (`…غير صحيحة` / `تعذّر الاتصال` / `بيانات الدخول`). The Playwright
check timed out waiting for that message while the page stayed on `/login`.

The API itself behaves correctly — `POST /api/v1/auth/login` with bad creds
returns `401 {"message":"Invalid credentials"}` — so this is about the form
rendering the error to the user, not the backend.

## Reproduce
1. Go to `/login`.
2. Enter a wrong email/password and submit.
3. Expected: inline red error. Observed (automated): no visible error message.

## Note
Confidence is medium — could be a selector/timing nuance in the automated check.
Worth a quick manual confirmation before prioritizing.

## Impact
Users entering wrong credentials may get no feedback about why login failed.

> Report only — not fixed.
