# 01 — Product Overview

## Vision

**Tayyibt** is a smart matchmaking and marriage platform built specifically for Muslim communities worldwide. It combines a modern social network experience (feeds, groups, events, chat) with an AI-driven compatibility engine that respects Islamic values and prioritizes religious compatibility in matchmaking.

The name *Tayyibt (طيبت)* derives from the Arabic root for "good / pure / wholesome," reflecting the platform's goal of facilitating halal, marriage-focused connections.

---

## Core Goals

1. **Halal-first matchmaking** — opposite-gender pairing only, religious compatibility weighted highest.
2. **AI compatibility scoring** — a hybrid rule-based + local-LLM engine produces a 0–100 score plus human-readable reasons.
3. **Community building** — groups, pages, events, and social feeds keep users engaged beyond 1:1 matching.
4. **Privacy & safety** — encrypted messages, content moderation aligned with Islamic guidelines, blocking/restriction tools.
5. **Global reach** — multi-country, bilingual (Arabic / English) experience.

---

## Target Users

- Practicing Muslims seeking marriage partners.
- Guardians (wali) who may participate in the process.
- Community organizers running groups, pages, and events.
- Administrators moderating content and managing the platform.

Account types supported: `user`, `guardian`, `agent`, `admin`.

---

## Feature Summary

### Matchmaking
- AI compatibility scoring (0–100) with weighted dimensions.
- Match generation, accept/reject workflow.
- Detailed match breakdown by religion, lifestyle, interests, location, and other factors.
- AI-generated match reasons, icebreakers, and bio suggestions.

### Social
- **Feed** — posts with text, media, polls, feelings, location, scheduling, and audience controls.
- **Reactions & comments** — threaded comments, emoji reactions.
- **Stories** — ephemeral story posts with highlights and view tracking.
- **Friends** — requests, suggestions, custom lists, birthdays, blocking, restrictions.
- **Groups** — public/private/secret communities with membership and roles.
- **Pages** — followable brand/topic pages with likes.
- **Events** — create events, RSVP (going / interested / not going).
- **Videos** — video feed with trending, recommended, and continue-watching.

### Communication
- **Chat** — real-time 1:1 and group messaging via Socket.IO.
- Message reactions, replies, editing, starring, forwarding, search, disappearing messages.
- Encrypted message content at rest.

### Account & Settings
- Multi-tab profile editing (basic, education/work, religion, preferences).
- Privacy, notification, appearance (theme), language, and newsletter settings.
- Two-factor authentication (TOTP).
- Session management, account deactivation/deletion, data export.

### Discovery
- **Search** across users, posts, groups, pages, and events.
- Autocomplete suggestions.
- Advanced filters (gender, country, city, age range, sect, lifestyle, education, prayer level).

### Monetization
- Subscription tiers and upgrade flow.
- Affiliate program.
- Payment/transaction tracking.

### Admin
- Separate admin dashboard for moderation and management.

---

## AI Compatibility Philosophy

The matching algorithm encodes Islamic matchmaking priorities through configurable weights:

| Dimension | Weight | Rationale |
|-----------|--------|-----------|
| Religious | 35% | Sect, prayer level, religious commitment — highest priority |
| Lifestyle | 25% | Cultural level, lifestyle type alignment |
| Other | 20% | Age, children preferences, education |
| Location | 12% | Country and city proximity |
| Interests | 8% | Shared hobbies |

Same-gender pairs always score 0 (Islamic matchmaking requires opposite-gender pairing).

See [06-ai-service.md](./06-ai-service.md) for full algorithm details.
