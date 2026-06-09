# 03 — Technology Stack

## Overview

| Layer | Technology |
|-------|-----------|
| User frontend | Next.js 14, React 18, TypeScript, Tailwind CSS |
| Admin frontend | Next.js 14, React 18, TypeScript |
| Backend API | NestJS 10, TypeScript, TypeORM |
| Database | PostgreSQL 15 |
| Cache / sessions | Redis 7 |
| AI service | FastAPI, Python 3.11 |
| Local LLM | Gemma 3 4B (Ollama runtime) |
| Real-time | Socket.IO (WebSocket) |
| Reverse proxy | nginx 1.25 |
| Containerization | Docker + Docker Compose v2 |
| TLS | Let's Encrypt (certbot) |

---

## Frontend — `web/`

```json
{
  "name": "tayyibt-web",
  "scripts": {
    "dev": "next dev -p 3002",
    "build": "next build",
    "start": "next start -p 3002"
  },
  "dependencies": {
    "@phosphor-icons/react": "^2.1.10",
    "@tanstack/react-query": "^5.0.0",
    "axios": "^1.6.0",
    "clsx": "^2.0.0",
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "socket.io-client": "^4.7.0",
    "tailwind-merge": "^2.0.0"
  },
  "devDependencies": {
    "tailwindcss": "^3.4.0",
    "typescript": "^5.0.0",
    "eslint-config-next": "^14.0.0"
  }
}
```

**Key libraries**
- **@tanstack/react-query 5** — server state management, caching, mutations.
- **axios** — HTTP client (configured in `web/src/lib/api-client.ts` with JWT interceptor).
- **socket.io-client 4** — real-time chat.
- **@phosphor-icons/react** — icon set.
- **tailwind-merge + clsx** — class composition.
- **Next.js config**: `output: 'standalone'` (required for the Docker multi-stage build).

---

## Backend — `backend/`

```json
{
  "name": "tayyibt-backend",
  "scripts": {
    "build": "nest build",
    "start": "node dist/main",
    "start:dev": "nest start --watch",
    "test": "jest --runInBand",
    "seed": "ts-node seed-users.ts"
  }
}
```

**Core dependencies**
| Package | Version | Purpose |
|---------|---------|---------|
| `@nestjs/common` `@nestjs/core` | ^10 | Framework |
| `@nestjs/typeorm` `typeorm` | ^10 / ^0.3 | ORM |
| `pg` | ^8 | PostgreSQL driver |
| `@nestjs/jwt` `@nestjs/passport` `passport-jwt` | ^10 / ^10 / ^4 | Auth |
| `bcryptjs` | ^2.4 | Password hashing |
| `@nestjs/platform-socket.io` `@nestjs/websockets` | ^10 | Real-time |
| `@nestjs/throttler` | ^5 | Rate limiting |
| `@nestjs/axios` `axios` | ^4 / ^1.14 | Calling ai-service |
| `class-validator` `class-transformer` | ^0.14 / ^0.5 | DTO validation |
| `redis` | ^4 | Cache client |
| `@nestjs/swagger` | ^7.4 | API docs (dev) |

**Runtime**: Node 20 (alpine in Docker).

---

## AI Service — `ai-service/`

```
fastapi==0.111.0
uvicorn[standard]==0.29.0
pydantic==2.7.0
pydantic-settings==2.2.1
redis==5.0.4
httpx==0.27.0
python-dotenv==1.0.1
```

- **FastAPI** — async web framework.
- **uvicorn** — ASGI server.
- **pydantic 2 / pydantic-settings** — request schemas + env config.
- **httpx** — calls Ollama.
- **redis** — caches LLM outputs.
- **Runtime**: Python 3.11.

> Note: the original NVIDIA/scikit-learn dependencies were removed when the service migrated to a local Gemma model via Ollama. The current scoring is pure-Python rule-based + LLM text generation.

---

## Local LLM

- **Model**: `gemma3:4b` (Google Gemma 3, 4 billion parameters, ~3.3 GB quantized).
- **Runtime**: Ollama (`ollama/ollama:latest`).
- **Inference**: CPU.
- **Generation settings**: `num_predict` 150 tokens max, `temperature` 0.3, `top_p` 0.9, `repeat_penalty` 1.1.
- **Caching**: every prompt result cached in Redis for 7 days (keyed by prompt hash).

---

## Infrastructure

| Component | Image / Tool |
|-----------|--------------|
| Reverse proxy | `nginx:1.25-alpine` |
| Database | `postgres:15-alpine` |
| Cache | `redis:7-alpine` |
| LLM runtime | `ollama/ollama:latest` |
| Node base | `node:20-alpine` |
| Python base | `python:3.11` |
| TLS | certbot (Let's Encrypt) |
| Orchestration | Docker Compose v2 |
| Host OS | Ubuntu 24.04 (Hostinger VPS) |

---

## Tooling / Dev Environment

- **Kilo** AI orchestration config (`kilo.json`) with Anthropic Claude models.
- TypeScript strict mode across backend, web, admin.
- Jest (backend), React Testing Library (web).
- Python test automation in `scripts/run-tests.py` (paramiko-driven API tests against the live VPS).
