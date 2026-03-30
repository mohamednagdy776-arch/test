#!/bin/bash
# scripts/deploy/deploy-staging.sh
# Deploys the full stack to the staging environment.
# Run from the project root: bash scripts/deploy/deploy-staging.sh

set -e  # exit on any error

echo "🚀 Starting staging deployment..."

# --- Validate environment ---
if [ ! -f ".env.staging" ]; then
  echo "❌ .env.staging not found. Create it from .env.production.example"
  exit 1
fi

# --- Pull latest code ---
echo "⏳ Pulling latest code..."
git pull origin main

# --- Build and deploy with Docker Compose ---
echo "⏳ Building Docker images..."
docker compose -f docker-compose.prod.yml --env-file .env.staging build --no-cache

echo "⏳ Running database migrations..."
docker compose -f docker-compose.prod.yml --env-file .env.staging run --rm backend \
  npx ts-node scripts/db/migrate.ts

echo "⏳ Starting services..."
docker compose -f docker-compose.prod.yml --env-file .env.staging up -d

echo "⏳ Waiting for health checks..."
sleep 15

# --- Verify services are healthy ---
BACKEND_STATUS=$(docker compose -f docker-compose.prod.yml ps backend --format json | python3 -c "import sys,json; d=json.load(sys.stdin); print(d[0]['Health'])" 2>/dev/null || echo "unknown")
echo "  Backend: $BACKEND_STATUS"

echo "✅ Staging deployment complete"
echo "   API:   http://staging.tayyibt.com/api/v1/health"
echo "   Admin: http://staging.tayyibt.com"
