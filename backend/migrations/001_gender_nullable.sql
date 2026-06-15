-- Migration 001 — make profiles.gender nullable (issue #192)
--
-- Context: this project historically relied on TypeORM `synchronize` to apply
-- schema changes. As of the same change set, `synchronize` is disabled in
-- production (issue #147), so schema changes must be applied manually there.
--
-- Issue #192 removes the silent `gender DEFAULT 'male'` and makes the column
-- nullable so an omitted gender is stored as NULL (rendered as '—') instead of
-- mis-gendering the user. Without this migration, the application code (which
-- now inserts NULL when gender is omitted) would violate the existing NOT NULL
-- constraint on the live database and break profile creation.
--
-- Safe to run multiple times. Run BEFORE deploying the new backend build, e.g.:
--   docker compose exec -T postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
--     < backend/migrations/001_gender_nullable.sql

ALTER TABLE profiles ALTER COLUMN gender DROP DEFAULT;
ALTER TABLE profiles ALTER COLUMN gender DROP NOT NULL;
