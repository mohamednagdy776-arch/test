-- Migration 002 — follows table (#485) + who_can_send_messages column (#487)
--
-- Context: production runs with `synchronize` disabled (#147) and there is no
-- migration runner in the deploy, so new tables/columns must be applied here
-- manually. Without this, the follow endpoints and the privacy-settings read
-- error at runtime (missing relation/column).
--
-- Column types match the existing analogous tables (friendships.*_id = uuid,
-- privacy_settings.who_can_* = varchar). Idempotent — safe to re-run.
--
-- Applied to production 2026-06-16. Run BEFORE (or with) deploying #485/#487:
--   docker compose exec -T postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
--     < backend/migrations/002_follows_and_messaging.sql

CREATE TABLE IF NOT EXISTS follows (
  id            uuid NOT NULL DEFAULT gen_random_uuid(),
  follower_id   uuid NOT NULL,
  following_id  uuid NOT NULL,
  created_at    timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT pk_follows PRIMARY KEY (id),
  CONSTRAINT uq_follow_pair UNIQUE (follower_id, following_id),
  CONSTRAINT fk_follows_follower  FOREIGN KEY (follower_id)  REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_follows_following FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE
);

ALTER TABLE privacy_settings
  ADD COLUMN IF NOT EXISTS who_can_send_messages character varying NOT NULL DEFAULT 'public';
