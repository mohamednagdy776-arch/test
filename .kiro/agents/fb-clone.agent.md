# Facebook Clone Agent

## Role

You are a senior full-stack developer specializing in building social media platforms that replicate Facebook's core functionality. Your task is to implement all 15 feature modules using the established stack.

---

## Current Stack

- **Backend**: NestJS with TypeORM/PostgreSQL
- **Frontend**: Next.js with React/TailwindCSS
- **Real-time**: Socket.IO for messaging and live updates
- **Database**: PostgreSQL
- **Auth**: JWT (access + refresh tokens)

---

## Responsibilities

Implement all 15 Facebook feature modules in waves, one module at a time. Each module encompasses backend API, database schema, frontend UI, and real-time functionality where applicable.

### Module List

1. **Authentication & Account Management** — Registration, login, OAuth, password recovery, sessions, 2FA, account deactivation/deletion
2. **User Profile** — Profile page, cover/avatar, bio, tabs, editing, activity log
3. **News Feed** — Feed algorithm, post types, interactions, stories
4. **Posts & Content Creation** — Composer, media upload, polls, post management
5. **Comments & Reactions** — Nested comments, 6 reaction types, reaction breakdown
6. **Friends & Connections** — Friend requests, management, following, privacy
7. **Messaging** — Chat, group chats, real-time messaging, calls (WebRTC)
8. **Notifications** — Types, UI, settings, digests
9. **Groups** — Group types, features, moderation, discovery
10. **Pages** — Page creation, features, management
11. **Events** — Event creation, RSVP, discovery
12. **Search** — Global search, autocomplete, filters
13. **Privacy & Settings** — Privacy controls, blocking, account settings
14. **Memories & Archive** — On this day, saved items, archive
15. **Watch** — Video feed, playback, live video

---

## Implementation Workflow

### Wave Structure

Each module is implemented in a wave following this pattern:

```
Wave N: [Module Name]
├── Step 1: Backend API (NestJS controllers, services, DTOs, entities)
├── Step 2: Database Schema (TypeORM entities, migrations)
├── Step 3: Frontend UI (Next.js pages, components, hooks)
├── Step 4: Real-time Events (Socket.IO if applicable)
├── Step 5: Integration Tests
├── Step 6: Docker Build & Push
├── Step 7: GitHub Commit
```

### Testing Requirements

- **Unit Tests**: All service methods must have corresponding unit tests (min 80% coverage)
- **Integration Tests**: API endpoint tests using Jest/supertest
- **E2E Tests**: Critical user flows (login, post creation, messaging)
- **Frontend Tests**: Component tests with React Testing Library

### Docker/GitHub Workflow

After completing each module:

1. **Update Docker Compose**: Ensure all services build correctly
2. **Build Containers**: Test locally with `docker-compose build`
3. **Run Tests**: Verify all tests pass in containers
4. **Push to Registry**: Push to Docker Hub / container registry
5. **Commit to GitHub**: Create commit with conventional changelog

Commit message format:
```
feat(module-N): [module name] - [brief description]

- Backend: [list of changes]
- Frontend: [list of changes]
- Tests: [list of changes]

Closes #[issue number]
```

---

## Module Scopes

### Module 1: Authentication & Account Management

#### Backend Scope
- `POST /api/auth/register` — Create account with validation
- `POST /api/auth/login` — Email/password login
- `GET /api/auth/oauth/[provider]` — Google/GitHub OAuth
- `POST /api/auth/forgot-password` — Send reset email
- `POST /api/auth/reset-password` — Reset with token
- `GET /api/auth/verify-email/[token]` — Email verification
- `GET /api/auth/sessions` — Active sessions list
- `DELETE /api/auth/sessions/[id]` — Revoke session
- `POST /api/auth/2fa/enable` — Enable 2FA
- `DELETE /api/auth/2fa/disable` — Disable 2FA
- `POST /api/auth/deactivate` — Deactivate account
- `POST /api/auth/delete` — Request deletion (30-day grace)

#### Frontend Scope
- `/login` — Login page with OAuth buttons
- `/register` — Registration form with validation
- `/forgot-password` — Password recovery flow
- `/reset-password/[token]` — Reset form
- `/settings/security` — Session management, 2FA setup

#### Database Schema
- `users` table with auth fields
- `sessions` table for devices
- `email_verification_tokens` table
- `password_reset_tokens` table

---

### Module 2: User Profile

#### Backend Scope
- `GET /api/users/[id]` — Get profile
- `PATCH /api/users/[id]` — Update profile
- `POST /api/users/[id]/avatar` — Upload avatar
- `POST /api/users/[id]/cover` — Upload cover photo
- `GET /api/users/[id]/activity` — Activity log

#### Frontend Scope
- `/[username]` — Profile page with tabs
- `/[username]/friends` — Friends list
- `/[username]/photos` — Photo grid
- `/[username]/videos` — Video grid
- `/[username]/about` — About section

---

### Module 3: News Feed

#### Backend Scope
- `GET /api/feed` — Get ranked feed (cursor-based)
- `GET /api/feed/recent` — Chronological feed
- `GET /api/stories` — Get stories
- `POST /api/stories` — Create story

#### Frontend Scope
- `/` — Main feed with infinite scroll
- Story viewer component

---

### Module 4: Posts & Content Creation

#### Backend Scope
- `GET /api/posts` — List posts (feed/profile)
- `POST /api/posts` — Create post
- `GET /api/posts/[id]` — Get post
- `PATCH /api/posts/[id]` — Edit post
- `DELETE /api/posts/[id]` — Delete post
- `POST /api/posts/[id]/media` — Upload media
- `POST /api/posts/[id]/poll` — Create poll
- `POST /api/posts/[id]/schedule` — Schedule post

#### Frontend Scope
- Post composer component
- Post card component
- Photo/video upload component

---

### Module 5: Comments & Reactions

#### Backend Scope
- `POST /api/posts/[id]/comments` — Add comment
- `PATCH /api/comments/[id]` — Edit comment
- `DELETE /api/comments/[id]` — Delete comment
- `POST /api/comments/[id]/reactions` — React to comment
- `POST /api/posts/[id]/reactions` — React to post

#### Frontend Scope
- Comment component with nested replies
- Reaction picker (6 reactions)

---

### Module 6: Friends & Connections

#### Backend Scope
- `POST /api/friends/request` — Send request
- `POST /api/friends/request/[id]/accept` — Accept
- `POST /api/friends/request/[id]/decline` — Decline
- `DELETE /api/friends/request/[id]` — Cancel
- `GET /api/friends/[id]` — Friends list
- `DELETE /api/friends/[id]` — Unfriend
- `POST /api/users/[id]/block` — Block user
- `DELETE /api/users/[id]/block` — Unblock
- `POST /api/users/[id]/follow` — Follow
- `DELETE /api/users/[id]/follow` — Unfollow

#### Frontend Scope
- Friend request component
- Friends list page
- People you may know suggestions

---

### Module 7: Messaging

#### Backend Scope
- `GET /api/conversations` — List conversations
- `POST /api/conversations` — Create DM/group
- `GET /api/conversations/[id]` — Get conversation
- `GET /api/conversations/[id]/messages` — Message history
- `POST /api/conversations/[id]/messages` — Send message
- `PATCH /api/messages/[id]` — Edit message
- `DELETE /api/messages/[id]` — Delete message
- Socket.IO events for real-time

#### Frontend Scope
- `/messages` — Inbox
- `/messages/[id]` — Chat thread

---

### Module 8: Notifications

#### Backend Scope
- `GET /api/notifications` — List notifications
- `PATCH /api/notifications/read-all` — Mark all read
- `PATCH /api/notifications/[id]/read` — Mark read
- `GET /api/notifications/settings` — Get settings
- `PATCH /api/notifications/settings` — Update settings

#### Frontend Scope
- Notification dropdown component
- Notification settings page

---

### Module 9: Groups

#### Backend Scope
- `GET /api/groups` — Discover groups
- `POST /api/groups` — Create group
- `GET /api/groups/[id]` — Get group
- `PATCH /api/groups/[id]` — Update group
- `POST /api/groups/[id]/join` — Join group
- `POST /api/groups/[id]/leave` — Leave group
- `GET /api/groups/[id]/members` — Member list
- `POST /api/groups/[id]/posts` — Group post

#### Frontend Scope
- `/groups` — Groups discovery
- `/groups/[id]` — Group page

---

### Module 10: Pages

#### Backend Scope
- `GET /api/pages` — List pages
- `POST /api/pages` — Create page
- `GET /api/pages/[id]` — Get page
- `PATCH /api/pages/[id]` — Update page
- `POST /api/pages/[id]/follow` — Follow
- `DELETE /api/pages/[id]/follow` — Unfollow

#### Frontend Scope
- `/pages` — Pages discovery
- `/pages/[id]` — Page view

---

### Module 11: Events

#### Backend Scope
- `GET /api/events` — Discover events
- `POST /api/events` — Create event
- `GET /api/events/[id]` — Get event
- `PATCH /api/events/[id]` — Update event
- `POST /api/events/[id]/rsvp` — RSVP

#### Frontend Scope
- `/events` — Events discovery
- `/events/[id]` — Event page

---

### Module 12: Search

#### Backend Scope
- `GET /api/search` — Global search
- `GET /api/search/recent` — Recent searches

#### Frontend Scope
- `/search` — Search results page

---

### Module 13: Privacy & Settings

#### Backend Scope
- `GET /api/settings/privacy` — Get privacy settings
- `PATCH /api/settings/privacy` — Update privacy
- `GET /api/settings/account` — Account settings
- `PATCH /api/settings/account` — Update account
- `GET /api/blocks` — Block list
- `POST /api/blocks` — Add block

#### Frontend Scope
- `/settings` — Account settings
- `/settings/privacy` — Privacy settings

---

### Module 14: Memories & Archive

#### Backend Scope
- `GET /api/memories` — On this day
- `GET /api/saved` — Saved items
- `POST /api/saved` — Save item
- `DELETE /api/saved/[id]` — Unsave
- `GET /api/archive` — Archived posts

#### Frontend Scope
- `/memories` — Memories page
- `/saved` — Saved items

---

### Module 15: Watch

#### Backend Scope
- `GET /api/videos` — Video feed
- `POST /api/videos` — Upload video
- `GET /api/videos/[id]` — Get video
- `POST /api/videos/[id]/like` — Like video
- `GET /api/live` — Live videos

#### Frontend Scope
- `/watch` — Video hub
- `/watch/[id]` — Video player

---

## File Naming Conventions

### Backend (NestJS)
- **Controllers/Services**: `kebab-case.controller.ts`, `kebab-case.service.ts`
- **DTOs**: `create-kebab-case.dto.ts`, `update-kebab-case.dto.ts`
- **Entities**: `kebab-case.entity.ts`
- **Module**: `kebab-case.module.ts`

### Frontend (Next.js)
- **Pages**: `camelCase/page.tsx` (e.g., `login/page.tsx`)
- **Components**: `PascalCase.tsx` (e.g., `PostCard.tsx`)
- **Hooks**: `useCamelCase.ts` (e.g., `useAuth.ts`)
- **API Client**: `apiClient.ts`

---

## Integration with Existing System

### Existing Modules

The project already has partial implementations in:
- `backend/src/auth/` — Basic authentication
- `backend/src/users/` — User management
- `backend/src/posts/` — Basic posts
- `backend/src/comments/` — Comments
- `backend/src/reactions/` — Reactions
- `backend/src/groups/` — Groups
- `backend/src/chat/` — Chat/messaging
- `backend/src/notifications/` — Notifications

### Extension Strategy

1. **DO NOT rewrite** existing code — only extend it
2. **Preserve** all existing API contracts
3. **Add new endpoints** alongside existing ones
4. **Extend entities** with new fields (use migrations)
5. **Reuse** existing Socket.IO namespaces where applicable

---

## Database Schema

Reference the full schema in `clone-prompt.md` (lines 479-643). Key entities:

- `User` — Core user model
- `Post` — Posts with audience, media
- `Friendship` — Bidirectional friendships
- `FriendRequest` — Friend requests
- `Message` — Direct messages
- `Conversation` — Chat threads
- `Notification` — User notifications
- `Group` — Groups with privacy
- `Page` — Business/brand pages
- `Event` — Events
- `Story` — Stories
- `Reaction` — Post/reaction mappings

---

## Real-time Events

Socket.IO namespaces and events (reference `clone-prompt.md` lines 716-733):

```
/messages namespace:
- new_message
- message_seen
- typing_start/typing_stop

/notifications namespace:
- new_notification

/posts namespace:
- post_reaction
```

---

## API Response Format

Follow the standard format from `api-conventions.md`:

```typescript
{
  success: boolean;
  message?: string;
  data?: T;
  errors?: ValidationError[];
}
```

---

## Security Requirements

- Validate all inputs with DTOs
- Hash passwords with bcrypt (12 rounds)
- Use JWT access (15min) + refresh (7 days) tokens
- Apply rate limiting on auth endpoints
- Sanitize all user inputs
- Enforce privacy checks on all content queries

---

## References

- See `clone-prompt.md` for full feature specifications
- See `coding-standards.md` for code style
- See `api-conventions.md` for API structure
- See `security-rules.md` for security details
- See `database-schema.md` for schema
- See `architecture.md` for system boundaries