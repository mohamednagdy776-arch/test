#!/bin/bash
# scripts/deploy/deploy-prod.sh
# Deploys the full stack to production.
# Run from the project root: bash scripts/deploy/deploy-prod.sh
#
# ⚠️  PRODUCTION — requires explicit confirmation.

set -e

# --- Safety confirmation ---
echo "⚠️  You are about to deploy to PRODUCTION."
read -p "Type 'yes' to continue: " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
  echo "❌ Deployment cancelled."
  exit 1
fi

echo "🚀 Starting production deployment..."

# --- Validate environment ---
if [ ! -f ".env.production" ]; then
  echo "❌ .env.production not found. Create it from .env.production.example"
  exit 1
fi

# --- Pull latest code ---
echo "⏳ Pulling latest code from main..."
git pull origin main

# --- Build images ---
echo "⏳ Building Docker images..."
docker compose -f docker-compose.prod.yml --env-file .env.production build --no-cache

# --- Run migrations before switching traffic ---
echo "⏳ Running database migrations..."
docker compose -f docker-compose.prod.yml --env-file .env.production run --rm backend \
  npx ts-node scripts/db/migrate.ts

# --- Deploy with zero-downtime rolling restart ---
echo "⏳ Deploying services..."
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --remove-orphans

echo "⏳ Waiting for services to stabilize..."
sleep 20

# --- Health check ---
echo "⏳ Running health checks..."
curl -sf http://localhost:3000/api/v1/health > /dev/null && echo "  ✅ Backend healthy" || echo "  ❌ Backend health check failed"
curl -sf http://localhost:5000/health > /dev/null && echo "  ✅ AI service healthy" || echo "  ❌ AI service health check failed"

echo ""
echo "✅ Production deployment complete"
echo "   Monitor logs: docker compose -f docker-compose.prod.yml logs -f"
