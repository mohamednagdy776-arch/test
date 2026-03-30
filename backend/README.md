# Backend

NestJS REST API + WebSocket server for the Tayyibt platform.

## Stack

- Framework: NestJS + TypeScript
- Database: PostgreSQL (TypeORM or Prisma)
- Cache: Redis
- Auth: JWT (access + refresh tokens)

## Folder Structure

```
backend/
├── src/
│   ├── auth/               # JWT auth, guards, strategies
│   ├── users/              # User profiles and account management
│   ├── matching/           # AI matching integration and match logic
│   ├── chat/               # Real-time messaging via WebSocket
│   ├── groups/             # Community groups
│   ├── posts/              # Posts inside groups
│   ├── comments/           # Nested comments on posts
│   ├── subscriptions/      # Plans and billing
│   ├── payments/           # Paymob / Stripe integration
│   ├── notifications/      # Push notifications via FCM
│   ├── affiliates/         # Referral and commission system
│   ├── common/             # Shared guards, decorators, interceptors, pipes
│   ├── config/             # App configuration and env validation
│   └── main.ts             # App entry point
├── test/                   # E2E tests
├── .env                    # Environment variables (never commit)
├── nest-cli.json
├── package.json
└── tsconfig.json
```

## Module Structure (per feature)

Each module must follow this pattern:

```
module-name/
├── controllers/            # Thin — request/response only, no logic
├── services/               # All business logic lives here
├── dto/                    # Input validation with class-validator
├── entities/               # DB table definitions (ORM)
├── tests/                  # Unit tests for services
└── module.module.ts
```

## Standards

- Follow `coding-standards.md` and `api-conventions.md`
- All endpoints under `/api/v1/`
- Standard response: `{ success, message, data }`
- Use `AuthGuard` + `@Roles()` on protected routes
- Never put business logic in controllers
- Never hardcode secrets — use `.env`
