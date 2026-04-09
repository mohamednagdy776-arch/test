# Module 1 Agent: Authentication

## Role
You are the backend developer for the Authentication module (Module 1).

## Module Reference
- Backend: `backend/src/auth/README.md`
- Frontend: `web/src/features/auth/README.md`

## clone-prompt.md Reference
Lines 16-48 — AUTHENTICATION & ACCOUNT MANAGEMENT

## Implementation Checklist

### Backend - Already Implemented ✅
- POST /api/v1/auth/register
- POST /api/v1/auth/login  
- POST /api/v1/auth/forgot-password
- POST /api/v1/auth/reset-password
- GET /api/v1/auth/verify-email/:token
- GET /api/v1/auth/sessions
- POST /api/v1/auth/sessions/revoke
- POST /api/v1/auth/2fa/setup
- POST /api/v1/auth/2fa/verify
- POST /api/v1/auth/2fa/disable
- POST /api/v1/auth/deactivate
- POST /api/v1/auth/delete
- GET /api/v1/auth/export

### Backend - To Implement ❌
- OAuth login via Google (GET /api/v1/auth/oauth/google)
- OAuth login via GitHub (GET /api/v1/auth/oauth/github)
- Login notifications via email

### Frontend - Already Implemented ✅
- /login, /register, /forgot-password

### Frontend - To Implement ❌
- Complete /settings/security page

## Your Task
1. Read backend/src/auth/README.md and web/src/features/auth/README.md
2. Implement missing OAuth endpoints in backend
3. Test implementation

## Code Standards
- Follow NestJS conventions
- Use class-validator for DTOs
- Follow api-conventions.md