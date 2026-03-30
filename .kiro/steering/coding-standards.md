# Coding Standards

## General Principles

- Write clean, readable, self-explanatory code
- Follow SOLID principles
- Keep functions small and focused (single responsibility)
- Avoid code duplication (DRY)
- Prefer clarity over cleverness

---

## Naming Conventions

- TypeScript/JS: camelCase for variables/functions, PascalCase for classes/interfaces
- Files: kebab-case (e.g., `user-profile.service.ts`)
- Database: snake_case for tables and columns
- Flutter/Dart: camelCase for variables, PascalCase for classes
- Use English only, avoid abbreviations unless standard (ID, API, DTO)

---

## Backend (NestJS)

- Controllers: only handle request parsing, validation, response formatting — NO business logic
- Services: contain all business logic, must be reusable and testable
- DTOs: use class-validator decorators for all input validation, never trust raw input
- Entities: represent DB tables with ORM decorators

### Module Folder Structure

```
module-name/
├── controllers/
├── services/
├── dto/
├── entities/
├── tests/
└── module.module.ts
```

---

## Frontend (Next.js)

- Functional components only, no class components
- Use hooks for state management
- Keep components small and reusable
- Separate UI from logic and API calls
- Feature-based folder structure

---

## Mobile (Flutter)

- Clean Architecture with 3 layers: data / domain / presentation
- State management: Riverpod or Bloc
- Separate UI, logic, and data layers

---

## Comments

- Comment complex business logic and non-obvious decisions
- Do NOT comment obvious code
- Keep comments up to date with code changes

---

## Formatting

- Indentation: 2 spaces (TS/JS), 2 spaces (Dart)
- Max line length: 100–120 characters
- One responsibility per file
