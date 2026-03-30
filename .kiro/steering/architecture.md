# Architecture

## Overview

Modular Monolith (Phase 1) → Microservices-ready (Phase 2).

Includes a Social Interaction Layer: Groups, Posts, Comments, Nested Replies.

---

## Core Components

1. Backend API — NestJS (Node.js), REST + WebSocket
2. Admin Dashboard — Next.js (React)
3. Mobile App — Flutter
4. AI Service — FastAPI (Python), separate microservice
5. Database — PostgreSQL (main) + Redis (cache, feeds, sessions)
6. Storage — AWS S3 (media uploads)

---

## High-Level Flow

```
Mobile App / Admin Dashboard
            │
            ▼
      Backend API (NestJS)
            │
   ┌────────┼───────────────┐
   ▼        ▼               ▼
Database   Redis        AI Service
(PostgreSQL)            (FastAPI)
   │
   ▼
Storage (S3)
```

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
