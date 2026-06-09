#!/bin/bash
# scripts/deploy-vps.sh
# Upload the project and deploy to the VPS from your LOCAL machine.
#
# Usage: bash scripts/deploy-vps.sh
#
# Requirements:
#   - rsync installed locally (Git Bash / WSL on Windows)
#   - SSH key or password access to root@145.14.158.100
#   - .env.production filled in with real secrets

set -e

VPS_HOST="root@145.14.158.100"
APP_DIR="/opt/tayyibt"
COMPOSE_FILE="docker-compose.vps.yml"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log()  { echo -e "${GREEN}[deploy]${NC} $1"; }
warn() { echo -e "${YELLOW}[warn]${NC} $1"; }
err()  { echo -e "${RED}[error]${NC} $1"; exit 1; }

# --- Pre-flight checks ---
[ ! -f ".env.production" ] && err ".env.production not found. Create it from .env.production.example"

if grep -q "CHANGE_" .env.production; then
  err ".env.production still contains CHANGE_ placeholder values. Fill in real secrets first."
fi

log "Starting deployment to $VPS_HOST ..."

# --- Sync code (exclude heavy dirs, local env) ---
log "Uploading project files..."
rsync -az --progress \
  --exclude='node_modules' \
  --exclude='**/node_modules' \
  --exclude='.next' \
  --exclude='**/.next' \
  --exclude='dist' \
  --exclude='**/dist' \
  --exclude='build' \
  --exclude='.git' \
  --exclude='.env' \
  --exclude='.env.local' \
  --exclude='**/.env.local' \
  --exclude='mobile/' \
  --exclude='*.log' \
  --exclude='coverage/' \
  --exclude='*.h5' \
  --exclude='*.pkl' \
  --exclude='*.joblib' \
  ./ "${VPS_HOST}:${APP_DIR}/"

# --- Upload production env ---
log "Uploading .env.production..."
rsync -az .env.production "${VPS_HOST}:${APP_DIR}/.env.production"

# --- Remote: build and start ---
log "Building and starting containers on VPS..."
ssh "${VPS_HOST}" bash <<REMOTE
set -e
cd ${APP_DIR}

echo "[vps] Pulling base images..."
docker compose -f ${COMPOSE_FILE} --env-file .env.production pull postgres redis nginx 2>/dev/null || true

echo "[vps] Building app images (this takes a few minutes)..."
docker compose -f ${COMPOSE_FILE} --env-file .env.production build --no-cache

echo "[vps] Starting all services..."
docker compose -f ${COMPOSE_FILE} --env-file .env.production up -d --remove-orphans

echo "[vps] Waiting 30s for services to start..."
sleep 30

echo "[vps] Container status:"
docker compose -f ${COMPOSE_FILE} ps

echo "[vps] Health checks:"
curl -sf http://localhost/api/v1/health > /dev/null && echo "  Backend: OK" || echo "  Backend: FAILED"
curl -sf http://localhost/          > /dev/null && echo "  Web:     OK" || echo "  Web:     FAILED"
REMOTE

log ""
log "=============================="
log " Deployment complete!"
log " App: http://145.14.158.100"
log " API: http://145.14.158.100/api/v1"
log " Admin: http://145.14.158.100/admin/"
log "=============================="
log "Monitor logs: ssh ${VPS_HOST} docker compose -f ${APP_DIR}/${COMPOSE_FILE} logs -f"
