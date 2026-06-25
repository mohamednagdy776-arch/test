-- #746: saving a post returned 201 (the INSERT works) but GET /posts/saved 500'd.
-- The SavedPost entity has a @DeleteDateColumn, so find() adds `WHERE deleted_at
-- IS NULL`; if saved_posts is missing (never migrated) or predates that column,
-- the read query errors while the insert still succeeds. Create the table and
-- backfill the column idempotently.

CREATE TABLE IF NOT EXISTS saved_posts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  post_id     UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  saved_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at  TIMESTAMPTZ
);

-- In case the table already exists from an older schema without soft-delete.
ALTER TABLE saved_posts ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_saved_posts_user ON saved_posts (user_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_saved_posts_user_post ON saved_posts (user_id, post_id) WHERE deleted_at IS NULL;
