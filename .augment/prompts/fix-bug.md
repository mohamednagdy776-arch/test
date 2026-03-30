# Fix Bug Prompt

## Purpose

This document defines the standard process for debugging and fixing issues in the Tayyibt codebase.

It ensures:
- Consistent debugging across the team
- Secure and stable fixes
- No regression bugs
- Clear documentation for future reference

---

## General Rules

- Always follow project coding standards and naming conventions
- Never apply quick fixes without understanding the root cause
- Avoid breaking existing functionality
- Ensure compatibility with all modules (matching, chat, social, payments)

---

## Bug Fixing Process

### 1. Reproduce the Bug
- Identify exact steps to reproduce
- Check environment:
  - Development / Staging / Production
- Verify if issue is consistent or intermittent

---

### 2. Analyze the Issue

#### Backend (API / Database)
- Check logs (server + DB)
- Inspect API responses
- Validate request payloads

#### Frontend / Mobile
- Check UI state
- Inspect network requests
- Review state management

#### Real-Time Systems (Chat / Notifications)
- Validate WebSocket connection
- Check message flow and events

---

### 3. Identify Root Cause

- Logic error
- Data inconsistency
- API contract mismatch
- Race condition (real-time features)
- Performance bottleneck
- Third-party service failure

---

### 4. Security Review (MANDATORY)

Check if the bug affects:
- Authentication / authorization
- User data exposure
- Encrypted data handling
- Payments or transactions

⚠️ If security-related:
- Escalate immediately
- Apply strict validation and fixes

---

### 5. Implement the Fix

- Follow coding standards
- Keep changes minimal and focused
- Avoid unrelated refactoring
- Maintain backward compatibility

---

### 6. Test the Fix

#### Required Tests
- Unit tests (logic validation)
- Integration tests (API behavior)
- Manual testing (user flow)

#### Special Cases
- Chat → test real-time delivery
- Matching → verify scoring accuracy
- Social features → test posts/comments/replies

---

### 7. Regression Prevention

- Add test cases for the bug scenario
- Ensure similar flows are validated
- Check edge cases

---

### 8. Performance Check

- Ensure fix does not:
  - Slow API response
  - Increase DB load
  - Break caching (Redis)

---

### 9. Code Review

- Peer review required before merge
- Validate:
  - Code quality
  - Security
  - Performance
  - Consistency

---

### 10. Documentation

Update:
- Relevant docs in `/docs`
- API changes (if any)
- Known issues (if partially fixed)

---

## Debugging Checklist

### Core Debugging

- [ ] Bug reproduced successfully
- [ ] Logs analyzed (backend/frontend)
- [ ] Root cause clearly identified

---

### Fix Quality

- [ ] Fix follows coding standards
- [ ] No unnecessary code changes
- [ ] No new warnings/errors introduced

---

### Security

- [ ] Security impact assessed
- [ ] No sensitive data exposure
- [ ] Authorization rules validated

---

### Testing

- [ ] Unit tests added/updated
- [ ] Integration tests verified
- [ ] Manual testing completed

---

### System Validation

- [ ] Matching system unaffected
- [ ] Chat system working (real-time)
- [ ] Social features working (posts/comments/replies)
- [ ] Payments/subscriptions unaffected

---

### Deployment Readiness

- [ ] Code reviewed and approved
- [ ] Ready for staging deployment
- [ ] Monitoring in place after release

---

## Common Bug Categories

### Backend
- API validation errors
- Database query issues
- Authentication bugs

### Mobile / Frontend
- UI rendering issues
- State management bugs
- API integration errors

### Real-Time
- Message delays
- WebSocket disconnections

### Social Features
- Post creation failures
- Comment nesting issues
- Group permissions bugs

### AI / Matching
- Incorrect compatibility scores
- Missing matches
- Performance delays

---

## Augment Usage Rule

When using AI to fix bugs:

Always include:
- Bug description
- Steps to reproduce
- Expected vs actual behavior
- Related module (auth, matching, chat, social, etc.)

Example prompt:
"Fix this issue following Tayyibt coding standards and debugging rules. Ensure no regression and add tests."

---