# API Endpoints Summary

The Tayyibt Backend API is a RESTful service following a clear versioning and resource-based structure.

## Base URL
`http://api.tayyibt.com/api/v1` (Production)
`http://localhost:3000/api/v1` (Local)

## Key Resource Endpoints

### 1. Authentication (`/auth`)
- `POST /auth/register`: Create a new account.
- `POST /auth/login`: Exchange credentials for JWT tokens.

### 2. Users & Profiles (`/users`)
- `GET /users/me`: Current user's profile.
- `PATCH /users/me`: Update profile details.
- `GET /users/search`: Find other users with advanced filters.
- `GET /users/:id/profile`: View another user's public profile.

### 3. Matching (`/matches`)
- `GET /matches`: List of current matches.
- `PATCH /matches/:id/accept`: Confirm interest in a match.
- `PATCH /matches/:id/reject`: Decline a match.

### 4. Community (`/groups`, `/posts`, `/feed`)
- `GET /feed`: Personalized social feed.
- `POST /groups`: Create a new community group.
- `POST /groups/:id/posts`: Share content within a group.

### 5. Notifications (`/notifications`)
- `GET /notifications`: Recent alerts and activity.
- `PATCH /notifications/:id/read`: Mark an alert as read.

### 6. Subscriptions (`/subscriptions`)
- `POST /subscriptions`: Upgrade to Premium.
- `GET /subscriptions/me`: Check current plan status.

## Real-time Events (Socket.IO)
- `sendMessage`: Send a real-time message to a match.
- `newMessage`: Listen for incoming messages.
- `typing`: (Planned) Indicator that a match is composing a message.

---

*Note: For a full interactive API specification, refer to the Swagger UI at `http://localhost:3000/api/docs` in the development environment.*
