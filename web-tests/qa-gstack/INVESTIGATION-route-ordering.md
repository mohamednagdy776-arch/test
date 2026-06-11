# Investigation — "Invalid identifier format" 400s (GQA-001/002/003/004)

**Status:** Root cause found. **No code changed** (report-only, per request).

## Symptom
```
GET /api/v1/groups/{public,private,suggested,pending} → 400 "Invalid identifier format"
GET /api/v1/pages/{created,suggested}                 → 400 "Invalid identifier format"
GET /api/v1/users/{username}  (e.g. tamerfarouk21)    → 400 "Invalid identifier format"
GET /api/v1/pages/{uuid}/posts                        → 404
GET /api/v1/users/me                                  → 200 (works)
```

## Root cause (confirmed in code)

It is **not** a route-ordering bug. The endpoints the web app calls **do not exist
in the backend**, so each one falls through to the controller's `@Get(':id')`
handler, the service runs a `WHERE id = $1` query with a non-UUID string, Postgres
raises `invalid input syntax for type uuid`, and a global filter rewrites that to
the 400.

**The error string:** `backend/src/common/filters/query-error.filter.ts:31-33`
```ts
if (/invalid input syntax for type uuid/i.test(message)) {
  status = HttpStatus.BAD_REQUEST;
  clientMessage = 'Invalid identifier format';
}
```

**Groups** — `backend/src/groups/controllers/groups.controller.ts`
Routes present: `@Get()` (28), `@Get('search')` (34), `@Get('autocomplete')` (40),
`@Get('my')` (46), `@Get(':id')` (52). **No `public/private/suggested/pending`.**
The web app calls all four — `web/src/features/groups/api.ts:8,11,26,29` — so
`/groups/public` matches `@Get(':id')` with `id="public"` → `groupsService.findOne("public", …)` → uuid error → 400.

**Pages** — `backend/src/pages/controllers/pages.controller.ts`
Routes present: `@Get()` (21), `@Get('my')` (27), `@Get(':id')` (33), follow/like,
`@Get('username/:username')` (63). **No `created`, no `suggested`, no `@Get(':id/posts')`.**
Web app — `web/src/features/pages/api.ts:14,23,52` — calls `/pages/created`,
`/pages/suggested` (→ caught by `:id` → uuid 400) and `/pages/{id}/posts`
(no matching route at all → **404**, this is GQA-004).

**Users** — `backend/src/users/controllers/users.controller.ts`
`@Get('me')` (23) works. `@Get(':id')` (90) expects a **UUID**. There is **no
username route** (unlike pages, which has `username/:username`). The web app's
profile page calls `/users/{username}` — `web/src/app/(main)/[username]/page.tsx:22`
```ts
queryFn: () => apiClient.get(`/users/${username}`).then((r) => r.data)
```
so `/users/tamerfarouk21` → `@Get(':id')` with `id="tamerfarouk21"` → uuid error →
400. Because this first call fails, `userId` is never resolved, so every
downstream call on that page (`/users/{userId}/posts|friends|photos|videos`) is
also dead.

## Why GQA-007 (chunk 404s) is unrelated
The dynamic-route `_next/static` 404s are deploy skew (separate issue). The real
breakage on `/groups`, `/pages`, and `/[username]` is this contract mismatch.

## Fix options (NOT applied)

### Recommended — backend: add the missing endpoints (feature parity)
Declared **before** `@Get(':id')` in each controller, plus service methods:

- **Groups** (`groups.controller.ts` + `groups.service.ts`): add
  `@Get('public')`, `@Get('private')`, `@Get('suggested')`, `@Get('pending')`
  (the FE sends `page`, `limit`, `category`).
- **Pages** (`pages.controller.ts` + `pages.service.ts`): add `@Get('created')`,
  `@Get('suggested')`, and `@Get(':id/posts')`.
- **Users** (`users.controller.ts` + `users.service.ts`): add
  `@Get('username/:username')` (mirror the pages controller) and change
  `web/src/app/(main)/[username]/page.tsx:22` to call
  `/users/username/${username}`. Alternatively, make `@Get(':id')` detect a
  non-UUID `id` and fall back to a username lookup.

Order matters for the **new** static routes (they must precede `:id`), and each
new service method must exist or you get the same uuid error.

### Cheaper but partial — frontend: call existing endpoints
Point groups/pages lists at `GET /groups` / `GET /pages` (+ `/my`) and resolve
username→id first. Downside: the backend `findAll` has no visibility filter and
no "suggested"/"pending" concept, so this loses those features. Not full parity.

### Defense-in-depth (do regardless)
Add a `ParseUUIDPipe` (or a 404 for unknown ids) on the `:id` params so a bad id
returns a clear `404 Not Found` instead of a confusing `400 Invalid identifier
format` from the Postgres layer. This makes the next contract drift obvious.

## Verification plan (once a fix is approved)
1. `curl` each endpoint with a valid Bearer token → expect 200 + payload.
2. Reload `/groups`, `/pages`, `/{username}` in the browser → data renders, no console errors.
3. Re-run `web-tests` (Playwright) — the console-error checks on those routes should pass.

## Affected files (reference)
- `backend/src/common/filters/query-error.filter.ts:31-33`
- `backend/src/groups/controllers/groups.controller.ts:28-56`
- `backend/src/pages/controllers/pages.controller.ts:21-63`
- `backend/src/users/controllers/users.controller.ts:85-115`
- `web/src/features/groups/api.ts:8,11,26,29`
- `web/src/features/pages/api.ts:14,23,52`
- `web/src/app/(main)/[username]/page.tsx:22`
