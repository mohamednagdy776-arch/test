-- Migration 032 — second extended-profile batch: travel destinations,
-- hairdresser visit frequency, and a private intimacy/relationship-experience
-- pair (gated at the API layer — see UsersService#getFullProfile — to only a
-- confirmed mutual match, never shown while browsing).
-- Idempotent — safe to re-run.

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS travel_destinations jsonb NOT NULL DEFAULT '[]';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS hairdresser_frequency varchar;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS intimacy_interests jsonb NOT NULL DEFAULT '[]';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS intimacy_experience varchar;
