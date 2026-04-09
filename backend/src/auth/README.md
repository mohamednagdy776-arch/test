# Authentication Module

## Module Number: 1

## Description
This module handles all authentication and account management functionality including user registration, login, account recovery, session management, two-factor authentication, and account deactivation/deletion.

## clone-prompt.md Reference
Lines: 16-48 (Module 1 — AUTHENTICATION & ACCOUNT MANAGEMENT)

## Implemented Features

### 1.1 Registration
- Full name, email, password, date of birth, gender (male/female/custom) ✅
- Email verification flow with tokenized confirmation link (expires in 24h) ✅
- Password strength validation (min 8 chars, mixed case, number, symbol) ✅
- Check for duplicate emails before account creation ✅
- Store hashed passwords using bcrypt (salt rounds: 12) ✅

### 1.2 Login
- Email + password login ✅
- OAuth login via Google and GitHub (NextAuth.js providers) ❌
- "Remember me" toggle (extend session to 30 days vs default 1 day) ❌
- Failed login attempt tracking — lock account for 15 min after 5 failures ✅
- Redirect to intended page after login ✅

### 1.3 Account Recovery
- "Forgot password" flow: enter email → receive reset link (expires 1h) ✅
- Token-based password reset with CSRF protection ✅
- Confirmation email after successful password change ✅
- Option to recover via linked phone number (OTP, optional) ❌

### 1.4 Session & Security
- JWT access tokens (15 min expiry) + refresh tokens (7 days) stored in httpOnly cookies ✅
- Active sessions list (device name, browser, IP, last active) ✅
- Ability to revoke individual sessions or all sessions except current ✅
- Two-factor authentication (TOTP via authenticator app) ✅
- Login notifications via email for new device logins ❌

### 1.5 Account Deactivation & Deletion
- Deactivation: hides profile and content, preservable data, re-activatable by logging back in ✅
- Deletion: 30-day grace period before permanent removal, confirmation email sent ✅
- Download your data feature (export JSON of posts, friends, messages) ✅

## API Endpoints

### Implemented
| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| POST | /api/v1/auth/register | Register new user | ✅ |
| POST | /api/v1/auth/login | Login with email/password | ✅ |
| POST | /api/v1/auth/verify-email | Verify email with token | ✅ |
| GET | /api/v1/auth/verify-email | Verify email via GET (token query) | ✅ |
| POST | /api/v1/auth/resend-verification | Resend verification email | ✅ |
| POST | /api/v1/auth/forgot-password | Request password reset | ✅ |
| POST | /api/v1/auth/reset-password | Reset password with token | ✅ |
| POST | /api/v1/auth/refresh | Refresh access token | ✅ |
| POST | /api/v1/auth/logout | Logout current session | ✅ |
| GET | /api/v1/auth/sessions | List active sessions | ✅ |
| POST | /api/v1/auth/sessions/revoke | Revoke session(s) | ✅ |
| POST | /api/v1/auth/2fa/setup | Setup two-factor auth | ✅ |
| POST | /api/v1/auth/2fa/verify | Verify 2FA setup | ✅ |
| POST | /api/v1/auth/2fa/disable | Disable two-factor auth | ✅ |
| POST | /api/v1/auth/2fa/verify-login | Verify 2FA during login | ✅ |
| POST | /api/v1/auth/deactivate | Deactivate account | ✅ |
| POST | /api/v1/auth/reactivate | Reactivate account | ✅ |
| POST | /api/v1/auth/delete | Schedule account deletion | ✅ |
| POST | /api/v1/auth/delete/cancel | Cancel account deletion | ✅ |
| GET | /api/v1/auth/export | Export user data | ✅ |

### To Implement
| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| - | OAuth login (Google/GitHub) | OAuth providers | ❌ |
| - | "Remember me" toggle | Extended session | ❌ |
| - | Phone recovery (OTP) | Phone-based recovery | ❌ |
| - | Login notifications | Email for new devices | ❌ |

## Frontend Pages

### Implemented
- /login ✅
- /register ✅
- /settings/security ✅

### To Implement
- OAuth login buttons ❌

## Implementation Notes
- All core authentication features are fully implemented in the backend
- OAuth login requires NextAuth.js provider configuration in web frontend
- "Remember me" requires cookie expiry modification based on toggle
- Login notifications require email service integration
- Phone recovery requires Twilio or similar SMS service