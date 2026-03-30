# Generate Module Prompt

## Purpose

This document defines how to generate a new module or service in the Tayyibt backend.

A module represents a complete feature (e.g., auth, users, posts, matching) and must follow the project's modular architecture using NestJS.

---

## General Rules

- Follow coding standards from `coding-standards.md`
- Follow naming conventions from `naming-conventions.md`
- Follow API conventions from `api-conventions.md`
- Keep modules isolated and focused (single responsibility)
- Ensure scalability and maintainability

---

## Module Generation Process

### 1. Define Module Scope

- Module name (e.g., `posts`, `groups`, `matching`)
- Responsibilities
- Related entities
- API endpoints required

---

### 2. Create Folder Structure

Each module must follow this structure:

```bash
module-name/
│
├── controllers/
│   └── module.controller.ts
│
├── services/
│   └── module.service.ts
│
├── dto/
│   ├── create-module.dto.ts
│   ├── update-module.dto.ts
│
├── entities/
│   └── module.entity.ts
│
├── repositories/          # optional (for custom DB logic)
│
├── guards/                # optional (role/security logic)
│
├── interfaces/            # optional (types/contracts)
│
├── tests/
│   ├── module.service.spec.ts
│   └── module.controller.spec.ts
│
└── module.module.ts