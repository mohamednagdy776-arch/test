# AI Tools Integration Guide

Comprehensive guide for integrating 5 powerful AI development tools into the Tayyibt project workflow.

## Table of Contents

1. [Overview](#overview)
2. [Superpowers - Development Workflow](#superpowers---development-workflow)
3. [Frontend Design Plugin](#frontend-design-plugin)
4. [PR Agent - Automated Code Review](#pr-agent---automated-code-review)
5. [GStack - Engineering Team Automation](#gstack---engineering-team-automation)
6. [Security Review - Automated Security Audits](#security-review---automated-security-audits)
7. [Integration Strategy](#integration-strategy)

---

## Overview

This guide integrates 5 powerful AI tools to create a comprehensive development workflow:

| Tool | Purpose | Best For |
|------|---------|----------|
| **Superpowers** | Complete development methodology | Structured workflow, TDD, code review |
| **Frontend Design** | Production-grade UI generation | Beautiful, distinctive frontends |
| **PR Agent** | Automated PR review/improvement | GitHub automation, code quality |
| **GStack** | 23 specialist AI agents | Scaling solo development |
| **Security Review** | AI security auditing | Vulnerability detection |

---

## Superpowers - Development Workflow

**Repository**: https://github.com/obra/superpowers

### What It Does
Complete software development methodology with composable skills that automate the entire development lifecycle:
- **brainstorming** - Socratic design refinement before coding
- **writing-plans** - Detailed implementation plans (2-5 min tasks)
- **test-driven-development** - RED-GREEN-REFACTOR cycle
- **subagent-driven-development** - Parallel agent execution
- **requesting-code-review** - Pre-commit reviews

### Installation

```bash
# Claude Code marketplace
/plugin install superpowers@claude-plugins-official

# Or add marketplace first
/plugin marketplace add obra/superpowers-marketplace
/plugin install superpowers@superpowers-marketplace
```

### Workflow Integration

```markdown
## Development Workflow

1. **Start Feature**: Run `/brainstorming` to refine the design
2. **Get Approval**: Present design in chunks for validation
3. **Plan Work**: Run `/writing-plans` to create task list
4. **Implement**: Subagents execute each 2-5 minute task
5. **Review**: Run `/requesting-code-review` between tasks
6. **Complete**: Run `/finishing-a-development-branch`
```

### Key Skills

| Skill | Trigger | Purpose |
|-------|---------|---------|
| brainstorming | "help me plan this" | Design refinement |
| writing-plans | After design approval | Task breakdown |
| test-driven-development | During implementation | TDD cycle |
| subagent-driven-development | With approved plan | Parallel execution |
| requesting-code-review | Between tasks | Quality gate |

---

## Frontend Design Plugin

**Repository**: https://github.com/anthropics/claude-code/tree/main/plugins/frontend-design

### What It Does
Generates distinctive, production-grade frontend interfaces that avoid generic AI aesthetics:
- Bold aesthetic choices
- Distinctive typography and color palettes
- High-impact animations and visual details
- Context-aware implementation

### Installation

```bash
/plugin install frontend-design@claude-plugins-official
```

### Usage

```bash
# Just describe what you want
"Create a dashboard for a music streaming app"
"Build a landing page for an AI security startup"
"Design a settings panel with dark mode"
```

### Tayyibt Integration

The plugin automatically activates for frontend work. For the Tayyibt project:

1. **Landing Page**: Describe Islamic/Muslim-friendly aesthetic
2. **Dashboard**: Match the platform's modern, clean design
3. **Profile Pages**: Consistent typography and color scheme
4. **Matching Interface**: Distinctive, professional look

### Best Practices

- Provide specific aesthetic direction
- Reference existing design tokens
- Specify brand colors and typography

---

## PR Agent - Automated Code Review

**Repository**: https://github.com/qodo-ai/pr-agent

### What It Does
AI-powered code review agent with comprehensive PR functionality:
- **/describe** - Generate PR descriptions
- **/review** - Comprehensive code review
- **/improve** - Auto-suggest improvements
- **/ask** - Question code sections

### Installation

#### GitHub Action (Recommended)

```yaml
# .github/workflows/pr-agent.yml
name: PR Agent
on:
  pull_request:
    types: [opened, synchronize]

jobs:
  pr_agent_job:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: Codium-ai/pr-agent@main
        env:
          OPENAI_KEY: ${{ secrets.OPENAI_KEY }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

#### Local CLI

```bash
pip install pr-agent
export OPENAI_KEY=your_key
pr-agent --pr_url https://github.com/owner/repo/pull/123 review
```

### Tayyibt GitHub Integration

1. Go to repository **Settings** → **Secrets**
2. Add `OPENAI_KEY` (or `ANTHROPIC_API_KEY` for Claude)
3. The action will automatically run on all PRs

### Configuration

Create `.pr_agent.toml`:

```toml
[github]
pr_title_prefix = "[Tayyibt]"

[pr_description]
add_original_description = true
generate_title_from_commit = true

[pr_review]
extra_instructions = """
Focus on:
- TypeScript/Next.js best practices
- Security vulnerabilities
- Performance implications
- Islamic content moderation
"""

[pr_improve]
accept_suggestions = true
```

---

## GStack - Engineering Team Automation

**Repository**: https://github.com/garrytan/gstack

### What It Does
23 opinionated AI agents that serve as complete engineering team:
- **CEO** - Product rethinking, scope management
- **Designer** - UI/UX review, AI slop detection
- **Eng Manager** - Architecture, data flow
- **QA Lead** - Browser testing, bug finding
- **Release Manager** - Ship, deploy, canary
- **Security Officer** - OWASP + STRIDE audits
- **Technical Writer** - Documentation

### Installation

```bash
git clone --single-branch --depth 1 https://github.com/garrytan/gstack.git ~/.claude/skills/gstack
cd ~/.claude/skills/gstack
./setup
```

### Update CLAUDE.md

Add to your project's `CLAUDE.md`:

```markdown
## gstack
Use /browse from gstack for all web browsing. Never use mcp__claude-in-chrome__* tools.
Available skills: /office-hours, /plan-ceo-review, /plan-eng-review, /plan-design-review,
/design-consultation, /design-shotgun, /design-html, /review, /ship, /land-and-deploy,
/canary, /benchmark, /browse, /qa, /qa-only, /design-review, /investigate, /cso,
/autoplan, /document-release, /codex, /careful, /freeze, /guard, /unfreeze, /retro.
```

### Key Skills for Tayyibt

| Skill | Command | Use Case |
|-------|---------|----------|
| Office Hours | `/office-hours` | Plan new features |
| CEO Review | `/plan-ceo-review` | Validate scope |
| Design Review | `/plan-design-review` | UI/UX audit |
| QA Testing | `/qa https://staging...` | Test running app |
| Security Audit | `/cso` | OWASP audit |
| Code Review | `/review` | Pre-merge review |
| Ship | `/ship` | Merge and deploy |

### Example Workflow

```
You: /office-hours
Claude: [asks about the feature, challenges your assumptions]

You: /plan-ceo-review  
Claude: [reviews scope, finds 10-star product]

You: /plan-eng-review
Claude: [locks architecture, diagrams]

You: /autoplan
Claude: [creates implementation plan]

[Implement the plan]

You: /review
Claude: [finds bugs, auto-fixes]

You: /qa https://tayyibt.com
Claude: [tests in browser, finds UI bugs]

You: /ship
Claude: [runs tests, pushes to main, opens PR]
```

---

## Security Review - Automated Security Audits

**Repository**: https://github.com/anthropics/claude-code-security-review

### What It Does
AI-powered security analysis for pull requests:
- Detects 20+ vulnerability types
- Context-aware semantic analysis
- False positive filtering
- PR comments with findings

### Installation

#### GitHub Action

```yaml
# .github/workflows/security.yml
name: Security Review
permissions:
  pull-requests: write
  contents: read

on:
  pull_request:

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          ref: ${{ github.event.pull_request.head.sha }}
          fetch-depth: 2
      
      - uses: anthropics/claude-code-security-review@main
        with:
          comment-pr: true
          claude-api-key: ${{ secrets.CLAUDE_API_KEY }}
```

#### Claude Code Command

```bash
# Just run in Claude Code
/security-review
```

### Detected Vulnerabilities

- **Injection**: SQL, Command, LDAP, XPath, NoSQL, XXE
- **Auth**: Broken auth, privilege escalation, IDOR
- **Data Exposure**: Hardcoded secrets, PII leakage
- **Crypto**: Weak algorithms, improper key management
- **Code Execution**: RCE, deserialization, eval injection
- **XSS**: Reflected, stored, DOM-based

### Tayyibt-Specific Considerations

```markdown
Security focus areas:
- User authentication and JWT handling
- Profile data protection (personal information)
- Payment integration security
- Content moderation for Islamic guidelines
- API rate limiting
- Cross-site scripting prevention
```

---

## Integration Strategy

### Phase 1: Immediate Setup

1. **Install Superpowers** (Development workflow)
2. **Install GStack** (All-around productivity)
3. **Install Frontend Design** (UI generation)

### Phase 2: GitHub Automation

1. Add PR Agent GitHub Action
2. Add Security Review GitHub Action
3. Configure API keys as secrets

### Phase 3: Workflow Integration

```
┌─────────────────────────────────────────────────────────────┐
│                    TAYYIBT DEVELOPMENT                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. START                                                   │
│     └─→ /office-hours (GStack)                              │
│         └─→ /brainstorming (Superpowers)                   │
│                                                              │
│  2. PLAN                                                    │
│     └─→ /plan-ceo-review (GStack)                          │
│         └─→ /plan-design-review (GStack)                  │
│         └─→ /plan-eng-review (GStack)                     │
│         └─→ /writing-plans (Superpowers)                   │
│                                                              │
│  3. IMPLEMENT                                               │
│     └─→ /autoplan (GStack)                                 │
│         └─→ test-driven-development (Superpowers)          │
│         └─→ subagent-driven-development (Superpowers)      │
│                                                              │
│  4. REVIEW                                                  │
│     └─→ /review (GStack)                                   │
│         └─→ /requesting-code-review (Superpowers)          │
│         └─→ /security-review (Security Review)            │
│         └─→ @CodiumAI-Agent /review (PR Agent)            │
│                                                              │
│  5. QA                                                      │
│     └─→ /qa https://staging.tayyibt.com (GStack)          │
│         └─→ @CodiumAI-Agent /improve (PR Agent)            │
│                                                              │
│  6. SHIP                                                    │
│     └─→ /ship (GStack)                                     │
│         └─→ /land-and-deploy (GStack)                      │
│         └─→ /document-release (GStack)                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Quick Reference Commands

| Tool | Command | Purpose |
|------|---------|---------|
| Superpowers | `/brainstorming` | Design refinement |
| Superpowers | `/writing-plans` | Task breakdown |
| Superpowers | `test-driven-development` | TDD cycle |
| GStack | `/office-hours` | Product planning |
| GStack | `/plan-ceo-review` | Scope validation |
| GStack | `/design-html` | UI from mockup |
| GStack | `/qa <url>` | Browser testing |
| GStack | `/cso` | Security audit |
| GStack | `/ship` | Ship to production |
| Frontend | (automatic) | UI generation |
| PR Agent | `@CodiumAI-Agent /review` | PR review |
| Security | `/security-review` | Security audit |

### Recommended Usage by Scenario

| Scenario | Recommended Tools |
|----------|------------------|
| New feature | GStack `/office-hours` → Superpowers `/brainstorming` |
| UI work | Frontend Design + GStack `/design-html` |
| Bug fix | GStack `/investigate` → GStack `/review` → GStack `/qa` |
| Security focus | GStack `/cso` + Security Review `/security-review` |
| Quick review | PR Agent `/review` |
| Full review | GStack `/review` + PR Agent + Security |
| Ship feature | GStack `/ship` → `/land-and-deploy` |

---

## Configuration Files

### CLAUDE.md Example

```markdown
# Tayyibt Development Guide

## Project Overview
- **Type**: Next.js + NestJS full-stack application
- **Purpose**: AI-powered Muslim matchmaking platform
- **Tech Stack**: Next.js, NestJS, PostgreSQL, Redis, FastAPI

## Development Workflow

### Primary Tools
- **Superpowers**: Full development methodology
- **GStack**: 23 specialist AI agents
- **Frontend Design**: UI generation
- **PR Agent**: Automated PR review
- **Security Review**: Security auditing

### Available Commands

#### Planning
- `/office-hours` - Product planning (GStack)
- `/plan-ceo-review` - Scope validation (GStack)
- `/plan-eng-review` - Architecture review (GStack)
- `/brainstorming` - Design refinement (Superpowers)
- `/writing-plans` - Task breakdown (Superpowers)

#### Implementation
- `/design-html` - Generate UI from description (GStack)
- `/design-shotgun` - Generate mockup options (GStack)
- `test-driven-development` - TDD cycle (Superpowers)

#### Review & QA
- `/review` - Code review (GStack)
- `/qa <url>` - Browser testing (GStack)
- `/cso` - Security audit (GStack)
- `@CodiumAI-Agent /review` - PR review (PR Agent)
- `/security-review` - Security audit (Security)

#### Deployment
- `/ship` - Ship to production (GStack)
- `/land-and-deploy` - Deploy and verify (GStack)
- `/document-release` - Update docs (GStack)

## Code Standards
- TypeScript strict mode
- TDD for new features
- Security-first mindset
- Mobile-first responsive design

## Important Notes
- All user data must be encrypted
- Content moderation for Islamic guidelines
- Rate limiting on all APIs
```

### .github/workflows/ci.yml Example

```yaml
name: CI / QA

on:
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm install && npm test

  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: anthropics/claude-code-security-review@main
        with:
          comment-pr: true
          claude-api-key: ${{ secrets.CLAUDE_API_KEY }}

  pr-review:
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request'
    steps:
      - uses: Codium-ai/pr-agent@main
        env:
          OPENAI_KEY: ${{ secrets.OPENAI_KEY }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

---

## Tips for Maximum Productivity

1. **Don't skip planning**: Use `/office-hours` before any significant work
2. **Leverage parallel agents**: GStack can run 10-15 parallel sprints
3. **Automate reviews**: Let PR Agent and Security Review handle routine checks
4. **Browser testing**: Use `/qa` to actually test your running app
5. **Ship frequently**: Use `/ship` to maintain deployment momentum
6. **Document automatically**: Let `/document-release` keep docs current

---

*Last updated: 2026-04-14*