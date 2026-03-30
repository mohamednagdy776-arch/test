# Generate Module Prompt

Use this prompt when generating a new NestJS module in the Tayyibt backend.

---

## Prompt Template

```
Generate a complete NestJS module for [module name].

Details:
- Module name: [name]
- Responsibilities: [what this module does]
- Entities/tables involved: [list from database-schema.md]
- API endpoints needed: [list endpoints]
- Auth required: [yes | no]
- Roles: [user | guardian | agent | admin]

Generate:
1. Module file (module.module.ts)
2. Controller (thin, no logic)
3. Service (all business logic here)
4. DTOs (create + update, with class-validator)
5. Entity (TypeORM/Prisma, matching database-schema.md)
6. Unit test skeleton for the service

Follow:
- coding-standards.md
- api-conventions.md
- security-rules.md
- Standard response format: { success, message, data }
```

---

## Example

```
Generate a complete NestJS module for posts.

Details:
- Module name: posts
- Responsibilities: create, read, update, delete posts inside groups
- Entities/tables involved: posts, groups, users
- API endpoints needed:
    POST   /api/v1/groups/:groupId/posts
    GET    /api/v1/groups/:groupId/posts
    PATCH  /api/v1/posts/:id
    DELETE /api/v1/posts/:id
- Auth required: yes
- Roles: user (create/update/delete own), admin (all)

Generate:
1. Module file
2. Controller (thin)
3. Service (all logic)
4. CreatePostDto + UpdatePostDto
5. Post entity
6. Service unit test skeleton
```
