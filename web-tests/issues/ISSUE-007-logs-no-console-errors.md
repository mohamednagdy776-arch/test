# ISSUE-007: logs no console errors

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Route / Page** | `/tamerfarouk21` |
| **Test project** | user |
| **Check** | logs no console errors |
| **Status** | Failed (failed on all attempts) |
| **Attempts** | 2 |
| **Spec** | `../lib/checks.ts:36` |

## Full test path
- user\dynamic-pages.spec.ts
- User Profile (other) [/tamerfarouk21]
- logs no console errors

## Failure details
```
Error: console.error output on /tamerfarouk21

Failing network requests behind these errors:
 - 400 GET https://145-14-158-100.sslip.io/api/v1/users/tamerfarouk21
 - 400 GET https://145-14-158-100.sslip.io/api/v1/users/tamerfarouk21

expect(received).toEqual(expected) // deep equality

- Expected  - 1
+ Received  + 4

- Array []
+ Array [
+   "Failed to load resource: the server responded with a status of 400 ()",
+   "Failed to load resource: the server responded with a status of 400 ()",
+ ]
```

## How to reproduce
1. Open the deployed web app.
2. Navigate to `/tamerfarouk21` while signed in.
3. Observe the condition described by the check **"logs no console errors"**.

## Re-run just this check
```bash
cd web-tests
npx playwright test --project=user -g "logs no console errors"
```

> Auto-generated from Playwright results. Reporting only — not fixed.
