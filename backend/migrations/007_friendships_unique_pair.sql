-- #736: a double-clicked "Add friend" inserted two identical pending rows.
-- Enforce one row per (requester, addressee) pair. Dedupe any existing
-- duplicates first (keep the earliest), then add the unique constraint.

DELETE FROM friendships a
USING friendships b
WHERE a.requester_id = b.requester_id
  AND a.addressee_id = b.addressee_id
  AND a.ctid > b.ctid;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'uq_friendship_pair'
  ) THEN
    ALTER TABLE friendships
      ADD CONSTRAINT uq_friendship_pair UNIQUE (requester_id, addressee_id);
  END IF;
END $$;
