# ISSUE-006: logs no console errors

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Route / Page** | `/pages/110e2521-454e-4008-8af9-d89882dc3070` |
| **Test project** | user |
| **Check** | logs no console errors |
| **Status** | Failed (failed on all attempts) |
| **Attempts** | 2 |
| **Spec** | `../lib/checks.ts:36` |

## Full test path
- user\dynamic-pages.spec.ts
- Page detail [/pages/110e2521-454e-4008-8af9-d89882dc3070]
- logs no console errors

## Failure details
```
Error: console.error output on /pages/110e2521-454e-4008-8af9-d89882dc3070

Failing network requests behind these errors:
 - 404 GET https://145-14-158-100.sslip.io/api/v1/pages/110e2521-454e-4008-8af9-d89882dc3070/posts?page=1&limit=20
 - 404 GET https://145-14-158-100.sslip.io/api/v1/pages/110e2521-454e-4008-8af9-d89882dc3070/posts?page=1&limit=20

expect(received).toEqual(expected) // deep equality

- Expected  - 1
+ Received  + 4

- Array []
+ Array [
+   "Failed to load resource: the server responded with a status of 404 ()",
+   "Failed to load resource: the server responded with a status of 404 ()",
+ ]
```

## How to reproduce
1. Open the deployed web app.
2. Navigate to `/pages/110e2521-454e-4008-8af9-d89882dc3070` while signed in.
3. Observe the condition described by the check **"logs no console errors"**.

## Re-run just this check
```bash
cd web-tests
npx playwright test --project=user -g "logs no console errors"
```

> Auto-generated from Playwright results. Reporting only — not fixed.
