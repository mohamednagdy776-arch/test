-- #60 Story reactions. Adds the story_reactions table so viewers can leave a
-- quick emoji reaction on a story. One reaction per (story, user) — reacting
-- again updates the emoji. All statements are idempotent.

CREATE TABLE IF NOT EXISTS story_reactions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id    UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  emoji       TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_story_reactions_story ON story_reactions (story_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_story_reactions_story_user ON story_reactions (story_id, user_id);
