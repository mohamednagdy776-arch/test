# ISSUE-001: logs no console errors

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Route / Page** | `/admin` |
| **Test project** | user |
| **Check** | logs no console errors |
| **Status** | Failed (failed on all attempts) |
| **Attempts** | 2 |
| **Spec** | `../lib/checks.ts:36` |

## Full test path
- user\dynamic-pages.spec.ts
- User Profile (self) [/admin]
- logs no console errors

## Failure details
```
Error: console.error output on /admin

Failing network requests behind these errors:
 - 404 GET https://145-14-158-100.sslip.io/_next/static/css/416036954e6c85a0.css
 - FAILED GET https://145-14-158-100.sslip.io/_next/static/css/416036954e6c85a0.css (net::ERR_ABORTED)
 - 404 GET https://145-14-158-100.sslip.io/_next/static/chunks/webpack-a3c37fcbf859f6f9.js
 - FAILED GET https://145-14-158-100.sslip.io/_next/static/chunks/webpack-a3c37fcbf859f6f9.js (net::ERR_ABORTED)
 - 404 GET https://145-14-158-100.sslip.io/_next/static/chunks/fd9d1056-656b2c1478ecc468.js
 - FAILED GET https://145-14-158-100.sslip.io/_next/static/chunks/fd9d1056-656b2c1478ecc468.js (net::ERR_ABORTED)
 - 404 GET https://145-14-158-100.sslip.io/_next/static/chunks/117-2138238ef8182c27.js
 - FAILED GET https://145-14-158-100.sslip.io/_next/static/chunks/117-2138238ef8182c27.js (net::ERR_ABORTED)
 - 404 GET https://145-14-158-100.sslip.io/_next/static/chunks/main-app-97d8ba57c0b6f2b9.js
 - FAILED GET https://145-14-158-100.sslip.io/_next/static/chunks/main-app-97d8ba57c0b6f2b9.js (net::ERR_ABORTED)
 - 404 GET https://145-14-158-100.sslip.io/_next/static/chunks/781-b9846278a2cab791.js
 - FAILED GET https://145-14-158-100.sslip.io/_next/static/chunks/781-b9846278a2cab791.js (net::ERR_ABORTED)
 - 404 GET https://145-14-158-100.sslip.io/_next/static/chunks/app/layout-7dac57ad5b71dbdd.js
 - FAILED GET https://145-14-158-100.sslip.io/_next/static/chunks/app/layout-7dac57ad5b71dbdd.js (net::ERR_ABORTED)
 - 404 GET https://145-14-158-100.sslip.io/_next/static/chunks/app/error-8533088cbb61ad4f.js
 - FAILED GET https://145-14-158-100.sslip.io/_next/static/chunks/app/error-8533088cbb61ad4f.js (net::ERR_ABORTED)
 - 404 GET https://145-14-158-100.sslip.io/_next/static/chunks/972-1a851d9563308217.js
 - FAILED GET https://145-14-158-100.sslip.io/_next/static/chunks/972-1a851d9563308217.js (net::ERR_ABORTED)
 - 404 GET https://145-14-158-100.sslip.io/_next/static/chunks/app/not-found-ec70a4ed3805d8b1.js
 - FAILED GET https://145-14-158-100.sslip.io/_next/static/chunks/app/not-found-ec70a4ed3805d8b1.js (net::ERR_ABORTED)

expect(received).toEqual(expected) // deep equality

- Expected  -  1
+ Received  + 12

- Array []
+ Array [
+   "Failed to load resource: the server responded with a status of 404 ()",
+   "Failed to load resource: the server responded with a status of 404 ()",
+   "Failed to load resource: the server responded with a status of 404 ()",
+   "Failed to load resource: the server responded with a status of 404 ()",
+   "Failed to load resource: the server responded with a status of 404 ()",
+   "Failed to load resource: the server responded with a status of 404 ()",
+   "Failed to load resource: the server responded with a status of 404 ()",
+   "Failed to load resource: the server responded with a status of 404 ()",
+   "Failed to load resource: the server responded with a status of 404 ()",
+   "Failed to load resource: the server responded with a status of 404 ()",
+ ]
```

## How to reproduce
1. Open the deployed web app.
2. Navigate to `/admin` while signed in.
3. Observe the condition described by the check **"logs no console errors"**.

## Re-run just this check
```bash
cd web-tests
npx playwright test --project=user -g "logs no console errors"
```

> Auto-generated from Playwright results. Reporting only — not fixed.
