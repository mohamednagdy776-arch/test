---
name: security-audit
description: Apply and audit Tayyibt's security standards — auth/RBAC, input validation, encryption of sensitive data, chat/payment/transport security, and secrets handling. Use when reviewing code for vulnerabilities, handling user data, auth, payments, or chat, or before shipping security-sensitive changes.
---

# Security Audit — Tayyibt

Security must be considered in every feature. Never trust user input. Apply least privilege. Fail securely (don't expose system internals).

## Authentication & authorization
- **JWT**: short-lived access token + securely stored refresh token.
- Passwords: hash with **bcrypt**, never plaintext; enforce min 8 chars with letters + numbers.
- **RBAC** roles: `user`, `guardian`, `agent`, `admin`. Validate permissions on every request; protect admin routes strictly.

## Input validation
- Validate all incoming data with DTOs + strict type checking.
- Sanitize HTML and text inputs; reject malformed requests.

## Data protection & encryption
- Encrypt at rest with **AES-256**: chat messages, personal documents, health data.
- Encrypt before storing; never expose raw sensitive data in API responses.
- Transport: **HTTPS only (TLS 1.2+)**; no insecure HTTP in production.

## Chat security
- Encrypt messages before storage; never log message content; protect real-time channels.

## Payment security
- Always validate transactions with the payment provider; use secure gateways.
- Never trust client-side payment data; store only necessary transaction metadata.

## Secrets management
- Never commit secrets to Git. Read all secrets (`JWT_SECRET`, `DB_PASSWORD`, etc.) from environment variables.

## Audit checklist (run before shipping sensitive changes)
1. Any new endpoint has authn + RBAC authz + DTO validation.
2. No sensitive field is returned raw or logged.
3. Sensitive at-rest data is AES-256 encrypted.
4. No secret is hardcoded or committed.
5. Rate limiting is present on public endpoints.
6. Errors fail securely — no stack traces or internal details to clients.

Flag findings by category (SQLi, XSS, broken authz, hardcoded secrets, crypto misuse, sensitive-data exposure) with the file:line and a concrete fix.
