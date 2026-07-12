-- Posts could only ever belong to a user or a group -- there was no way to
-- associate a post with a Page, so the Pages composer had nowhere to save to
-- and GET /pages/:id/posts always returned an empty stub (#373).
ALTER TABLE posts ADD COLUMN IF NOT EXISTS page_id UUID REFERENCES pages(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_posts_page_id ON posts(page_id);
