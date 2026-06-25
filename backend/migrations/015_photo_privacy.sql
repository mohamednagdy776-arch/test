-- #752: modesty-first photo privacy.
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS photo_visibility TEXT NOT NULL DEFAULT 'public';

CREATE TABLE IF NOT EXISTS photo_access_requests (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  owner_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status       TEXT NOT NULL DEFAULT 'pending',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_photo_access_pair UNIQUE (requester_id, owner_id)
);
CREATE INDEX IF NOT EXISTS idx_photo_access_owner ON photo_access_requests (owner_id);
