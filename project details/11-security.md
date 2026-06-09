# 11 — Security

## Authentication & Authorization

- **JWT** access tokens (HS256) signed with `JWT_SECRET` (64-char random secret in production).
- Access token TTL: **7 days** (`JWT_EXPIRES_IN`); refresh token TTL: 7d (30d with "remember me").
- **Passport JWT strategy** guards protected routes (`@UseGuards(AuthGuard('jwt'))`).
- **Password hashing**: bcrypt (cost 12).
- **Account lockout**: 5 failed logins → 15-minute lock (`locked_until`).
- **2FA**: TOTP (time-based OTP) with secret stored per user.
- **Sessions**: tracked in `sessions` table with device info; can be revoked.

---

## Transport Security

- All public traffic over **HTTPS** (TLS 1.2/1.3) via Let's Encrypt.
- HTTP automatically redirects to HTTPS (301).
- **HSTS** header: `max-age=31536000; includeSubDomains`.
- Security headers set by nginx:
  - `X-Frame-Options: SAMEORIGIN`
  - `X-Content-Type-Options: nosniff`
  - `X-XSS-Protection: 1; mode=block`

---

## Input Validation

- **Global ValidationPipe** with `whitelist: true` strips unknown properties and `transform: true` coerces types.
- DTOs use `class-validator` decorators (`@IsEmail`, `@IsString`, enum validation, etc.).
- Parameterized queries via TypeORM prevent SQL injection (verified by test 16.1).

---

## Data Protection

- **Message content encrypted at rest** (`content_encrypted` column).
- Personal data handled under the project rule that user data is encrypted at rest.
- Soft deletes (`deleted_at`) retain auditability while hiding data.

---

## Rate Limiting

- `@nestjs/throttler`: **100 requests / 60 s** per client globally.

---

## Network Isolation

- Only nginx is exposed to the internet (80/443).
- backend, ai-service, ollama, postgres, redis are reachable **only** on the internal Docker network.
- UFW firewall on the host allows only 22, 80, 443.
- Redis is password-protected; PostgreSQL credentials are random per deploy.

---

## Content Moderation

- AI moderation endpoint (`/ai/api/v1/moderate`) checks content against Islamic community guidelines.
- Fast keyword filter + LLM judgment for borderline cases.

---

## Threat Model & Mitigations

| Threat | Mitigation |
|--------|-----------|
| Credential stuffing | bcrypt, lockout after 5 attempts |
| Token theft | Short-lived access tokens, HTTPS only |
| SQL injection | TypeORM parameterized queries |
| XSS | ValidationPipe + frontend escaping; moderation endpoint |
| CSRF | Token-based auth (not cookie-session by default) |
| Brute force / DoS | Rate limiting (throttler) |
| MITM | TLS + HSTS |
| Unauthorized data access | JWT guards on all protected routes |
| Same-gender matching | Enforced at AI layer (score 0) |

---

## Known Hardening Opportunities

These are tracked in the QA audit ([12-qa-audit-resolution.md](./12-qa-audit-resolution.md)) and represent the security backlog:

1. **JWT in localStorage** — consider HttpOnly Secure cookies to reduce XSS token-theft risk.
2. **Admin panel exposure** — restrict `/admin` by IP allowlist / VPN / MFA.
3. **Stored content sanitization** — sanitize/encode user HTML on input in addition to output escaping.
4. **Invalid UUID handling** — return 400/404 rather than 500 to avoid leaking stack context.
5. **CSRF tokens** — add explicit CSRF protection if any cookie-based flows are introduced.
6. **Internal UUID exposure** — avoid surfacing raw internal identifiers in the UI.

---

## Secrets Management

- All secrets live in `.env.production` (gitignored).
- Database, Redis, and JWT secrets are randomly generated per deployment.
- No secrets committed to the repository.
