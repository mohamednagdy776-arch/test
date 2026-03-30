# Security Rules

## Purpose

This document defines security guidelines and best practices for the Tayyibt platform.

It ensures:
- Protection of user data
- Secure communication
- Safe payment processing
- Prevention of common vulnerabilities

---

## General Principles

- Security must be considered in every feature
- Never trust user input
- Apply "least privilege" principle
- Fail securely (do not expose system details)

---

## Authentication & Authorization

### Authentication

- Use JWT-based authentication
- Implement:
  - Access tokens (short-lived)
  - Refresh tokens (secure storage)

---

### Password Security

- Hash passwords using bcrypt
- Never store plaintext passwords
- Enforce strong password rules:
  - Minimum 8 characters
  - Include letters and numbers

---

### Authorization (RBAC)

Roles:
- user
- guardian
- agent
- admin

Rules:
- Validate user permissions on every request
- Protect admin routes strictly

---

## Input Validation & Sanitization

- Validate all incoming data using DTOs
- Use strict type checking
- Sanitize:
  - HTML input
  - Text fields
- Reject malformed requests

---

## Data Protection & Encryption

### Sensitive Data

Must be encrypted:
- Messages (chat)
- Personal documents
- Health data

---

### Encryption Rules

- Use strong encryption algorithms (AES-256)
- Encrypt data before storing
- Never expose raw sensitive data in APIs

---

### Transport Security

- Use HTTPS only (TLS 1.2+)
- Never allow insecure HTTP in production

---

## Chat Security

- Messages must be encrypted before storage
- Do not log message content
- Protect real-time communication channels

---

## Payment Security

- Always validate transactions with payment provider
- Use secure payment gateways
- Never trust client-side payment data
- Store only necessary transaction metadata

---

## Secrets Management

- Never commit secrets to Git
- Use environment variables

### Example

```bash
JWT_SECRET=your_secret_key
DB_PASSWORD=your_password