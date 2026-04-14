---
description: Run comprehensive code review
agent: orchestrator
model: anthropic/claude-sonnet-4-20250514
---
Run code review using GStack's /review and Superpowers skills.

1. First run /review (GStack) for staff engineer review:
   - Bug detection
   - Security issues
   - Performance concerns
   - Code quality

2. Then run Superpowers requesting-code-review:
   - Check against plan
   - Verify implementation
   - Report issues by severity

3. Finally run /autoplan to auto-run CEO+design+eng review

Use @AGENTS.md for code standards. Reference @.kiro/steering/coding-standards.md