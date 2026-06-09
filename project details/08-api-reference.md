# 08 — API Reference

Base URL: `https://145-14-158-100.sslip.io/api/v1`
All authenticated endpoints require `Authorization: Bearer <accessToken>`.
Standard response: `{ success, message, data }`.

---

## Auth (`/auth`)

| Method | Path | Body | Description |
|--------|------|------|-------------|
| POST | `/auth/register` | email, phone, password, firstName, lastName, username, gender | Register (auto-verified in dev) |
| POST | `/auth/login` | email, password, rememberMe? | Login → tokens |
| POST | `/auth/verify-email` | token | Verify email |
| POST | `/auth/resend-verification` | email | Resend verification |
| POST | `/auth/forgot-password` | email | Send reset link |
| POST | `/auth/reset-password` | token, password | Reset password |
| POST | `/auth/refresh` | refreshToken | New access token |
| GET | `/auth/sessions` | — | List active sessions |
| POST | `/auth/sessions/revoke` | sessionId / all | Revoke session(s) |
| POST | `/auth/2fa/setup` | — | Begin TOTP setup |
| POST | `/auth/2fa/verify` | code | Verify TOTP setup |
| POST | `/auth/2fa/disable` | code | Disable 2FA |
| POST | `/auth/2fa/verify-login` | userId, code | 2FA at login |
| POST | `/auth/deactivate` | — | Deactivate account |
| POST | `/auth/reactivate` | email, password | Reactivate |
| POST | `/auth/delete` | — | Delete account |
| GET | `/auth/export` | — | Export user data |

---

## Users / Profile (`/users`)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/users/me` | Current user profile |
| PATCH | `/users/me` | Update profile fields |
| GET | `/users/:id/profile` | Public profile |
| GET | `/users/:id/friends` | User's friends |
| POST | `/users/avatar` | Upload avatar |

---

## Matching (`/matches`)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/matches/generate` | Generate matches for current user |
| GET | `/matches?page&limit` | Paginated matches |
| GET | `/matches/profile/:userId` | Public profile + AI match score + reasons |
| GET | `/matches/:id` | Single match |
| PATCH | `/matches/:id/accept` | Accept match |
| PATCH | `/matches/:id/reject` | Reject match |

---

## Search (`/search`)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/search?q&category&limit` | Search users/posts/groups/pages/events |
| GET | `/search/autocomplete?q` | Autocomplete suggestions |
| GET | `/search/location?q&lat&lng` | Location search |

`category` ∈ `users` `posts` `groups` `pages` `events` (omit for all).

---

## Posts (`/posts`) & Feed (`/feed`)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/posts` | Create post |
| GET | `/posts/:id` | Get post |
| PATCH | `/posts/:id` | Edit post |
| DELETE | `/posts/:id` | Soft-delete post |
| POST | `/posts/:id/save` | Save for later |
| POST | `/posts/:id/share` | Share post |
| POST | `/posts/:id/archive` | Archive |
| POST | `/posts/:id/pin` | Toggle pin |
| GET | `/posts/saved` | Saved posts |
| GET | `/posts/scheduled` | Scheduled posts |
| GET | `/feed?page&limit` | Personalized feed |
| POST | `/posts/:id/comments` | Add comment (body: content, parentId?) |
| GET | `/posts/:id/comments` | List comments |

---

## Reactions (`/reactions`)

| Method | Path | Body |
|--------|------|------|
| POST | `/reactions` | targetId, targetType, type |

---

## Friends (`/friends`)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/friends/request` | Send request (body: `userId`) |
| POST | `/friends/request/:id/accept` | Accept |
| POST | `/friends/request/:id/decline` | Decline |
| DELETE | `/friends/request/:id` | Cancel sent |
| GET | `/friends` / `/friends/list` | Friends (paginated) |
| GET | `/friends/requests` | Incoming requests |
| GET | `/friends/requests/sent` | Sent requests |
| GET | `/friends/suggestions` | Suggestions |
| GET | `/friends/birthdays` | Upcoming birthdays |
| GET | `/friends/status/:userId` | Friendship status |
| DELETE | `/friends/:userId` | Unfriend |
| POST | `/friends/block` | Block |
| DELETE | `/friends/block/:userId` | Unblock |
| POST | `/friends/restrict` | Restrict |
| GET/POST/PATCH/DELETE | `/friends/lists[...]` | Custom lists |

---

## Chat (`/chat`)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/chat/conversations` | List conversations |
| POST | `/chat/conversations` | Create/get 1:1 conversation (body: `targetUserId`) |
| GET | `/chat/conversations/:id/messages` | Messages (paginated) |
| POST | `/chat/messages` | Send (conversationId, content, type) |
| PUT | `/chat/messages/:id` | Edit |
| DELETE | `/chat/messages/:id` | Delete |
| POST | `/chat/messages/:id/reactions` | Add reaction |
| POST | `/chat/messages/:id/star` | Toggle star |
| POST | `/chat/messages/:id/forward` | Forward |
| GET | `/chat/messages/:conversationId/search` | Search |
| POST | `/chat/groups` | Create group chat (name, participantIds) |
| GET | `/chat/unread` | Unread count |

---

## Groups (`/groups`)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/groups` | List |
| POST | `/groups` | Create (name, description, privacy, category) |
| GET | `/groups/:id` | Details |
| POST | `/groups/:id/join` | Join |
| DELETE | `/groups/:id/leave` | Leave |
| GET | `/groups/:id/members` | Members |
| GET | `/groups/:id/posts` | Group posts |

---

## Pages (`/pages`)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/pages` | List |
| POST | `/pages` | Create (name, description, category) |
| GET | `/pages/:id` | Details |
| POST | `/pages/:id/follow` | Follow |
| POST | `/pages/:id/like` | Like |

---

## Events (`/events`)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/events` | List |
| POST | `/events` | Create (title, description, startDate, endDate, location) |
| GET | `/events/:id` | Details |
| POST | `/events/:id/rsvp` | RSVP (status: going/interested/not_going) |

---

## Notifications (`/notifications`)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/notifications` | List |
| PATCH | `/notifications/read-all` | Mark all read |
| PATCH | `/notifications/:id/read` | Mark one read |
| DELETE | `/notifications/:id` | Delete |

---

## Saved & Memories (`/saved`, `/memories`)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/saved` | Saved items |
| GET | `/saved/collections` | Collections |
| POST | `/saved/collections` | Create collection |
| DELETE | `/saved/collections/:id` | Delete collection |
| GET | `/memories` | Past memories |

---

## Settings (`/settings`, `/blocks`)

| Method | Path | Description |
|--------|------|-------------|
| GET/PATCH | `/settings/privacy` | Privacy settings |
| GET/PATCH | `/settings/notifications` | Notification prefs |
| GET/PATCH | `/settings/appearance` | Theme |
| GET/PATCH | `/settings/newsletter` | Newsletter |
| GET | `/blocks` | Blocked users |
| POST | `/blocks` | Block (blockedUserId) |
| DELETE | `/blocks/:id` | Unblock |

---

## Videos (`/videos`)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/videos` | List |
| GET | `/videos/trending` | Trending |
| GET | `/videos/recommended` | Recommended |
| GET | `/videos/continue-watching` | Continue watching |
| GET | `/videos/:id` | Single video |

---

## AI Service (`/ai/api/v1`)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/ai/health` | Health |
| POST | `/ai/api/v1/match` | Compatibility score |
| POST | `/ai/api/v1/bio-suggestion` | Generate bio |
| POST | `/ai/api/v1/icebreaker` | 3 conversation starters |
| POST | `/ai/api/v1/moderate` | Content moderation |
| POST | `/ai/api/v1/profile-tips` | Completeness tips |

---

## Health

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/health` | Backend health (public) |
