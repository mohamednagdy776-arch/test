# Fix Production Bug Workflow

## Severity Classification

- P0 Critical: system down, payments failing, security breach → immediate action
- P1 High: core feature broken (chat, matching, login)
- P2 Medium: partial functionality issues
- P3 Low: minor UI bugs, non-critical issues

---

## Step 1: Detect & Analyze

- Check backend logs, mobile logs, server logs
- Identify error messages, stack traces, affected endpoints/users

---

## Step 2: Reproduce

- Recreate in local or staging with same inputs and user scenario

---

## Step 3: Identify Root Cause

- Trace to: code logic / DB query / API integration / AI service / real-time layer

---

## Step 4: Assess Impact

- Affected users, features, and any security implications

---

## Step 5: Apply Minimal Fix

- Fix ONLY the root cause
- Follow coding standards, naming conventions, security rules
- Avoid unrelated refactoring

---

## Step 6: Add Regression Tests

- Write tests that reproduce the bug and verify the fix

---

## Step 7: Code Review

- Verify fix correctness, no side effects, security intact

---

## Step 8: Deploy to Staging → Production

- Run CI, QA validation, then deploy via hotfix branch
- Monitor logs after release

---

## Step 9: Document Root Cause

- What happened, why, how it was fixed, how to prevent recurrence

---

## Emergency Hotfix

```bash
git checkout -b hotfix/critical-bug main
# apply fix
git push origin hotfix/critical-bug
```

---

## Tayyibt-Specific Checks

- Matching: validate scoring output, no incorrect matches returned
- Chat: verify message delivery and real-time connection
- Social: validate posts/comments/replies and permission logic
- Payments: verify transaction status, no duplicate charges
