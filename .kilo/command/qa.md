---
description: Run browser tests on URL
agent: qa
model: anthropic/claude-sonnet-4-20250514
---
Run browser testing using GStack's /qa skill.

When user provides a URL:
1. Open the URL in real browser
2. Test critical user flows:
   - Login/signup
   - Profile viewing
   - Search and filtering
   - Matching features
   - Chat functionality
3. Take screenshots of bugs
4. Generate regression tests for any fixes

Use @AGENTS.md for testing patterns. Reference existing tests in @web/.