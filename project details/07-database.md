# 07 — Database Schema (PostgreSQL)

## Overview

- **Engine**: PostgreSQL 15.
- **ORM**: TypeORM 0.3 (entities in `backend/src/**/entities/*.entity.ts`).
- **Tables**: 42 application tables.
- **IDs**: UUID primary keys (`uuid_generate_v4` / `gen_random_uuid`).
- **Schema management**: `synchronize` auto-creates tables from entities (enabled in prod via `TYPEORM_SYNCHRONIZE=true` for initial deploy).

---

## All Tables (42)

```
activity_log               group_members              profiles
affiliates                 groups                     reactions
blocks                     hidden_posts               reports
comment_reactions          matches                    saved_collections
comments                   message_reactions          saved_items
conversation_participants  messages                   saved_posts
conversations              notifications              sessions
event_rsvps                page_followers             stories
events                     page_likes                 story_highlights
friend_lists               pages                      story_views
friendships                post_reports               subscriptions
group_members              posts                      transactions
                           privacy_settings           user_blocks
                           profile_education          user_restrictions
                           profile_work               users
                                                      videos
```

---

## Core Entities

### `users`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| email | varchar | unique |
| phone | varchar | unique |
| password_hash | varchar | bcrypt |
| first_name, last_name | varchar | nullable |
| username | varchar | unique, nullable |
| full_name | varchar | nullable |
| date_of_birth | date | nullable |
| gender | enum | `male` / `female` / `custom` |
| is_verified | bool | default false |
| is_deactivated | bool | default false |
| verification_token / expires | varchar / date | email verify |
| reset_token / expires | varchar / date | password reset |
| failed_login_attempts | int | lockout tracking |
| locked_until | date | lockout |
| totp_secret | varchar | 2FA |
| two_factor_enabled / verified | bool | 2FA |
| account_type | varchar | `user` / `guardian` / `agent` / `admin` |
| oauth_provider / oauth_id | varchar | Google/GitHub |
| status | varchar | `active` / `pending` / `banned` |
| created_at | timestamp | |
| deleted_at | timestamp | soft delete |

`@OneToOne` → `profiles`.

### `profiles`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| user_id | uuid | FK → users (OneToOne) |
| full_name | varchar | |
| age | int | default 18 |
| gender | varchar | |
| country, city | varchar | |
| social_status | varchar | marital status |
| children_count | int | default 0 |
| avatar_url, cover_url | varchar | |
| bio | text | |
| website | varchar | |
| relationship_status | varchar | |
| location, workplace | varchar | |
| intro_visibility | varchar | `public`/`friends`/`only_me` |
| education | varchar | |
| job_title | varchar | |
| financial_level | varchar | |
| cultural_level | varchar | |
| lifestyle | varchar | conservative/moderate/open |
| sect | varchar | Sunni/Shia/Ibadi/… |
| prayer_level | varchar | never…always |
| religious_commitment | varchar | low/moderate/high |
| min_age, max_age | int | match prefs |
| preferred_country | varchar | |
| relocate_willing | bool | |
| wants_children | bool | |
| created_at | timestamp | |

Relations: `@OneToMany` → `profile_work`, `profile_education`.

### `matches`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| user1_id | uuid | FK → users |
| user2_id | uuid | FK → users |
| score | float | default 0, 0–100 |
| status | varchar | `pending`/`accepted`/`rejected`/`chat` |
| created_at | timestamp | |

### `messages`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| conversation_id | uuid | FK → conversations (CASCADE) |
| sender_id | uuid | FK → users |
| content_encrypted | varchar | **encrypted at rest** |
| type | enum | text/image/video/file/voice |
| media_url | varchar | nullable |
| reply_to_id | varchar | threading |
| is_edited | bool | |
| edited_at | timestamp | |
| is_deleted_for_everyone | bool | |
| is_starred | bool | |
| created_at / deleted_at | timestamp | soft delete |

Relations: `@OneToMany` → `message_reactions`.

### `posts`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| group_id | uuid | nullable FK → groups |
| user_id | uuid | FK → users |
| content | text | |
| media_url, media_type | varchar | |
| media_urls | text[] | array |
| post_type | enum | text/photo/video/link/shared/event/checkin/poll/feeling |
| audience | enum | public/friends/friends_of_friends/only_me/custom |
| … | | feeling, location, scheduling, pin, archive flags |

Relations: `@OneToMany` → `reactions`, `comments`.

---

## Relationship Map (selected)

```
users (1)───(1) profiles
users (1)───(n) posts ───(n) comments
                 └────(n) reactions
users (n)───(n) friendships (requester/addressee)
users (n)───(n) matches (user1/user2)
conversations (1)───(n) messages ───(n) message_reactions
conversations (1)───(n) conversation_participants
groups (1)───(n) group_members
pages (1)───(n) page_followers / page_likes
events (1)───(n) event_rsvps
saved_collections (1)───(n) saved_items
users (1)───(n) sessions
users (1)───(n) notifications
```

---

## Soft Deletes

Several entities use TypeORM `@DeleteDateColumn` (`deleted_at`) for soft deletion: `users`, `messages`, `posts`, etc. Queries exclude soft-deleted rows by default.

---

## Encryption at Rest

Message bodies are stored in `content_encrypted`. Personal data handling follows the project rule that user data must be encrypted at rest.

---

## Seeded Data

The platform ships with **50 detailed seed users** across 19 countries (see `scripts/seed-50-users.py`):
- 25 male / 25 female.
- Sects: Sunni (46), Shia (3), Ibadi (1).
- Varied prayer levels, lifestyles, education, occupations, marital status.
- All use password `Test1234`.
