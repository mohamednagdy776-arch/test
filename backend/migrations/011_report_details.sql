-- #751: user reporting. Add an optional free-text details column to reports so a
-- reporter can add context alongside the catalog reason.
ALTER TABLE reports ADD COLUMN IF NOT EXISTS details TEXT;
