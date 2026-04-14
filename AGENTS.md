# AGENTS.md - Tayyibt AI Agents Configuration

This file defines how AI agents should behave when working on the Tayyibt project.

## Agent Behavior

### Core Principles
1. **Security First** - All user data must be encrypted, no hardcoded secrets
2. **TDD Workflow** - Write tests before implementation
3. **Islamic Guidelines** - Content moderation for cultural appropriateness
4. **TypeScript Strict** - No `any` types, proper typing everywhere

### Available AI Tools

#### GStack Commands
Use these commands in Claude Code:

| Command | Purpose |
|---------|---------|
| `/office-hours` | Plan new features with 6 forcing questions |
| `/plan-ceo-review` | Validate scope and product fit |
| `/plan-eng-review` | Lock architecture and data flow |
| `/plan-design-review` | Audit UI/UX design |
| `/design-shotgun` | Generate 4-6 mockup options |
| `/design-html` | Generate production UI |
| `/review` | Code review (staff engineer level) |
| `/cso` | Security audit (OWASP + STRIDE) |
| `/qa <url>` | Browser testing on URL |
| `/investigate` | Root cause debugging |
| `/ship` | Ship to production |
| `/land-and-deploy` | Deploy and verify |
| `/document-release` | Update documentation |
| `/browse` | Real browser control |
| `/autoplan` | Auto-run planning pipeline |

#### Superpowers Skills
These activate automatically:

| Skill | Trigger |
|-------|---------|
| `brainstorming` | When planning features |
| `writing-plans` | After design approval |
| `test-driven-development` | During implementation |
| `subagent-driven-development` | With approved plans |
| `requesting-code-review` | Between tasks |

#### PR Agent Commands
In GitHub PRs, mention:

| Command | Action |
|---------|--------|
| `@CodiumAI-Agent /review` | Review the PR |
| `@CodiumAI-Agent /improve` | Auto-improve code |
| `@CodiumAI-Agent /describe` | Generate PR description |
| `@CodiumAI-Agent /ask` | Ask about code |

#### Security Review
- `/security-review` - Run full security audit
- GitHub Action runs automatically on PRs

## Workflow Integration

### Feature Development

```
1. START
   Say: "Let's build [feature]"
   → Use /office-hours to define
   → Use /brainstorming to refine

2. PLAN  
   → /plan-ceo-review validates scope
   → /plan-design-review audits UI
   → /plan-eng-review locks architecture
   → /autoplan creates task list

3. IMPLEMENT
   → test-driven-development for each task
   → subagent-driven-development for parallel work
   
4. REVIEW
   → /review for code quality
   → /security-review for vulnerabilities
   → @CodiumAI-Agent /review for PR feedback
   
5. QA
   → /qa https://staging.tayyibt.com to test
   
6. SHIP
   → /ship to push and open PR
   → /land-and-deploy to verify production
```

### Bug Fix Workflow

```
1. INVESTIGATE
   → /investigate to find root cause
   
2. FIX
   → Write failing test first (TDD)
   → Implement fix
   
3. VERIFY
   → /review for code quality
   → /qa to verify fix works
   
4. SHIP
   → /ship to deploy
```

## Project-Specific Instructions

### Backend (NestJS)
- Use TypeORM with proper entity relationships
- JWT auth with short-lived access tokens
- Rate limiting on all public endpoints
- Input validation with class-validator
- WebSocket for real-time features

### Frontend (Next.js)
- React 18 with TypeScript strict
- Tailwind CSS for styling
- TanStack Query for data fetching
- Socket.IO client for real-time

### AI Service (FastAPI)
- scikit-learn for matching algorithm
- Redis for caching
- RESTful API design

### Security Requirements
- All PII must be encrypted
- No secrets in code
- CORS configuration
- CSRF protection
- Rate limiting
- Content moderation for Islamic guidelines

## Agent Memory

The agent should learn from interactions:
- `/learn` - Manage learned patterns
- Preferences for code style
- Common pitfalls to avoid
- Project-specific patterns

---

*Last updated: 2026-04-14*