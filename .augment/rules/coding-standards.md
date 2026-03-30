# Coding Standards

## Purpose

This document defines coding practices and quality standards for the Tayyibt project.

It ensures:
- Clean and maintainable code
- Consistency across all developers
- High performance and scalability
- Secure and reliable implementations

---

## General Principles

- Write clean, readable, and self-explanatory code
- Follow SOLID principles
- Keep functions small and focused
- Avoid code duplication (DRY)
- Prefer clarity over cleverness

---

## Code Style Guidelines

### Naming Conventions

- Follow rules defined in `naming-conventions.md`
- Use meaningful, descriptive names
- Avoid abbreviations unless standard

---

### Formatting

- Use consistent indentation (2 spaces or 4 spaces, choose one)
- Limit line length (max 100–120 characters)
- Use consistent spacing

---

### File Structure

- Organize code by feature/module
- Keep files small and focused
- One responsibility per file

---

## Backend (NestJS) Standards

### Controllers

- Must NOT contain business logic
- Only handle:
  - Request parsing
  - Validation
  - Response formatting

---

### Services

- Contain all business logic
- Must be reusable and testable
- Avoid direct DB queries in controllers

---

### DTOs

- Use for all request validation
- Use class-validator decorators
- Never trust raw input

---

### Entities

- Represent database tables
- Use ORM decorators
- Follow database naming rules

---

## Frontend (Next.js) Standards

- Use functional components
- Use hooks for state management
- Keep components small and reusable
- Separate UI from logic

---

## Mobile (Flutter) Standards

- Use clean architecture (feature-based)
- Separate UI, logic, and data layers
- Follow Dart naming conventions

---

## Comment Requirements

### When to Comment

- Complex business logic
- Non-obvious decisions
- Workarounds or hacks

---

### When NOT to Comment

- Obvious code
- Simple assignments

---

### Example

```ts id="6w45gi"
// Calculate compatibility score based on weighted factors
const score = calculateMatchScore(userA, userB);