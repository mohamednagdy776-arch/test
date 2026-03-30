# Build Feature Workflow

## Purpose

Standard process for building new features across the Tayyibt platform.

---

## Step 1: Analyze Requirements

- Understand feature goals and user needs
- Define inputs, outputs, and edge cases
- Identify impacted systems: backend / frontend / mobile / AI

---

## Step 2: Identify Affected Modules

- Auth, Users, Matching, Chat, Groups, Posts, Comments, Payments

---

## Step 3: Update Database Schema (if needed)

- Add/modify tables, define relationships, add indexes
- Update `database-schema.md`

---

## Step 4: Build Backend

- Create NestJS module following the standard folder structure
- Controller → Service → DTO → Entity
- Apply auth guards and RBAC where needed
- Use standard response format

---

## Step 5: Build Frontend / Mobile

- Create feature folder with UI, logic, and API layers separated
- Integrate with new backend endpoints
- Handle loading, error, and success states

---

## Step 6: Update AI Service (if needed)

- Adjust scoring weights or feature extraction if matching is affected
- Ensure response time stays < 200ms

---

## Step 7: Write Tests

- Unit tests for all service methods
- Integration tests for API endpoints
- Cover success, edge cases, and error scenarios

---

## Step 8: Code Review

- Verify coding standards, security rules, and API conventions
- No business logic in controllers
- No secrets hardcoded

---

## Step 9: Deploy to Staging

- Run CI pipeline, verify in staging, QA sign-off

---

## Step 10: Deploy to Production

- Merge to `main`, deploy, monitor logs post-release
