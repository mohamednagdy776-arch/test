# ISSUE-004: has no horizontal overflow on a 375px mobile viewport

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Route / Page** | `/mockups` |
| **Test project** | guest |
| **Check** | has no horizontal overflow on a 375px mobile viewport |
| **Status** | Failed (failed on all attempts) |
| **Attempts** | 2 |
| **Spec** | `../lib/checks.ts:72` |

## Full test path
- guest\public-pages.spec.ts
- Mockups [/mockups]
- has no horizontal overflow on a 375px mobile viewport

## Failure details
```
Error: horizontal overflow in px on /mockups (mobile)

expect(received).toBeLessThanOrEqual(expected)

Expected: <= 5
Received:    230
```

## How to reproduce
1. Open the deployed web app.
2. Navigate to `/mockups` as a guest (signed out).
3. Observe the condition described by the check **"has no horizontal overflow on a 375px mobile viewport"**.

## Re-run just this check
```bash
cd web-tests
npx playwright test --project=guest -g "has no horizontal overflow on a 375px mobile viewport"
```

> Auto-generated from Playwright results. Reporting only — not fixed.
