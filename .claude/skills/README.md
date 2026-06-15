# Tayyibt Claude Code Skills

Project-specific skills that Claude Code auto-invokes based on the task. Each lives in its own folder as `SKILL.md` with a `name` + `description` frontmatter.

| Skill | Use when |
|-------|----------|
| `backend-nestjs` | Working in `backend/` — NestJS REST/WebSocket APIs, services, DTOs, TypeORM entities, JWT auth, Redis. |
| `frontend-nextjs` | Working in `web/` or `admin/` — Next.js/React/Tailwind components, pages, state, API wiring. |
| `mobile-flutter` | Working in `mobile/` — Flutter/Dart/Riverpod screens, widgets, Dio API calls, secure storage. |
| `ai-matching` | Working in `ai-service/` — FastAPI compatibility scoring, ranking, recommendations. |
| `security-audit` | Reviewing for vulnerabilities, or handling auth, user data, chat, or payments. |

These complement the slash commands in `.claude/commands/` and the external skill packs referenced in `CLAUDE.md` (GStack, Superpowers, etc.).
