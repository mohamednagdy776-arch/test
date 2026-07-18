-- Migration 031 — extended profile data (health/employment/religious-practice
-- detail + free-tag interests & skills) so users can describe themselves in
-- more depth for matching, beyond the existing core Profile columns.
-- Idempotent — safe to re-run.

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS health_status varchar;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS employment_type varchar;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS settle_country varchar;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS quran_memorization varchar;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS mosque_attendance varchar;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS insurance_type varchar;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS interests jsonb NOT NULL DEFAULT '[]';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS skills jsonb NOT NULL DEFAULT '[]';
