# Tayyibt API Specification

Base URL: `http://localhost:3000/api/v1`

## Authentication

All authenticated endpoints require a JWT Bearer token in the Authorization header:
```
Authorization: Bearer <access_token>
```

Tokens expire after 15 minutes (access) and 7 days (refresh).

## Response Format

All responses follow this structure:
```json
{
  "success": true,
  "message": "Request successful",
  "data": { ... }
}
```

Paginated responses include:
```json
{
  "success": true,
  "message": "Request successful",
  "data": [],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  }
}
```

## Endpoints

### Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | No | Register new user |
| POST | `/auth/login` | No | Login and get tokens |

### Users

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/users/me` | JWT | user | Get current user profile |
| PATCH | `/users/me` | JWT | user | Update current user profile |
| POST | `/users/me/avatar` | JWT | user | Upload avatar |
| GET | `/users/search` | JWT | user | Search users with filters |
| GET | `/users/:id/profile` | JWT | user | Get user profile |
| GET | `/users` | JWT | admin | List all users (paginated) |
| GET | `/users/:id` | JWT | admin | Get user by ID |
| PATCH | `/users/:id/ban` | JWT | admin | Ban user |
| PATCH | `/users/:id/unban` | JWT | admin | Unban user |

### Matching

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/matches` | JWT | Get user matches |
| GET | `/matches/:id` | JWT | Get match details |
| GET | `/matches/profile/:userId` | JWT | Get profile with match score |
| PATCH | `/matches/:id/accept` | JWT | Accept match |
| PATCH | `/matches/:id/reject` | JWT | Reject match |

### Chat

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/chat/:matchId/messages` | JWT | Get messages (paginated) |
| POST | `/chat/messages` | JWT | Send message (REST fallback) |
| POST | `/chat/conversations` | JWT | Create/get conversation |

### Groups

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/groups` | JWT | Create group |
| GET | `/groups` | JWT | List groups |
| DELETE | `/groups/:id` | JWT+Admin | Delete group |

### Posts

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/groups/:groupId/posts` | JWT | Create post |
| GET | `/groups/:groupId/posts` | JWT | Get group posts |
| DELETE | `/groups/:groupId/posts/:postId` | JWT | Delete post |
| GET | `/feed` | JWT | Get user feed |
| GET | `/posts` | JWT+Admin | List all posts |
| DELETE | `/posts/:id` | JWT+Admin | Delete any post |

### Comments

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/posts/:postId/comments` | JWT | Create comment |
| GET | `/posts/:postId/comments` | JWT | Get post comments |

### Subscriptions

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/subscriptions/me` | JWT | user | Get user subscriptions |
| GET | `/subscriptions/me/active` | JWT | user | Get active subscription |
| POST | `/subscriptions` | JWT | user | Create subscription |
| PATCH | `/subscriptions/:id/cancel` | JWT | user | Cancel subscription |
| GET | `/subscriptions` | JWT | admin | List all subscriptions |
| PATCH | `/subscriptions/:id` | JWT | admin | Update subscription |

### Notifications

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/notifications` | JWT | Get notifications (paginated) |
| GET | `/notifications/unread-count` | JWT | Get unread count |
| POST | `/notifications` | JWT | Create notification |
| PATCH | `/notifications/:id/read` | JWT | Mark as read |
| PATCH | `/notifications/read-all` | JWT | Mark all as read |
| DELETE | `/notifications/:id` | JWT | Delete notification |

### Payments

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/payments` | JWT | admin | List transactions (paginated) |

### Affiliates

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/affiliates/me` | JWT | Get affiliate account |
| POST | `/affiliates` | JWT | Create affiliate account |
| GET | `/affiliates/code/:code` | JWT | Lookup by referral code |
| GET | `/affiliates` | JWT+Admin | List all affiliates |

### Reports

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/reports` | JWT | admin | List reports |
| PATCH | `/reports/:id/resolve` | JWT | admin | Resolve report |
| PATCH | `/reports/:id/dismiss` | JWT | admin | Dismiss report |

### Health

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/health` | No | Health check |

## WebSocket Events

Connect to `ws://localhost:3000` with Socket.IO.

| Event | Direction | Payload | Description |
|-------|-----------|---------|-------------|
| `joinMatch` | Client → Server | `matchId: string` | Join match room |
| `sendMessage` | Client → Server | `{ matchId, encryptedContent, senderId }` | Send message |
| `newMessage` | Server → Client | `{ id, content, senderId, timestamp }` | Receive message |

## AI Service API

Base URL: `http://localhost:5000`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/api/v1/match` | Calculate compatibility score |

### Match Request Body
```json
{
  "user_a": {
    "user_id": "string",
    "sect": "string",
    "prayer_level": 4.0,
    "religious_commitment": 4.0,
    "interests": ["reading", "travel"],
    "age": 28,
    "country": "Egypt",
    "city": "Cairo"
  },
  "user_b": { ... }
}
```

### Match Response
```json
{
  "compatibilityScore": 85.5,
  "matchReasons": ["Similar religious values", "Shared interests", "Same country"]
}
```
