# GQA-008: `/settings/language` bounced to `/login` during the scan

| Field | Value |
|-------|-------|
| **Severity** | Low |
| **Area** | Web / Auth |
| **Route** | `/settings/language` |
| **Status** | Observed once; not reliably reproducible |

## What happens
During the 36-route scan (authenticated session), visiting `/settings/language`
ended on `/login` instead of staying on the settings page. The settings pages
visited immediately after (`/settings/notifications`, `/privacy`, `/security`,
`/report`) loaded normally, so the session token was not globally cleared.

## Possible cause (not fixed — reporting only)
Most likely a transient: a single API call on the language page returned 401 and
the axios response interceptor (`api-client.ts`: on 401 → remove token →
`window.location.href = '/login'`) redirected. It did not reproduce on
subsequent pages, so it may be tied to a specific call or a one-off timing/token
edge during the redeploy window (see [[GQA-007-dynamic-route-chunk-404-deploy-skew]]).

## What to confirm
Visit `/settings/language` directly while signed in, a few times. If it
consistently bounces to `/login`, capture the failing API call (it indicates a
401 on that page's data fetch).

## Impact
If reproducible, users opening Language settings would be logged out.

> Report only — not fixed.
