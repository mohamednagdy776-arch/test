# GQA-007: Dynamic routes 404 on `_next/static` chunks (likely deploy skew)

| Field | Value |
|-------|-------|
| **Severity** | Low (likely transient, not a persistent per-page defect) |
| **Area** | Web / Deploy |
| **Route(s)** | `/[username]` (`/admin`, `/tamerfarouk21`), `/pages/[id]`, `/groups/[id]` |
| **Status** | Observed; root cause is most likely a redeploy during testing |

## What happens
In the browser, the four dynamic routes each requested the **same 10**
`_next/static` assets and all returned 404:

```
_next/static/chunks/webpack-a3c37fcbf859f6f9.js        → 404
_next/static/chunks/main-app-97d8ba57c0b6f2b9.js       → 404
_next/static/chunks/app/layout-7dac57ad5b71dbdd.js     → 404
_next/static/chunks/app/error-8533088cbb61ad4f.js      → 404
_next/static/chunks/app/not-found-ec70a4ed3805d8b1.js  → 404
_next/static/chunks/{117,781,972,fd9d1056}-*.js        → 404
_next/static/css/416036954e6c85a0.css                  → 404
```

## Why this is probably NOT a per-page bug
The homepage currently serves **different, working** hashes
(`webpack-c6074c84…`, `app/layout-7a583e2e…`) that return 200. The 404s above
reference an **older** build. This is classic **Next.js deploy skew**: a client
that loaded the app before a redeploy holds an in-memory build manifest whose
chunk hashes no longer exist after the new build replaces them. A redeploy did
happen during this testing session (the `web-tests` push to `main` triggered the
CD pipeline), which lines up.

A truly fresh client loading `/admin` directly should pull the current manifest
(curl of `/admin` embeds no stale chunk tags), so new visitors are unaffected.

## What to confirm
Open `/admin` (or any `/[username]`) in a brand-new private window with no prior
tab open. If chunks load 200, this is deploy skew only. If they still 404, it's a
real asset-serving bug worth escalating.

## Note for cross-referencing
This skew accounts for most of the "console errors" the Playwright suite reported
on profile/dynamic pages (`web-tests/issues/ISSUE-001/006/007`). The *real*
defect on those pages is the API 400/404 (see [[GQA-003-user-by-username-400]],
[[GQA-004-page-posts-404]]), not the chunk 404s.

> Report only — not fixed.
