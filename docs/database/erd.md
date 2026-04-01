# Database Entity-Relationship Diagram

## Tables

### users
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK, auto-generated |
| email | VARCHAR | UNIQUE, NOT NULL |
| phone | VARCHAR | UNIQUE, NOT NULL |
| password_hash | VARCHAR | NOT NULL |
| account_type | VARCHAR | DEFAULT 'user' (user/guardian/agent/admin) |
| status | VARCHAR | DEFAULT 'pending' (active/pending/banned) |
| created_at | TIMESTAMP | DEFAULT NOW() |

### profiles
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| user_id | UUID | FK → users.id |
| full_name | VARCHAR | |
| gender | VARCHAR | |
| date_of_birth | DATE | |
| country | VARCHAR | |
| city | VARCHAR | |
| sect | VARCHAR | |
| lifestyle | VARCHAR | |
| education | VARCHAR | |
| occupation | VARCHAR | |
| bio | TEXT | |
| avatar | VARCHAR | |
| children_count | INT | DEFAULT 0 |
| prayer_level | VARCHAR | |
| created_at | TIMESTAMP | |

### matches
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| user1_id | UUID | FK → users.id |
| user2_id | UUID | FK → users.id |
| score | DECIMAL | |
| status | VARCHAR | DEFAULT 'pending' |
| created_at | TIMESTAMP | |

### messages
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| match_id | UUID | FK → matches.id |
| sender_id | UUID | FK → users.id |
| content_encrypted | VARCHAR | NOT NULL |
| type | VARCHAR | DEFAULT 'text' |
| created_at | TIMESTAMP | |
| deleted_at | TIMESTAMP | nullable |

### groups
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| name | VARCHAR | NOT NULL |
| description | TEXT | |
| privacy | VARCHAR | DEFAULT 'public' |
| created_by | UUID | FK → users.id |
| created_at | TIMESTAMP | |

### posts
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| group_id | UUID | FK → groups.id |
| user_id | UUID | FK → users.id |
| content | TEXT | NOT NULL |
| media_url | VARCHAR | nullable |
| created_at | TIMESTAMP | |

### comments
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| post_id | UUID | FK → posts.id |
| user_id | UUID | FK → users.id |
| content | TEXT | NOT NULL |
| created_at | TIMESTAMP | |

### subscriptions
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| user_id | UUID | FK → users.id |
| plan | VARCHAR | DEFAULT 'free' (free/premium) |
| start_date | TIMESTAMP | NOT NULL |
| end_date | TIMESTAMP | NOT NULL |
| status | VARCHAR | DEFAULT 'active' |

### transactions
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| user_id | UUID | FK → users.id |
| amount | DECIMAL | NOT NULL |
| currency | VARCHAR | NOT NULL |
| gateway | VARCHAR | NOT NULL |
| transaction_id | VARCHAR | NOT NULL |
| status | VARCHAR | DEFAULT 'pending' |
| created_at | TIMESTAMP | |

### notifications
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| user_id | UUID | FK → users.id |
| type | VARCHAR | NOT NULL |
| message | VARCHAR | NOT NULL |
| read_status | BOOLEAN | DEFAULT false |
| created_at | TIMESTAMP | |

### affiliates
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| user_id | UUID | FK → users.id (UNIQUE) |
| referral_code | VARCHAR | UNIQUE |
| total_referred | INT | DEFAULT 0 |
| total_marriages | INT | DEFAULT 0 |
| commission_balance | DECIMAL | DEFAULT 0 |

### reports
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| reported_by | UUID | FK → users.id |
| target_type | VARCHAR | NOT NULL |
| target_id | UUID | NOT NULL |
| reason | TEXT | NOT NULL |
| status | VARCHAR | DEFAULT 'pending' |
| created_at | TIMESTAMP | |

## Relationships

```
users 1───1 profiles
users 1───N matches (as user1 or user2)
users 1───N messages (as sender)
users 1───N groups (as createdBy)
users 1───N posts
users 1───N comments
users 1───N subscriptions
users 1───N transactions
users 1───N notifications
users 1───1 affiliates
users 1───N reports (as reportedBy)
matches 1───N messages
groups 1───N posts
posts 1───N comments
```
