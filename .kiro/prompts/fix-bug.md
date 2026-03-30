# Fix Bug Prompt

Use this prompt when debugging and fixing issues in the Tayyibt codebase.

---

## Prompt Template

```
Fix the following bug in the Tayyibt codebase.

Bug details:
- Module affected: [auth | matching | chat | social | payments | other]
- Environment: [development | staging | production]
- Description: [what is happening]
- Expected behavior: [what should happen]
- Steps to reproduce: [list steps]
- Error message / stack trace: [paste here]

Rules:
- Identify and fix ONLY the root cause
- Do not introduce unrelated changes
- Follow coding-standards.md and security-rules.md
- Ensure no regression in related modules
- Add a unit test that reproduces the bug and verifies the fix
- If security-related, flag it explicitly
```

---

## Example

```
Fix the following bug in the Tayyibt codebase.

Bug details:
- Module affected: matching
- Environment: staging
- Description: compatibility score returns 0 for users with incomplete profiles
- Expected behavior: partial score should be calculated using available fields
- Steps to reproduce:
    1. Create user with no lifestyle data
    2. Call matching endpoint
    3. Score returns 0
- Error message: none, just incorrect score

Rules:
- Identify and fix ONLY the root cause
- Follow coding-standards.md and security-rules.md
- Ensure no regression in matching or AI service
- Add a unit test for incomplete profile scoring
```

---

## Debugging Checklist

- [ ] Bug reproduced successfully
- [ ] Root cause clearly identified
- [ ] Fix is minimal and focused
- [ ] No new warnings or errors introduced
- [ ] Security impact assessed
- [ ] Unit test added for the bug scenario
- [ ] Matching, chat, social, and payments flows unaffected
