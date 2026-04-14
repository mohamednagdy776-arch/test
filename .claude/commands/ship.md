# Deploy to Production

## Purpose
Ship all changes from the current branch to production, including:
- Running all tests
- Building all services
- Deploying to production server
- Verifying health

## Prerequisites
- All tests must pass
- Code review must be completed
- Security review must pass
- Must be on a feature branch (not main)

## Usage

```bash
# Run this command when ready to ship
/ship
```

## What Happens

1. **Verification Phase**
   - Runs full test suite
   - Checks code coverage
   - Validates build

2. **Merge Phase**
   - Syncs with main branch
   - Resolves any conflicts
   - Merges current branch

3. **Build Phase**
   - Builds all Docker services
   - Runs database migrations

4. **Deploy Phase**
   - Pushes to production
   - Runs health checks
   - Monitors for errors

5. **PR Phase**
   - Opens pull request
   - Adds test results
   - Tags reviewers

## Manual Steps After
- Review and merge the PR
- Run `/land-and-deploy` to verify production

---

*Use `/land-and-deploy` after merge to verify production*