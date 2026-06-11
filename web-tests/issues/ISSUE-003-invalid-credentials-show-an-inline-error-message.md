# ISSUE-003: invalid credentials show an inline error message

| Field | Value |
|-------|-------|
| **Severity** | Low |
| **Route / Page** | `/login` |
| **Test project** | guest |
| **Check** | invalid credentials show an inline error message |
| **Status** | Failed (failed on all attempts) |
| **Attempts** | 2 |
| **Spec** | `guest/interactions.spec.ts:23` |

## Full test path
- guest\interactions.spec.ts
- Login form interactions [/login]
- invalid credentials show an inline error message

## Failure details
```
Error: expect(locator).toBeVisible() failed

Locator: getByText(/غير صحيحة|تعذّر الاتصال|بيانات الدخول/)
Expected: visible
Timeout: 15000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 15000ms
  - waiting for getByText(/غير صحيحة|تعذّر الاتصال|بيانات الدخول/)
    - waiting for" https://145-14-158-100.sslip.io/login" navigation to finish...
    - navigated to "https://145-14-158-100.sslip.io/login"
```

## How to reproduce
1. Open the deployed web app.
2. Navigate to `/login` as a guest (signed out).
3. Observe the condition described by the check **"invalid credentials show an inline error message"**.

## Re-run just this check
```bash
cd web-tests
npx playwright test --project=guest -g "invalid credentials show an inline error message"
```

> Auto-generated from Playwright results. Reporting only — not fixed.
