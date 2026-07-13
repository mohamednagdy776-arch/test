-- No notification was ever sent when an event started (#112). Tracks
-- whether the start-notification cron has already fired for this event, so
-- it isn't sent again on every subsequent tick.
ALTER TABLE events ADD COLUMN IF NOT EXISTS start_notification_sent BOOLEAN NOT NULL DEFAULT false;
