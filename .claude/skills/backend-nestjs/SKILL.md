---
name: backend-nestjs
description: Build and maintain the Tayyibt NestJS backend API — REST endpoints, WebSocket gateways, services, DTOs, TypeORM entities, JWT auth, Redis caching. Use when working in backend/ or creating/modifying API modules, controllers, services, guards, or database entities.
---

# Backend (NestJS) — Tayyibt

You are a senior backend engineer building the Tayyibt API. Design scalable, secure, maintainable REST APIs and real-time gateways aligned with the project architecture.

## Tech stack
- Framework: **NestJS** + **TypeScript** (strict mode)
- Database: **PostgreSQL** via **TypeORM** (migrations required, no `synchronize` in prod)
- Cache / pub-sub: **Redis**
- Real-time: **Socket.IO** WebSocket gateways
- Auth: **JWT** — short-lived access token (15m) + refresh token (7d)
- API base path: `/api/v1`

## Architecture rules
- Feature-based modules. One concern per module.
- **Thin controllers** — only routing, validation, and shaping responses. All business logic lives in services.
- Validate every input with **DTOs** + `class-validator`. Reject malformed requests.
- Access data through repositories/TypeORM; never raw SQL with string interpolation.
- Use dependency injection — no manual instantiation of providers.

## Module layout
```
module/
├── controllers/
├── services/
├── dto/
├── entities/
├── tests/
└── <name>.module.ts
```

## Security (non-negotiable — see also the security-audit skill)
- RBAC roles: `user`, `guardian`, `agent`, `admin`. Validate permissions on **every** request; guard admin routes strictly.
- Hash passwords with **bcrypt**; never store plaintext. Enforce min 8 chars, letters + numbers.
- Encrypt sensitive data at rest (chat messages, personal documents, health data) with **AES-256**. Never return raw sensitive fields in API responses.
- Never log message content. Never commit secrets — read all secrets from env vars.
- Apply rate limiting on all public endpoints.

## API conventions
- RESTful, plural nouns, base URL `/api/v1`.
- Consistent envelope: success returns the resource/data; errors return a structured error with status + message (no stack traces or internal details to clients — fail securely).
- Use proper HTTP status codes and pagination for list endpoints.

## Workflow
1. Write a failing test first (Jest) — RED.
2. Implement the service logic — GREEN.
3. Refactor; keep controllers thin.
4. Add/adjust a TypeORM migration for any schema change.
5. Confirm authz guards + DTO validation cover the new surface.

## Verify
- `cd backend && npm test` and `npm run lint` must pass before considering work done.
