# Project Overview

## Tayyibt

Tayyibt is an AI-powered smart matchmaking and marriage platform designed for Muslim communities worldwide, with a primary focus on Egypt, KSA, UAE, and the diaspora.

The platform connects individuals based on deep compatibility factors including religious values, lifestyle, psychology, and long-term goals — while respecting privacy, family involvement, and cultural norms.

---

## Mission

To provide a secure, intelligent, and culturally aligned platform that facilitates meaningful and successful marriages using advanced technology and AI.

---

## Core Features

- AI-Powered Matching (compatibility scoring 0–100)
- Multi-Role System: Users, Guardians, Agents, Admins
- Secure Communication: real-time chat, voice, video (premium)
- Social Features: Groups, Posts, Comments, Nested Replies
- Subscription & Monetization: Free/Premium plans, affiliate commissions
- Multi-Language: Arabic-first (RTL), English, French, Turkish, Urdu

---

## Platforms

- Mobile App (Flutter) — Android & iOS
- Admin Dashboard (Next.js)
- Backend API (NestJS REST + WebSocket)
- AI Service (FastAPI / Python)

---

## Technology Stack

- Backend: NestJS + TypeScript
- Frontend: Next.js + React
- Mobile: Flutter + Dart
- AI: FastAPI + Python
- Database: PostgreSQL + Redis
- Storage: AWS S3
- Auth: JWT (access + refresh tokens)

---

## Architecture

- Modular Monolith (Phase 1) → Microservices-ready (Phase 2)
- AI service is a separate microservice
- Real-time via WebSocket

---

## Target Scale

- Initial: 10,000+ concurrent users
- Scalable to: 500,000+ users globally

---

## Development Phases

- Phase 1 (MVP): Auth, profiles, basic AI matching, text chat, admin dashboard, subscriptions
- Phase 2: Video calls, real-time translation, social features, AI improvements
- Phase 3+: AI child prediction, genetic analysis, marketplace & real estate modules
