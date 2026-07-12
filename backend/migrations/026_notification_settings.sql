-- Migration 026 — notification_settings table (#217)
--
-- Context: getNotificationSettings/updateNotificationSettings always returned
-- hardcoded defaults merged with whatever the caller sent, with nothing ever
-- persisted anywhere -- every change silently reverted on the next page
-- load/refresh. Idempotent — safe to re-run.

CREATE TABLE IF NOT EXISTS notification_settings (
  id                              uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id                         uuid NOT NULL,
  notifications_enabled          boolean NOT NULL DEFAULT true,
  likes_notifications            boolean NOT NULL DEFAULT true,
  comments_notifications         boolean NOT NULL DEFAULT true,
  friend_requests_notifications  boolean NOT NULL DEFAULT true,
  messages_notifications         boolean NOT NULL DEFAULT true,
  mentions_notifications         boolean NOT NULL DEFAULT true,
  email_notifications            boolean NOT NULL DEFAULT true,
  push_notifications             boolean NOT NULL DEFAULT true,
  sms_notifications              boolean NOT NULL DEFAULT false,
  CONSTRAINT pk_notification_settings PRIMARY KEY (id),
  CONSTRAINT uq_notification_settings_user UNIQUE (user_id),
  CONSTRAINT fk_notification_settings_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
