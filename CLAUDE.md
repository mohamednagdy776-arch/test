# CLAUDE.md - Tayyibt Development Guide

## Project Overview

**Tayyibt** - AI-powered smart matchmaking and marriage platform for Muslim communities worldwide.

### Tech Stack
- **Frontend**: Next.js 14, React 18, Tailwind CSS
- **Backend**: NestJS, TypeScript, PostgreSQL, Redis
- **Mobile**: Flutter, Dart, Riverpod
- **AI Service**: FastAPI, Python, scikit-learn
- **Real-time**: Socket.IO WebSocket

### Services
| Service | Port | URL |
|---------|------|-----|
| Web App | 3002 | http://localhost:3002 |
| Admin | 3001 | http://localhost:3001 |
| Backend API | 3000 | http://localhost:3000/api/v1 |
| AI Service | 5000 | http://localhost:5000 |

---

## AI Development Tools

This project uses 5 AI tools for comprehensive development workflow.

### 1. Superpowers - Development Methodology
**Repository**: https://github.com/obra/superpowers

Complete development methodology with composable skills:
- **brainstorming** - Socratic design refinement
- **writing-plans** - Detailed task breakdown (2-5 min tasks)
- **test-driven-development** - RED-GREEN-REFACTOR cycle
- **subagent-driven-development** - Parallel agent execution
- **requesting-code-review** - Pre-commit quality gate
- **finishing-a-development-branch** - Merge workflow

### 2. GStack - Engineering Team Automation
**Repository**: https://github.com/garrytan/gstack

23 specialist AI agents that act as a complete engineering team:

| Skill | Purpose |
|-------|---------|
| `/office-hours` | Product planning with 6 forcing questions |
| `/plan-ceo-review` | Strategic scope validation |
| `/plan-eng-review` | Architecture & data flow review |
| `/plan-design-review` | UI/UX audit & rating |
| `/design-shotgun` | Generate 4-6 mockup variants |
| `/design-html` | Turn mockups to production HTML |
| `/review` | Staff engineer code review |
| `/cso` | OWASP + STRIDE security audit |
| `/qa <url>` | Real browser testing |
| `/investigate` | Root cause debugging |
| `/ship` | Merge, test, push, open PR |
| `/land-and-deploy` | Deploy & verify production |
| `/document-release` | Auto-update docs |
| `/browse` | Real Chromium browser control |
| `/codex` | OpenAI Codex second opinion |
| `/autoplan` | Auto-run CEO → design → eng review |
| `/careful` | Safety guardrails |
| `/freeze` | Lock edits to directory |
| `/retro` | Weekly team retrospective |

**Installation**:
```bash
git clone --single-branch --depth 1 https://github.com/garrytan/gstack.git ~/.claude/skills/gstack
cd ~/.claude/skills/gstack && ./setup
```

### 3. Frontend Design Plugin
**Repository**: https://github.com/anthropics/claude-code/tree/main/plugins/frontend-design

Generates distinctive, production-grade frontend interfaces:
- Bold aesthetic choices
- Distinctive typography and color palettes
- High-impact animations
- Context-aware implementation

**Installation**: `/plugin install frontend-design@claude-plugins-official`

### 4. PR Agent - Automated Code Review
**Repository**: https://github.com/qodo-ai/pr-agent

AI-powered PR review automation:
- `/describe` - Generate PR descriptions
- `/review` - Comprehensive code review
- `/improve` - Auto-suggest improvements
- `/ask` - Question code sections

### 5. Security Review - AI Security Audits
**Repository**: https://github.com/anthropics/claude-code-security-review

AI-powered security vulnerability detection:
- `/security-review` - Run security audit
- GitHub Action for auto-PR scanning

Detects: SQL injection, XSS, auth flaws, hardcoded secrets, crypto issues, and 20+ more.

---

## Development Workflow

### Standard Feature Flow

```
1. START
   /office-hours (GStack) → Define the feature
   /brainstorming (Superpowers) → Refine design

2. PLAN
   /plan-ceo-review (GStack) → Validate scope
   /plan-design-review (GStack) → UI/UX review
   /plan-eng-review (GStack) → Architecture lock
   /autoplan (GStack) → Auto-generate tasks
   
3. IMPLEMENT
   test-driven-development (Superpowers) → TDD cycle
   subagent-driven-development (Superpowers) → Parallel work
   
4. REVIEW
   /review (GStack) → Code review
   /security-review (Security) → Security audit
   @CodiumAI-Agent /review (PR Agent) → PR review
   
5. QA
   /qa https://staging.tayyibt.com (GStack) → Browser testing
   @CodiumAI-Agent /improve (PR Agent) → Auto-fix
   
6. SHIP
   /ship (GStack) → Run tests, push, open PR
   /land-and-deploy (GStack) → Deploy to production
   /document-release (GStack) → Update docs
```

---

## Quick Commands Reference

| Command | Tool | Purpose |
|---------|------|---------|
| `/office-hours` | GStack | Plan new feature |
| `/plan-ceo-review` | GStack | Validate scope |
| `/design-html` | GStack | Generate UI |
| `/review` | GStack | Code review |
| `/cso` | GStack | Security audit |
| `/qa <url>` | GStack | Browser testing |
| `/ship` | GStack | Ship to production |
| `/security-review` | Security | Vulnerability scan |
| `@CodiumAI-Agent /review` | PR Agent | PR review |
| `test-driven-development` | Superpowers | TDD workflow |

---

## Code Standards

- **TypeScript**: Strict mode enabled
- **Testing**: Jest for backend, React Testing Library for web
- **TDD**: Write failing test first, then implementation
- **Security**: All user data must be encrypted
- **Content**: Islamic guidelines moderation
- **API**: RESTful with proper error handling
- **Database**: TypeORM with migrations

---

## Important Notes

1. **User Data**: All personal information must be encrypted at rest
2. **Content Moderation**: Islamic guidelines must be enforced
3. **Rate Limiting**: Implement on all public APIs
4. **Authentication**: JWT with short-lived access tokens
5. **Real-time**: Socket.IO for chat and notifications

---

## Test Credentials

| Email | Password | Role |
|-------|----------|------|
| admin@tayyibt.com | Admin1234 | admin |
| user1@tayyibt.com | Test1234 | user |
| user2@tayyibt.com | Test1234 | user |

---

*Last updated: 2026-04-14*
