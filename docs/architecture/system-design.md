# Tayyibt System Architecture

## Overview

Tayyibt is a modular monolith designed for future microservices migration. The system follows a multi-platform architecture with shared backend services.

## High-Level Architecture

```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│   Web App   │  │ Admin Panel │  │Mobile App   │
│  (Next.js)  │  │  (Next.js)  │  │  (Flutter)  │
│  Port 3002  │  │  Port 3001  │  │             │
└──────┬──────┘  └──────┬──────┘  └──────┬──────┘
       │                │                │
       └────────┬───────┴────────────────┘
                │
         ┌──────▼──────┐
         │  Nginx      │ (Production only)
         │  Port 80/443│
         └──────┬──────┘
                │
    ┌───────────┼───────────┐
    │           │           │
┌───▼───┐ ┌────▼────┐ ┌───▼────┐
│Backend│ │AI Svc   │ │        │
│NestJS │ │FastAPI  │ │        │
│:3000  │ │:5000    │ │        │
└───┬───┘ └────┬────┘ │        │
    │          │      │        │
┌───▼───┐ ┌───▼────┐ │        │
│Postgres│ │Redis  │ │        │
│:5432  │ │:6379  │ │        │
└───────┘ └───────┘ │        │
```

## Services

### Backend API (NestJS)
- REST API with JWT authentication
- WebSocket gateway for real-time chat
- TypeORM for PostgreSQL access
- Modular architecture: auth, users, matching, chat, groups, posts, comments, subscriptions, payments, notifications, affiliates, reports, health

### Web App (Next.js 14)
- App Router with server/client components
- React Query for data fetching
- Socket.IO for real-time chat
- RTL support for Arabic

### Admin Dashboard (Next.js 14)
- User management and moderation
- Content moderation (posts, groups, reports)
- Payment and subscription monitoring
- Match review

### Mobile App (Flutter)
- Clean Architecture (data/domain/presentation)
- Riverpod state management
- Dio HTTP client
- Flutter Secure Storage for tokens

### AI Service (FastAPI)
- Rule-based weighted compatibility scoring
- Feature extraction: religious, lifestyle, interests, location, other
- Match ranking engine
- Designed for ML model integration (Phase 2)

## Database Schema

See `docs/database/erd.md` for the complete entity-relationship diagram.

## Authentication Flow

1. User registers/logs in → Backend validates credentials
2. Backend issues JWT access token (15min) + refresh token (7 days)
3. Client stores tokens in localStorage (web) or FlutterSecureStorage (mobile)
4. Each request includes `Authorization: Bearer <token>` header
5. Backend validates token via Passport JWT strategy
6. On 401 response, client redirects to login

## Real-Time Communication

- Socket.IO WebSocket on the NestJS backend
- Clients join match rooms (`joinMatch` event)
- Messages broadcast to room participants (`newMessage` event)
- Messages persisted via ChatService before emission

## AI Matching Pipeline

1. Backend requests compatibility scores from AI service
2. AI service extracts features from both user profiles
3. Weighted scoring across 5 categories (religious 30%, lifestyle 25%, interests 20%, location 15%, other 10%)
4. Scores returned as 0-100 with match reasons
5. Matches stored in database with status workflow: pending → accepted/rejected/chat

## Deployment

- Docker Compose for development and production
- Nginx reverse proxy for production
- SSL termination at Nginx
- Health checks on all services
- Persistent volumes for PostgreSQL and Redis
