---
description: Auto-run complete planning pipeline
agent: orchestrator
model: anthropic/claude-sonnet-4-20250514
---
Run automatic planning pipeline using /autoplan.

This runs in sequence:
1. /plan-ceo-review - Strategic scope validation
2. /plan-design-review - UI/UX audit
3. /plan-eng-review - Architecture lock
4. /writing-plans - Detailed task breakdown

Returns a fully reviewed implementation plan.

Use @CLAUDE.md for project context. Output tasks to @TODOS.md