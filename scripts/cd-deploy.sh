#!/usr/bin/env bash
#
# Continuous-deploy script — runs ON the VPS.
# Rebuilds and restarts the stack from the code already in /opt/tayyibt.
# Invoked by the GitHub Actions deploy workflow (and usable manually).
#
# Preserves untracked secrets/state: .env.production, certs/, Docker volumes.

set -euo pipefail

APP_DIR="${APP_DIR:-/opt/tayyibt}"
cd "$APP_DIR"

COMPOSE="docker compose -f docker-compose.vps.yml --env-file .env.production"

echo "==> Building images (cached layers reused; changed services rebuild)…"
$COMPOSE build

echo "==> Starting/refreshing services…"
$COMPOSE up -d --remove-orphans

echo "==> Reloading nginx config…"
docker exec tayyibt-nginx-1 nginx -s reload 2>/dev/null || true

echo "==> Pruning dangling images…"
docker image prune -f >/dev/null 2>&1 || true

echo "==> Status:"
docker ps --format 'table {{.Names}}\t{{.Status}}'

echo "==> Deploy complete."
