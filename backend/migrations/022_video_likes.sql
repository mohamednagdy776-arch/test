-- #78 Liking a video failed with 404 because no POST /videos/:id/like endpoint
-- (and no backing table) existed. Add the video_likes join table so likes can
-- be persisted per user/video. Idempotent — safe to re-run.

CREATE TABLE IF NOT EXISTS video_likes (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id  UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  user_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  liked_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_video_likes_video ON video_likes (video_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_video_likes_video_user ON video_likes (video_id, user_id);
