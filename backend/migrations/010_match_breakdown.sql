-- #741: store the AI service's per-dimension sub-scores (religious/lifestyle/
-- interests/location/other) on each match so the client shows a real breakdown
-- instead of fabricating bars from the single total score.
ALTER TABLE matches ADD COLUMN IF NOT EXISTS breakdown JSONB;
