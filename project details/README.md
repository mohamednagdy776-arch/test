# Tayyibt — Project Documentation

> **Tayyibt (طيبت)** — an AI-powered smart matchmaking and marriage platform for Muslim communities worldwide.

This folder contains the complete technical documentation for the Tayyibt platform. Each file covers one area in depth.

---

## Documentation Index

| # | Document | Description |
|---|----------|-------------|
| 00 | [README.md](./README.md) | This index |
| 01 | [01-overview.md](./01-overview.md) | Product vision, goals, target users, feature summary |
| 02 | [02-architecture.md](./02-architecture.md) | System architecture, service topology, request flow |
| 03 | [03-tech-stack.md](./03-tech-stack.md) | Every technology, library, and version used |
| 04 | [04-backend.md](./04-backend.md) | NestJS backend: modules, services, controllers |
| 05 | [05-frontend.md](./05-frontend.md) | Next.js web app: pages, features, components |
| 06 | [06-ai-service.md](./06-ai-service.md) | FastAPI AI service + local Gemma 3 LLM |
| 07 | [07-database.md](./07-database.md) | PostgreSQL schema, all 42 tables, entities |
| 08 | [08-api-reference.md](./08-api-reference.md) | Full REST API endpoint reference |
| 09 | [09-deployment.md](./09-deployment.md) | VPS deployment, Docker, nginx, SSL |
| 10 | [10-testing.md](./10-testing.md) | Automated test suite, 145 test cases |
| 11 | [11-security.md](./11-security.md) | Auth, encryption, threat model |
| 12 | [12-qa-audit-resolution.md](./12-qa-audit-resolution.md) | QA audit findings + resolution status |

---

## Quick Facts

| Property | Value |
|----------|-------|
| **Product name** | Tayyibt (طيبت) |
| **Domain** | https://145-14-158-100.sslip.io |
| **Frontend** | Next.js 14 (React 18), Tailwind CSS |
| **Admin** | Next.js 14 (separate app) |
| **Backend** | NestJS 10, TypeScript, TypeORM |
| **Database** | PostgreSQL 15 |
| **Cache / sessions** | Redis 7 |
| **AI service** | FastAPI (Python 3.11) |
| **Local LLM** | Gemma 3 4B via Ollama |
| **Real-time** | Socket.IO (WebSocket) |
| **Reverse proxy** | nginx 1.25 |
| **Container runtime** | Docker + Docker Compose v2 |
| **Database tables** | 42 |
| **Seeded test users** | 50 (19 countries) |

---

## Service Ports

| Service | Internal Port | Public Path (prod) |
|---------|---------------|--------------------|
| Web app | 3000 | `/` |
| Admin | 3001 | `/admin/` |
| Backend API | 3000 | `/api/v1/` |
| AI service | 5000 | `/ai/` |
| Ollama | 11434 | internal only |
| PostgreSQL | 5432 | internal only |
| Redis | 6379 | internal only |
| nginx | 80, 443 | public entry point |

---

## Repository Layout

```
Tayyibt/
├── web/                    # Next.js user-facing app
├── admin/                  # Next.js admin dashboard
├── backend/                # NestJS REST API + WebSocket
├── ai-service/             # FastAPI AI microservice
├── docker/                 # Dockerfiles + nginx config
│   ├── backend/
│   ├── web/
│   ├── admin/
│   ├── ai-service/
│   └── nginx/
├── scripts/                # Deployment + test automation
├── project details/        # This documentation
├── docker-compose.yml      # Local development
├── docker-compose.vps.yml  # Production (VPS)
└── .env.production         # Production secrets (gitignored)
```

---

## Test Credentials

| Email | Password | Role |
|-------|----------|------|
| `omar.khalifa@tayyibt.test` | `Test1234` | user (male, Saudi) |
| `fatima.alzahra@tayyibt.test` | `Test1234` | user (female, Egypt) |
| `ahmed.alrashid@tayyibt.test` | `Test1234` | user (male, Egypt) |

All 50 seeded users follow the pattern `firstname.lastname@tayyibt.test` / `Test1234`.

---

*Last updated: June 2026*
