-- #130 POST /videos/:id/comments 404'd because no comments table/route existed
-- for videos at all (only posts had one). Separate table rather than reusing
-- `comments` (which hard-requires a post_id) to avoid touching that entity's
-- existing reactions/replies/pin logic.

CREATE TABLE IF NOT EXISTS video_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_video_comments_video_id ON video_comments(video_id);
