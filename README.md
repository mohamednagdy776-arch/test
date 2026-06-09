# Tayyibt

AI-powered smart matchmaking and marriage platform for Muslim communities worldwide.

## Platforms

| Platform | Tech | Port | Purpose |
|----------|------|------|---------|
| **Web App** | Next.js | 3002 | User-facing web (login, matching, chat, groups, posts) |
| **Mobile App** | Flutter | — | Android & iOS user app |
| **Admin Dashboard** | Next.js | 3001 | Internal admin panel |
| **Backend API** | NestJS | 3000 | REST API + WebSocket |
| **AI Service** | FastAPI | 5000 | Matching algorithm |

## Project Structure

```
tayyibt/
├── web/                   # User-facing web app (Next.js)
├── admin/                 # Admin dashboard (Next.js)
├── mobile/                # Flutter mobile app
├── backend/              # NestJS REST API + WebSocket
├── ai-service/            # FastAPI matching engine
├── docker/                # Dockerfiles per service
├── docs/                  # Documentation
├── scripts/               # DB, deploy, and utility scripts
├── docker-compose.yml     # Development stack
├── docker-compose.prod.yml
├── .env.example
└── .github/               # CI/CD workflows
```

## Quick Start (Development)

```bash
# 1. Copy env
cp .env.example .env

# 2. Start all services
docker compose up --build

# 3. Access services
# Web: http://localhost:3002
# Admin: http://localhost:3001
# Backend: http://localhost:3000
```

## Deployment (Production)

### Option 1: Docker Compose
```bash
# Production build
./scripts/deploy.sh production deploy
```

### Option 2: GitHub Actions
Push to `main` branch to trigger automatic build and push to GitHub Container Registry.

```bash
# Manual trigger
git push origin main
```

## Services

| Service | URL | Endpoint |
|---------|-----|----------|
| Web App | http://localhost:3002 | `/` |
| Admin Dashboard | http://localhost:3001 | `/admin` |
| Backend API | http://localhost:3000 | `/api/v1` |
| AI Service | http://localhost:5000 | `/` |
| AI Docs | http://localhost:5000 | `/docs` |

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `REDIS_URL` | Redis connection string | ✅ |
| `JWT_SECRET` | JWT signing key | ✅ |
| `SMTP_*` | Email server configuration | ✅ |
| `AI_SERVICE_URL` | Internal AI service URL | ✅ |

## Tech Stack

- **Backend**: NestJS + TypeScript + PostgreSQL + Redis
- **Web**: Next.js + React + Tailwind CSS
- **Admin**: Next.js + React + Tailwind CSS
- **Mobile**: Flutter + Dart + Riverpod
- **AI**: FastAPI + Python + scikit-learn
- **Auth**: JWT (access 15m + refresh 7d)
- **Real-time**: Socket.IO WebSocket
- **Docker**: Multi-stage builds with health checks
- **CI/CD**: GitHub Actions with security scanning

## Test Credentials

| Email | Password | Role |
|-------|----------|------|
| admin@tayyibt.com | Admin1234 | admin |
| user1@tayyibt.com | Test1234 | user |
| user2@tayyibt.com | Test1234 | user |

## Documentation

See `docs/` for:
- API specification (`docs/api/api-spec.md`)
- Architecture diagrams (`docs/architecture/system-design.md`)
- Database schema (`docs/database/erd.md`)
- Deployment guide (`docs/deployment/deployment-guide.md`)