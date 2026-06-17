-- Migration 004 — email_change_requests table (#454)
-- Separate table for pending email changes (keeps the User table untouched).
-- Idempotent.
CREATE TABLE IF NOT EXISTS email_change_requests (
  id          uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL,
  new_email   character varying NOT NULL,
  token_hash  character varying NOT NULL,
  expires_at  timestamp without time zone NOT NULL,
  created_at  timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT pk_email_change_requests PRIMARY KEY (id),
  CONSTRAINT fk_ecr_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
