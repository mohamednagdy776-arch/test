# Tayyibt Claude Code Skills

Project-specific skills that Claude Code reads as context for each task. Each lives in its own folder as `SKILL.md` with a `name` + `description` frontmatter.

## How to use
Read the relevant skill before starting work on that area. Follow its rules as non-negotiable constraints.

| Skill | Read when |
|-------|-----------|
| `backend-nestjs` | Working in `backend/` — NestJS APIs, services, DTOs, TypeORM entities, JWT/cookie auth, Redis. |
| `frontend-nextjs` | Working in `web/` or `admin/` — Next.js/React/Tailwind, RTL, API wiring, shared UI components. |
| `mobile-flutter` | Working in `mobile/` — Flutter/Dart/Riverpod screens, widgets, Dio API calls. |
| `ai-matching` | Working in `ai-service/` — FastAPI compatibility scoring, ranking, recommendations. |
| `security-audit` | Reviewing for vulnerabilities, or touching auth, user data, chat, or payments. |
| `deployment` | Deploying to VPS, restarting services, checking container logs, running production commands. |
| `database-migration` | Adding/changing DB columns, indexes, or constraints in production (TypeORM `synchronize: false`). |
| `ui-ux` | Designing pages, creating/refactoring UI components, choosing colors/layouts, reviewing UI quality. |

## Sources
- `backend-nestjs`, `frontend-nextjs`, `mobile-flutter`, `ai-matching`, `security-audit` — project-native
- `deployment`, `database-migration` — adapted from [alirezarezvani/claude-skills](https://github.com/alirezarezvani/claude-skills) engineering skills
- `ui-ux` — adapted from [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) (50+ rules, distilled for Next.js + Tailwind + Arabic RTL)

These complement the slash commands in `.claude/commands/` and the external skill packs in `CLAUDE.md` (GStack, Superpowers, etc.).
