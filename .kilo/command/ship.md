---
description: Ship feature to production
agent: deploy
model: anthropic/claude-sonnet-4-20250514
---
Ship current feature to production using GStack's /ship skill.

Steps:
1. Verify tests pass: run npm test, also for backend
2. Run type-check: npm run type-check for web, admin, backend
3. Run linter: npm run lint
4. Sync with main branch
5. Merge feature branch
6. Build Docker images
7. Push to registry
8. Deploy to production
9. Open PR with results

After this, run /land-and-deploy to verify production.

Reference: @deployment/DEPLOYMENT_GUIDE.md for deployment process.