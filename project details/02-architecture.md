# 02 — System Architecture

## High-Level Topology

Tayyibt is a containerized microservice system fronted by a single nginx reverse proxy. All public traffic enters through nginx on ports 80/443; every other service is reachable only on the internal Docker bridge network `tayyibt-network`.

```
                            Internet
                               │
                        ┌──────▼───────┐
                        │    nginx     │  :80 → 301 → :443 (HTTPS)
                        │  (1.25)      │  TLS via Let's Encrypt
                        └──────┬───────┘
            ┌──────────────┬───┴────┬──────────────┐
            │              │        │              │
       /  (root)      /admin/    /api/   /socket.io   /ai/
            │              │        │        │         │
      ┌─────▼────┐   ┌─────▼───┐ ┌──▼────────▼──┐  ┌───▼──────┐
      │   web    │   │  admin  │ │   backend     │  │ai-service│
      │ Next.js  │   │ Next.js │ │   NestJS      │  │ FastAPI  │
      │  :3000   │   │  :3001  │ │   :3000       │  │  :5000   │
      └──────────┘   └─────────┘ └──┬────────┬───┘  └───┬──────┘
                                    │        │          │
                          ┌─────────▼──┐  ┌──▼─────┐  ┌─▼────────┐
                          │ PostgreSQL │  │ Redis  │  │  Ollama  │
                          │   :5432    │  │ :6379  │  │  :11434  │
                          └────────────┘  └────────┘  │ gemma3:4b│
                                                       └──────────┘
```

---

## Services

### nginx (reverse proxy)
- Image: `nginx:1.25-alpine`
- Terminates TLS (Let's Encrypt certificate for `145-14-158-100.sslip.io`).
- Redirects all HTTP → HTTPS.
- Routes by path prefix:
  - `/api/` → backend
  - `/socket.io/` → backend (WebSocket upgrade)
  - `/ai/` → ai-service
  - `/admin/` → admin
  - `/` → web
- Adds security headers (X-Frame-Options, X-Content-Type-Options, HSTS, etc.).
- `client_max_body_size 20M` for uploads.

### web (user app)
- Next.js 14 standalone build.
- Server-side rendered + client React Query data fetching.
- Talks to backend via `NEXT_PUBLIC_API_URL` (baked at build time).
- Real-time chat via Socket.IO client to `NEXT_PUBLIC_WS_URL`.

### admin (admin dashboard)
- Separate Next.js 14 standalone build.
- Served under `/admin/`.

### backend (API + WebSocket)
- NestJS 10 monolith with feature modules.
- Global prefix `api/v1`.
- TypeORM → PostgreSQL.
- Redis for caching/sessions.
- Socket.IO gateway for chat & notifications.
- Calls ai-service over HTTP for match scoring.
- JWT authentication (Passport).

### ai-service (AI microservice)
- FastAPI (Python 3.11).
- Rule-based compatibility scoring (instant, deterministic).
- Local LLM (Gemma 3 4B via Ollama) for match reasons, bio suggestions, icebreakers, moderation.
- Redis caching of LLM outputs (7-day TTL).

### ollama (local LLM runtime)
- `ollama/ollama:latest`.
- Hosts `gemma3:4b` (3.3 GB).
- CPU inference; only reachable by ai-service.

### postgres
- `postgres:15-alpine`.
- Persistent volume `postgres_data`.
- 42 application tables.

### redis
- `redis:7-alpine`, password-protected.
- Persistent volume `redis_data`.
- Caching, session store, LLM-output cache.

---

## Request Flow Examples

### A. Loading the match list
1. Browser → `GET https://.../api/v1/matches` (JWT in `Authorization` header).
2. nginx → backend.
3. Backend authenticates JWT, queries `matches` + `profiles` from PostgreSQL.
4. For new matches, backend calls `POST http://ai-service:5000/api/v1/match` with both profiles.
5. ai-service computes rule-based score; if score ≥ 40 and not cached, asks Ollama for reasons; caches in Redis.
6. Backend persists scores, returns enriched match list.

### B. Sending a chat message
1. Browser opens Socket.IO connection → nginx `/socket.io/` → backend gateway.
2. Client emits `sendMessage` with conversation ID + content.
3. Backend encrypts content, persists `messages` row, broadcasts to conversation participants.
4. Recipients receive `newMessage` event in real time.

### C. AI bio suggestion
1. Browser → `POST /ai/api/v1/bio-suggestion`.
2. nginx → ai-service.
3. ai-service builds a short prompt, calls Ollama (`gemma3:4b`), caches result, returns bio text.

---

## Data Persistence

| Store | Purpose | Volume |
|-------|---------|--------|
| PostgreSQL | All relational app data (users, profiles, posts, messages, …) | `postgres_data` |
| Redis | Sessions, rate-limit counters, LLM-output cache | `redis_data` |
| Ollama | Downloaded model weights | `ollama_data` |
| Backend FS | Uploaded media under `/uploads/` | bind/host |

---

## Build-Time vs Runtime Configuration

- **Next.js apps** bake `NEXT_PUBLIC_*` vars at **build time** — changing API URLs requires a rebuild.
- **Backend & ai-service** read config from `.env.production` at **runtime** — changes only need a restart.

This distinction matters during deployment: see [09-deployment.md](./09-deployment.md).

---

## Scaling Considerations (current state)

- Single-instance monolith backend; horizontally scalable behind nginx if session/state externalized (Redis already used).
- AI inference is CPU-bound on a single Ollama instance — the rule-based path keeps the hot path fast, and LLM calls are cached and gated (only score ≥ 40).
- PostgreSQL is a single primary; no read replicas yet.
