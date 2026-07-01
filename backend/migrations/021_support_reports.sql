-- #50: "Report a Problem" support tickets submitted from Settings → Report.
-- Idempotent: safe to run repeatedly.
CREATE TABLE IF NOT EXISTS support_reports (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES users(id) ON DELETE SET NULL,
  type         VARCHAR(32) NOT NULL,
  description  TEXT NOT NULL,
  email        TEXT,
  attachments  JSONB,
  status       VARCHAR(32) NOT NULL DEFAULT 'open',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_support_reports_status ON support_reports (status);
CREATE INDEX IF NOT EXISTS idx_support_reports_user ON support_reports (user_id);
