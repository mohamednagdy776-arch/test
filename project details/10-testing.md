# 10 — Testing

## Automated Test Suite

The platform ships with a comprehensive API-level test suite: `scripts/run-tests.py`.

- **Driver**: Python + paramiko, executing `curl` over SSH on the live VPS.
- **Targets**: the production API at `https://145-14-158-100.sslip.io`.
- **Coverage**: 16 sections, ~145 test cases.
- **Accounts**: three seeded users (Omar, Fatima, Ahmed), all `Test1234`.

Run with:
```bash
python scripts/run-tests.py
```

---

## Test Sections

| # | Section | What it covers |
|---|---------|----------------|
| 0 | Setup | Login 3 users, fetch IDs, seed a post |
| 1 | Auth | Register, login, JWT expiry, wrong password, missing fields, refresh, duplicate email |
| 2 | Users & Profile | Get/update profile, religious fields, preferences, match-profile |
| 3 | Search | 7 query types, autocomplete, card fields, auth guard |
| 4 | Matching & AI | Generate, accept/reject, AI score range, same-gender=0, score comparison |
| 5 | Posts & Feed | Create, edit, feed, auth guard, react, comment, reply, private, delete |
| 6 | Friends | Suggestions, request, accept, decline, lists, status, follow |
| 7 | Chat | Conversations, group chat, send/edit/star/react/delete messages, unread |
| 8 | Notifications | List, mark read (one/all), delete |
| 9 | Groups | List, create, join, members, post, leave |
| 10 | Events | List, create, RSVP going/interested, attendees |
| 11 | Pages | List, create, follow, like |
| 12 | Saved & Memories | Saved items, collections, memories |
| 13 | Settings | Privacy, notifications, appearance, blocks, newsletter |
| 14 | AI Service | match, bio (en/ar), icebreaker, moderate, profile-tips |
| 15 | Videos | List, trending, recommended, continue-watching |
| 16 | Security & Edge Cases | SQL injection, XSS, long content, empty body, invalid UUID, CORS, public health |

---

## Result Classification

Each test reports one of:
- ✅ **Pass** — assertion satisfied.
- ⚠️ **Warning** — known backend limitation or intentionally skipped (e.g., feature not yet implemented).
- ❌ **Fail** — unexpected behavior.

The runner prints a summary and a list of any failures/warnings, exiting non-zero on failures.

---

## Security Test Cases

| Case | Expectation |
|------|-------------|
| SQL injection in `?q=' OR '1'='1` | No 500; query safely parameterized |
| XSS payload in post content | Stored without server error; frontend escapes on render |
| 5000-char post body | Handled (200/400, never 500) |
| Empty POST body | 400/422, not 500 |
| Invalid UUID in path | 400/404 (not 500) |
| Unauthenticated request | 401 |
| Cross-user edit attempt | 401/403/404 |
| Public `/health` | 200 without auth |
| CORS preflight | `access-control-*` headers present |

---

## Manual / Browser Testing

For UI verification, the documented flows are:
1. Log in at `/login` with a seeded account.
2. Exercise each page (`/dashboard`, `/matching`, `/search`, `/chat`, `/friends`, `/groups`, `/events`, `/settings`, …).
3. Verify search auto-runs after 600 ms of typing.
4. Verify match cards render scores + reasons.
5. Verify chat sends/receives in real time.

---

## Seed Data for Testing

`scripts/seed-50-users.py` creates 50 diverse profiles so search, matching, and discovery have realistic data:
- 19 countries, balanced gender, varied sect/prayer/lifestyle/education.
- Deterministic credentials (`firstname.lastname@tayyibt.test` / `Test1234`).

---

## Diagnostic Scripts

Supporting scripts used during development/QA:
- `scripts/check-db.py` — inspect DB tables and counts.
- `scripts/check-vps.py` / `final-check.py` — container + health status.
- `scripts/check-ai.py` — AI endpoints + Ollama model list.
- `scripts/verify-search.py` — end-to-end search verification.
