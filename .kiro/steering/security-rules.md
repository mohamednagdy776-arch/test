# Security Rules

## General Principles

- Security must be considered in every feature
- Never trust user input — validate and sanitize everything
- Apply "least privilege" principle
- Fail securely — never expose system internals in error messages

---

## Authentication & Authorization

- JWT-based auth: short-lived access tokens + secure refresh tokens
- Hash passwords with bcrypt, never store plaintext
- Enforce strong passwords: min 8 chars, letters + numbers
- RBAC roles: `user`, `guardian`, `agent`, `admin`
- Validate permissions on every request, protect admin routes strictly

---

## Input Validation & Sanitization

- Validate all incoming data via DTOs with class-validator
- Sanitize HTML input and text fields
- Reject malformed or unexpected requests immediately

---

## Data Protection

- Encrypt sensitive data (messages, documents, health data) using AES-256
- Never expose raw sensitive data in API responses
- Use HTTPS only (TLS 1.2+) — no HTTP in production
- Never commit secrets to Git — use environment variables

---

## Chat Security

- Encrypt messages before storage
- Do not log message content
- Protect WebSocket channels

---

## Payment Security

- Always validate transactions server-side with payment provider
- Never trust client-side payment data
- Store only necessary transaction metadata, no card data

---

## Secrets Management

```bash
# Always use environment variables
JWT_SECRET=your_secret_key
DB_PASSWORD=your_password
```

Never hardcode secrets in source code.
