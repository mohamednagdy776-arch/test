# Generate API Prompt

## Purpose

This document defines how to generate new API endpoints in the Tayyibt backend.

All APIs must follow:
- RESTful conventions
- Project architecture (NestJS modular structure)
- Security and validation standards
- Scalability best practices

---

## General Rules

- Follow naming conventions from `naming-conventions.md`
- Follow REST rules from `api-conventions.md`
- Keep controllers thin and logic inside services
- Use DTOs for validation and typing
- Use consistent response format
- Never expose sensitive data

---

## API Generation Process

### 1. Define Endpoint

- Resource name (e.g., users, matches, posts)
- HTTP method (GET, POST, PATCH, DELETE)
- Route path
- Authentication requirement

---

### 2. Define Data Flow

- Input (request body / params / query)
- Processing logic (service layer)
- Output (response DTO)

---

### 3. Add Validation

- Use DTOs (Data Transfer Objects)
- Validate:
  - Required fields
  - Data types
  - Constraints (length, format, enums)

---

### 4. Authentication & Authorization

- Use JWT authentication where required
- Apply guards:
  - AuthGuard
  - Role-based access (admin, user, agent)

---

### 5. Error Handling

Use consistent error responses:

- 400 → Bad Request
- 401 → Unauthorized
- 403 → Forbidden
- 404 → Not Found
- 500 → Internal Server Error

---

### 6. Testing

- Add unit tests for service logic
- Add integration tests for endpoint
- Test edge cases

---

### 7. Documentation

- Document endpoint in `/docs/api-spec.md`
- Include:
  - Request example
  - Response example
  - Error cases

---

## Standard Response Format

```json
{
  "success": true,
  "message": "Request successful",
  "data": {}
}