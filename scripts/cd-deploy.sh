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

echo "==> Applying nginx config…"
# nginx.conf is a single-file bind mount. rsync/clean-mirror replaces the file
# (new inode), but the running container still points at the OLD inode, so
# `nginx -s reload` would re-read stale config. We must force-recreate the nginx
# container so it re-binds the current file. But EVERYTHING is behind this nginx,
# so first validate the new config in a throwaway container — only recreate if it
# passes, otherwise keep the running nginx so a bad config can't take the site down.
# The validation container MUST join the compose network, otherwise `nginx -t`
# cannot resolve the upstream service names (backend/web/admin/ai-service) and
# fails with a false "host not found in upstream" — which previously made us skip
# EVERY nginx update (force-recreate never ran).
NET="$(docker inspect -f '{{range $k,$v := .NetworkSettings.Networks}}{{$k}}{{end}}' tayyibt-backend-1 2>/dev/null)"
NET="${NET:-tayyibt_tayyibt-network}"
if docker run --rm --network "$NET" \
     -v /opt/tayyibt/docker/nginx/nginx.conf:/etc/nginx/conf.d/default.conf:ro \
     -v /opt/tayyibt/certs:/etc/nginx/certs:ro \
     nginx:1.25-alpine nginx -t >/dev/null 2>&1; then
  $COMPOSE up -d --force-recreate --no-deps nginx
else
  echo "WARNING: new nginx.conf failed 'nginx -t' validation — keeping the running nginx." >&2
  docker run --rm --network "$NET" \
    -v /opt/tayyibt/docker/nginx/nginx.conf:/etc/nginx/conf.d/default.conf:ro \
    -v /opt/tayyibt/certs:/etc/nginx/certs:ro nginx:1.25-alpine nginx -t || true
fi
docker exec tayyibt-nginx-1 nginx -s reload 2>/dev/null || true

echo "==> Pruning dangling images…"
docker image prune -f >/dev/null 2>&1 || true

echo "==> Status:"
docker ps --format 'table {{.Names}}\t{{.Status}}'

echo "==> Deploy complete."
