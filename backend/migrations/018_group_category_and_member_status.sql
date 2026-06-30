-- #34/#36/#37: groups feature fixes.
-- Production runs with TypeORM synchronize disabled, so these columns must be
-- added explicitly. Both are idempotent so replaying the migration is safe.

-- #37: persist a group's category so the Groups category filter has something
-- to match (categories sent on create were previously dropped).
ALTER TABLE groups ADD COLUMN IF NOT EXISTS category VARCHAR;

-- #36: join requests for private groups. 'active' = full member, 'pending' = a
-- request awaiting admin approval (not counted as a member / not in "my groups").
ALTER TABLE group_members ADD COLUMN IF NOT EXISTS status VARCHAR NOT NULL DEFAULT 'active';
