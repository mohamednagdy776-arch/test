-- Insert user1@tayyibt.com for testing
-- Run in container: docker compose exec -T postgres psql -U user -d tayyibt -f /scripts/insert-user.sql

-- To see the existing schema, check the user entity and generate hash:
-- docker compose exec backend node -e "const b=require('bcryptjs'); b.hash('Test1234', 12).then(h => console.log(h))"

-- For now this is a placeholder - let's generate and insert directly via Docker
-- Step 1: Generate hash
-- docker compose exec backend node -e "const b=require('bcryptjs'); b.hash('Test1234', 12).then(h => console.log(h))"

-- Result from above command - paste the hash below:
-- $2a$12$hash_value_here

-- Using psql directly:
-- docker compose exec postgres psql -U user -d tayyibt -c "INSERT INTO users (email, phone, password_hash, status, is_verified) VALUES ('user1@tayyibt.com', '+201000000000', '\$2a\$12\$hash_here', 'active', true) ON CONFLICT (email) DO NOTHING"

-- Quick insert using the running backend's node:
-- docker compose exec backend sh -c 'echo Y | node -e "const b=require(\"bcryptjs\"); b.hash(\"Test1234\", 12).then(h => console.log(h)).then(() => process.exit(0))"'