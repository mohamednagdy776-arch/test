# Generate API Prompt

Use this prompt when generating a new API endpoint in the Tayyibt backend.

---

## Prompt Template

```
Generate a NestJS API endpoint for [resource name].

Details:
- HTTP Method: [GET | POST | PATCH | DELETE]
- Route: /api/v1/[resource]
- Auth required: [yes | no]
- Roles allowed: [user | guardian | agent | admin | all]
- Input: [describe request body / params / query]
- Output: [describe response data]

Rules to follow:
- Controller must be thin (no business logic)
- All logic goes in the service
- Use DTO with class-validator for input validation
- Use standard response format: { success, message, data }
- Apply AuthGuard and Roles guard where needed
- Handle errors with appropriate HTTP status codes
- Follow api-conventions.md and coding-standards.md
```

---

## Example

```
Generate a NestJS API endpoint for creating a post inside a group.

Details:
- HTTP Method: POST
- Route: /api/v1/groups/:groupId/posts
- Auth required: yes
- Roles allowed: user
- Input: { content: string, mediaUrl?: string }
- Output: created post object

Rules to follow:
- Controller must be thin (no business logic)
- All logic goes in the service
- Use DTO with class-validator for input validation
- Use standard response format: { success, message, data }
- Apply AuthGuard and Roles guard where needed
- Follow api-conventions.md and coding-standards.md
```
