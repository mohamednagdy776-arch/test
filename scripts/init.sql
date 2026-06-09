-- Initial seed data for Tayyibt
-- This runs automatically when PostgreSQL container starts for the first time

-- Create extension for uuid
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

\echo '✅ Database initialized'