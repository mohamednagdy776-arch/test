# Database Schema & Relationships

The Tayyibt database uses PostgreSQL to manage complex relationships between users, their social interactions, and matching data.

## Core Entities

### Users & Profiles
- **users:** Stores core authentication data (email, phone, password_hash) and account status.
- **profiles:** Extended user data including personal details, religious information, and bio. (1:1 with users)

### Matching & Chat
- **matches:** Represents a potential or confirmed connection between two users, including their AI-generated compatibility score and status (pending/accepted/rejected).
- **messages:** Encrypted chat content linked to a specific match.

### Social Features
- **groups:** Community spaces created by users or admins.
- **posts:** Content shared within groups or on the general feed.
- **comments:** Responses to posts.
- **reactions:** (Planned) Likes or other interactions on posts.

### Management & Subscriptions
- **subscriptions:** Tracks user membership plans (Free vs. Premium).
- **transactions:** Financial records for subscription payments.
- **notifications:** Alerts for user activities.
- **reports:** User-generated flags for moderation review.
- **affiliates:** Tracks referral codes and commission balances for the partner program.

## Entity Relationship Summary

- **User Centricity:** Almost every table links back to the `users` table.
- **Match-Chat Link:** Messages are strictly scoped within a `matches` record to ensure privacy.
- **Hierarchical Social Content:** `groups` → `posts` → `comments`.
- **Admin Visibility:** Admins have access to view and manage all tables via the Admin Dashboard.

## Key Constraints
- **Uniqueness:** Emails, phone numbers, and referral codes are strictly unique.
- **Integrity:** Foreign keys ensure that orphaned data (e.g., a post without a user) is not created.
- **Security:** Passwords are never stored in plain text (hashes only), and chat content is stored in an encrypted format.
