-- Migration 003 — who_can_follow privacy column (#480)
-- Idempotent; default 'public' keeps existing follow behaviour unchanged.
ALTER TABLE privacy_settings
  ADD COLUMN IF NOT EXISTS who_can_follow character varying NOT NULL DEFAULT 'public';
