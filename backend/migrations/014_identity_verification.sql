-- #755: identity / photo (KYC) verification.
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_identity_verified BOOLEAN NOT NULL DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS identity_verifications (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  selfie_url           TEXT NOT NULL,
  id_document_url      TEXT NOT NULL,
  status               TEXT NOT NULL DEFAULT 'pending',
  reviewed_by_admin_id UUID,
  rejection_reason     TEXT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_identity_verifications_user   ON identity_verifications (user_id);
CREATE INDEX IF NOT EXISTS idx_identity_verifications_status ON identity_verifications (status);
