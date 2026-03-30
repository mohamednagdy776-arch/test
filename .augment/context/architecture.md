# Architecture

## Overview

This document defines the system architecture of the Tayyibt platform.

The system follows a **modular monolith (Phase 1)** evolving into a **microservices-friendly architecture (Phase 2)**.

It now includes a **Social Interaction Layer**:
- Groups
- Posts
- Comments
- Nested replies

---

## System Architecture

### Core Components

1. **Backend Service (API Layer)**
   - Built with NestJS (Node.js)
   - Handles all business logic and APIs
   - Includes social modules (groups, posts, comments)

2. **Admin Dashboard**
   - Built with Next.js (React)
   - Moderates users, posts, groups, and reports

3. **Mobile App**
   - Built with Flutter
   - Supports social feed, groups, and interactions

4. **AI Service**
   - FastAPI (Python)
   - Handles matchmaking logic

5. **Database Layer**
   - PostgreSQL (main DB)
   - Redis (cache, feeds, sessions)

6. **Storage Layer**
   - AWS S3 (media uploads for posts/videos)

---

## New Social Modules (Backend)

The backend is extended with the following modules:

### 1. Groups Module
- Create / join groups
- Public & private groups
- Group roles (admin, member)

### 2. Posts Module
- Create posts inside groups
- Attach media (images/videos)
- Visibility rules

### 3. Comments Module
- Add comments to posts
- Support threaded replies (comments on comments)

### 4. Reactions (Optional Phase 2)
- Likes / reactions on posts and comments

---

## High-Level Architecture Flow

```text
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