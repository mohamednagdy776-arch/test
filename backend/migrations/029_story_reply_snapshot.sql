-- Story replies were sent as plain text messages with zero indication they
-- were replying to a story, losing all context for the recipient (#62).
-- A plain nullable column (not touching the messages.type enum) so this
-- doesn't depend on knowing/altering the Postgres enum type name.
ALTER TABLE messages ADD COLUMN IF NOT EXISTS story_snapshot_url TEXT;
