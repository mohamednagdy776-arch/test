-- #753: wali (guardian)-supervised conversations. A ward designates a guardian.
CREATE TABLE IF NOT EXISTS guardian_oversights (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ward_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  guardian_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mode        TEXT NOT NULL DEFAULT 'awareness',
  status      TEXT NOT NULL DEFAULT 'active',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_guardian_ward UNIQUE (ward_id)
);
CREATE INDEX IF NOT EXISTS idx_guardian_oversights_guardian ON guardian_oversights (guardian_id);
