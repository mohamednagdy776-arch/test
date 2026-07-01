-- #45 / #46: Education & Work "financial/cultural level" and the marriage
-- Preferences fields exist on the Profile entity + DTO but were never migrated
-- into the DB. With TypeORM synchronize OFF in prod, the columns can be missing,
-- so these edits never persist. Idempotent ADD COLUMN IF NOT EXISTS is safe to
-- re-run and no-ops where the columns already exist.

-- Education & Work (#45)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS financial_level VARCHAR;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cultural_level  VARCHAR;

-- Marriage preferences (#46)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS min_age           INTEGER;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS max_age           INTEGER;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preferred_country VARCHAR;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS relocate_willing  BOOLEAN;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS wants_children    BOOLEAN;
