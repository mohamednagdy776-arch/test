# Database Schema

## Overview

This document defines the relational database schema for the platform.

Database: PostgreSQL  
Cache Layer: Redis (for sessions, feeds, and performance optimization)

The schema is designed for:
- Scalability (10K → 500K+ users)
- Flexibility (AI matching + social features)
- Security (sensitive data isolation)

---

## Core Entity Relationships

### Main Domains

1. User & Profile
2. Matching System
3. Communication
4. Subscription & Payments
5. Social Features (Groups, Posts, Comments)
6. Notifications

---

## Tables

### 1. Users

- id (PK)
- phone
- email
- password_hash
- account_type (user / guardian / agent / admin)
- status (active / pending / banned)
- created_at

---

### 2. Profiles

- id (PK)
- user_id (FK → users.id)
- full_name
- age
- gender
- country
- city
- social_status
- children_count
- created_at

---

### 3. Profile Details

- id
- user_id (FK)
- education
- job_title
- financial_level
- cultural_level
- lifestyle

---

### 4. Preferences

- id
- user_id (FK)
- min_age
- max_age
- preferred_country
- relocate_willing
- wants_children

---

### 5. Matches

- id (PK)
- user1_id (FK → users.id)
- user2_id (FK → users.id)
- score (0–100)
- status (pending / accepted / rejected)
- created_at

---

### 6. Messages

- id
- match_id (FK → matches.id)
- sender_id (FK → users.id)
- content_encrypted
- type (text / voice / video)
- created_at
- deleted_at

---

### 7. Subscriptions

- id
- user_id (FK)
- plan (free / premium)
- start_date
- end_date
- status

---

### 8. Payments / Transactions

- id
- user_id (FK)
- amount
- currency
- gateway
- transaction_id
- status
- created_at

---

### 9. Affiliates

- id
- user_id (FK)
- referral_code
- total_referred
- total_marriages
- commission_balance

---

### 10. Notifications

- id
- user_id (FK)
- type
- message
- read_status
- created_at

---

# 🆕 Social Features Tables

---

### 11. Groups

- id (PK)
- name
- description
- privacy (public / private)
- created_by (FK → users.id)
- created_at

---

### 12. Group Members

- id
- group_id (FK → groups.id)
- user_id (FK → users.id)
- role (admin / member)
- joined_at

---

### 13. Posts

- id (PK)
- group_id (FK → groups.id)
- user_id (FK → users.id)
- content
- media_url
- created_at

---

### 14. Comments (Supports Nested Replies)

- id (PK)
- post_id (FK → posts.id)
- user_id (FK → users.id)
- parent_id (FK → comments.id, NULLABLE)
- content
- created_at

👉 `parent_id` enables:
- Comments
- Replies to comments (infinite nesting if needed)

---

## Key Relationships

### User Relationships
- users → profiles (1:1)
- users → preferences (1:1)
- users → matches (many-to-many via matches table)
- users → messages (1:many)

---

### Matching Relationships
- matches connects:
  - user1_id ↔ user2_id
- messages belong to matches

---

### Social Relationships
- users → groups (many-to-many via group_members)
- groups → posts (1:many)
- posts → comments (1:many)
- comments → comments (self-referencing via parent_id)

---

### Payments
- users → subscriptions (1:many)
- users → transactions (1:many)
- affiliates → referrals (1:many)

---

## Indexing Strategy

### High Priority Indexes

```sql
-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);

-- Matches
CREATE INDEX idx_matches_user1 ON matches(user1_id);
CREATE INDEX idx_matches_user2 ON matches(user2_id);
CREATE INDEX idx_matches_score ON matches(score);

-- Messages
CREATE INDEX idx_messages_match ON messages(match_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);

-- Posts
CREATE INDEX idx_posts_group ON posts(group_id);
CREATE INDEX idx_posts_created_at ON posts(created_at);

-- Comments
CREATE INDEX idx_comments_post ON comments(post_id);
CREATE INDEX idx_comments_parent ON comments(parent_id);

-- Group Members
CREATE INDEX idx_group_members_user ON group_members(user_id);
CREATE INDEX idx_group_members_group ON group_members(group_id);