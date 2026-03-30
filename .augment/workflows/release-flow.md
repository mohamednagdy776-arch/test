# Release Flow

## Purpose

This document defines the release and deployment workflow for the Tayyibt platform.

It ensures:
- Stable and predictable releases
- Minimal production issues
- Proper testing before deployment
- Clear team coordination

---

## Environments

### 1. Development (Local)
- Used by developers
- Frequent changes
- No restrictions

---

### 2. Staging
- Mirror of production
- Used for testing and QA
- Connected to test services (DB, payments)

---

### 3. Production
- Live environment
- Real users
- Strict controls

---

## Branching Strategy

### Main Branches

- `main` → Production-ready code
- `develop` → Integration branch

---

### Feature Branches

- Naming:
```bash
feature/<feature-name>