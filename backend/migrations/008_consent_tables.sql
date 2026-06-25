-- #747: GET /consent/my 500'd because the consent tables were never created in
-- production (synchronize is off in prod and no migration shipped them). Create
-- them here. Column names mirror the entity mappings EXACTLY — note consentType,
-- status and action have no name: override, so TypeORM uses the literal (quoted,
-- case-preserving) property name.

CREATE TABLE IF NOT EXISTS consent_requests (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_user_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "consentType"       TEXT NOT NULL,
  status              TEXT NOT NULL DEFAULT 'pending',
  requested_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  responded_at        TIMESTAMPTZ,
  expires_at          TIMESTAMPTZ NOT NULL,
  revoked_at          TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_consent_requests_requester ON consent_requests (requester_user_id);
CREATE INDEX IF NOT EXISTS idx_consent_requests_target    ON consent_requests (target_user_id);

CREATE TABLE IF NOT EXISTS consent_audit_logs (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consent_request_id  UUID NOT NULL REFERENCES consent_requests(id) ON DELETE CASCADE,
  action              TEXT NOT NULL,
  actor_user_id       UUID NOT NULL,
  ip_address          TEXT,
  occurred_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
