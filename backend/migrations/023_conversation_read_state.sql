-- #63 The unread message counter never reflected new incoming messages because
-- there was no persisted per-user read state — getUnreadCount counted ALL
-- incoming messages and the conversation list never returned a per-thread
-- unreadCount. Add a last_read_at marker per participant so unread = messages
-- from others created after the user last opened the thread. Idempotent.

ALTER TABLE conversation_participants
  ADD COLUMN IF NOT EXISTS last_read_at TIMESTAMPTZ;
