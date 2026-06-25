-- #754: directed "Send Salam" interest + profile-view tracking.

CREATE TABLE IF NOT EXISTS interests (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status      TEXT NOT NULL DEFAULT 'pending',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_interest_pair UNIQUE (sender_id, receiver_id)
);
CREATE INDEX IF NOT EXISTS idx_interests_sender   ON interests (sender_id);
CREATE INDEX IF NOT EXISTS idx_interests_receiver ON interests (receiver_id);

CREATE TABLE IF NOT EXISTS profile_views (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  viewer_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  viewed_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_profile_view_pair UNIQUE (viewer_id, profile_id)
);
CREATE INDEX IF NOT EXISTS idx_profile_views_profile ON profile_views (profile_id);
