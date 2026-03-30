# API Conventions

## Base URL

```
/api/v1
```

---

## RESTful Principles

- Use nouns for resources, not verbs: `/users` not `/getUsers`
- Use plural resource names: `/posts`, `/matches`, `/groups`
- Nest related resources: `/groups/:id/posts`, `/posts/:id/comments`

---

## HTTP Methods

| Method | Usage |
|--------|-------|
| GET | Retrieve resource(s) |
| POST | Create a new resource |
| PATCH | Partial update |
| PUT | Full update |
| DELETE | Remove a resource |

---

## Standard Response Format

```json
{
  "success": true,
  "message": "Request successful",
  "data": {}
}
```

Error response:
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": []
}
```

---

## HTTP Status Codes

- 200 — OK
- 201 — Created
- 400 — Bad Request
- 401 — Unauthorized
- 403 — Forbidden
- 404 — Not Found
- 422 — Unprocessable Entity
- 500 — Internal Server Error

---

## Authentication

- Protected routes require `Authorization: Bearer <token>` header
- Use `@UseGuards(AuthGuard)` on all protected controllers/routes
- Apply role guards where needed: `@Roles('admin')`

---

## Pagination

```json
{
  "data": [],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  }
}
```

Query params: `?page=1&limit=20`

---

## Versioning

- All APIs are versioned via URL prefix: `/api/v1/`
- Breaking changes require a new version: `/api/v2/`
