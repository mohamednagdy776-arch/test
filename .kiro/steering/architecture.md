# Architecture

## Overview

Modular Monolith (Phase 1) → Microservices-ready (Phase 2).

Includes a Social Interaction Layer: Groups, Posts, Comments, Nested Replies.

---

## Core Components

1. Backend API — NestJS (Node.js), REST + WebSocket — port 3000
2. Web App — Next.js (React), user-facing — port 3002
3. Admin Dashboard — Next.js (React), internal only — port 3001
4. Mobile App — Flutter (Android + iOS)
5. AI Service — FastAPI (Python), separate microservice — port 5000
6. Database — PostgreSQL (main) + Redis (cache, feeds, sessions)
7. Storage — AWS S3 (media uploads)

---

## High-Level Flow

```
Web App (3002) / Mobile App / Admin (3001)
                    │
                    ▼
          Backend API (NestJS :3000)
                    │
         ┌──────────┼──────────────┐
         ▼          ▼              ▼
     Database     Redis        AI Service
   (PostgreSQL)              (FastAPI :5000)
         │
         ▼
     Storage (S3)
```

---

## Web App vs Admin Dashboard

| | Web App (`/web`) | Admin Dashboard (`/admin`) |
|---|---|---|
| Users | Regular users, guardians, agents | Admins only |
| Purpose | Matching, chat, groups, posts, profile | Moderation, analytics, management |
| Port | 3002 | 3001 |
| Auth | User JWT | Admin JWT (role: admin) |

---

## Social Modules (Backend)

- Groups: create/join, public & private, group roles (admin/member)
- Posts: create inside groups, attach media, visibility rules
- Comments: threaded replies via self-referencing `parent_id`
- Reactions: likes on posts/comments (Phase 2)

---

## Key Architecture Rules

- Feature-based modular structure per service
- Controllers stay thin — all logic lives in services
- DTOs for all input validation
- Redis for caching match results, feeds, sessions
- WebSocket for real-time chat and notifications
- AI service communicates via internal HTTP API
- Web and Mobile share the same backend API endpoints
