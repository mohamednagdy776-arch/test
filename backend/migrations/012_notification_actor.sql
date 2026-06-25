-- Notifications now record the actor (who triggered them) so the dropdown can
-- render "<name> accepted your friend request" instead of a nameless message.
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS actor_id UUID REFERENCES users(id) ON DELETE CASCADE;
