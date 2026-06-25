-- #746 supporting schema. The actual GET /posts/saved 500 was a code bug
-- (skip/take pagination over a raw join — fixed in PostsService.getSavedPosts).
-- This migration just ensures the saved_posts table + soft-delete column + a
-- uniqueness index exist on any environment that predates them. All idempotent.

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
