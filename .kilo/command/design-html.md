---
description: Generate production UI from description
agent: frontend
model: anthropic/claude-sonnet-4-20250514
---
Generate production-ready UI using GStack's /design-html skill.

When the user describes what they want:
1. First run /design-shotgun to generate 4-6 visual mockup options
2. Let user pick their favorite
3. Then run /design-html to generate production HTML

Requirements:
- Use Tailwind CSS from @web/tailwind.config.js
- Follow @AGENTS.md for frontend patterns
- Respect Tayyibt design guidelines (emerald/gold palette)
- Make it responsive and accessible

Reference: @web/src/components/ for existing patterns.