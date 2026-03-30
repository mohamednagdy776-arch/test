# Database Schema

## Stack

- Primary DB: PostgreSQL
- Cache: Redis (sessions, feeds, match results)

---

## Core Tables

### users
- id, phone, email, password_hash
- account_type: `user | guardian | agent | admin`
- status: `active | pending | banned`
- created_at

### profiles
- id, user_id (FK), full_name, age, gender, country, city
- social_status, children_count, created_at

### profile_details
- id, user_id (FK), education, job_title, financial_level, cultural_level, lifestyle

### preferences
- id, user_id (FK), min_age, max_age, preferred_country, relocate_willing, wants_children

### matches
- id, user1_id (FK), user2_id (FK)
- score (0–100), status: `pending | accepted | rejected`
- created_at

### messages
- id, match_id (FK), sender_id (FK)
- content_encrypted, type: `text | voice | video`
- created_at, deleted_at

### subscriptions
- id, user_id (FK), plan: `free | premium`
- start_date, end_date, status

### transactions
- id, user_id (FK), amount, currency, gateway, transaction_id, status, created_at

### affiliates
- id, user_id (FK), referral_code, total_referred, total_marriages, commission_balance

### notifications
- id, user_id (FK), type, message, read_status, created_at

---

## Social Tables

### groups
- id, name, description, privacy: `public | private`
- created_by (FK → users.id), created_at

### group_members
- id, group_id (FK), user_id (FK), role: `admin | member`, joined_at

### posts
- id, group_id (FK), user_id (FK), content, media_url, created_at

### comments
- id, post_id (FK), user_id (FK)
- parent_id (FK → comments.id, NULLABLE) — enables nested replies
- content, created_at

---

## Key Indexes

```sql
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_matches_user1 ON matches(user1_id);
CREATE INDEX idx_matches_user2 ON matches(user2_id);
CREATE INDEX idx_matches_score ON matches(score);
CREATE INDEX idx_messages_match ON messages(match_id);
CREATE INDEX idx_posts_group ON posts(group_id);
CREATE INDEX idx_comments_post ON comments(post_id);
CREATE INDEX idx_comments_parent ON comments(parent_id);
CREATE INDEX idx_group_members_user ON group_members(user_id);
```
