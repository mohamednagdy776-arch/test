-- #74/#76 Video cards always showed 0:00 duration because the videos table had
-- no column to store it at all. Populated client-side (HTMLVideoElement) at
-- upload time going forward; existing rows stay NULL (renders as 0:00, same
-- as before, until re-uploaded).

ALTER TABLE videos
  ADD COLUMN IF NOT EXISTS duration INTEGER;
