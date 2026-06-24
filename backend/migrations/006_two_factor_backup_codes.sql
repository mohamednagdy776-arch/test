-- #759: 2FA recovery. Store SHA-256 hashes of one-time backup codes (JSON array)
-- so a user who loses their authenticator can recover instead of being locked out.
ALTER TABLE users ADD COLUMN IF NOT EXISTS two_factor_backup_codes TEXT;
