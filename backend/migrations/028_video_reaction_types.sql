-- The video player only ever supported a boolean Like (video_likes had no
-- type column), unlike posts which support multiple reaction types (#151).
ALTER TABLE video_likes ADD COLUMN IF NOT EXISTS type VARCHAR(20) NOT NULL DEFAULT 'like';
