# Release Flow

## Environments

- Development (local): frequent changes, no restrictions
- Staging: mirror of production, used for QA and testing
- Production: live environment, real users, strict controls

---

## Branching Strategy

```
main        → production-ready code
develop     → integration branch
feature/*   → new features (branch from develop)
hotfix/*    → urgent production fixes (branch from main)
```

---

## Feature Release Process

1. Branch from `develop`: `feature/<feature-name>`
2. Develop and test locally
3. Open PR → `develop`
4. Code review + CI pass
5. Merge to `develop`
6. Deploy to staging, QA validation
7. Open PR → `main`
8. Final review + approval
9. Merge to `main`, deploy to production
10. Monitor logs and error rates post-deploy

---

## Hotfix Process

1. Branch from `main`: `hotfix/<issue-name>`
2. Apply minimal fix
3. PR → `main` (fast review)
4. Deploy to production
5. Backport fix to `develop`

---

## Pre-Deploy Checklist

- [ ] All tests passing (unit + integration)
- [ ] No secrets hardcoded
- [ ] Environment variables updated
- [ ] DB migrations applied to staging first
- [ ] API changes are backward compatible (or versioned)
- [ ] QA sign-off on staging

---

## Post-Deploy Monitoring

- Watch error logs for 30 minutes after release
- Verify core flows: auth, matching, chat, payments
- Check Redis cache is warming correctly
- Confirm AI service response times < 200ms
