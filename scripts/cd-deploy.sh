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

# ── Database migrations ──────────────────────────────────────────────────────
# Production runs with TypeORM `synchronize` disabled (#147), so schema changes
# do NOT auto-apply. Run the SQL migrations here so a merged schema change can't
# leave the code referencing a table/column that doesn't exist. Every file is
# written to be idempotent (CREATE/ALTER ... IF NOT EXISTS, etc.), so replaying
# all of them on every deploy is safe and order-stable (lexical filename order).
echo "==> Applying database migrations…"
# up -d returns before Postgres accepts connections — wait for it.
for i in $(seq 1 30); do
  if $COMPOSE exec -T postgres sh -c 'pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB"' >/dev/null 2>&1; then break; fi
  sleep 2
done
shopt -s nullglob
for f in backend/migrations/*.sql; do
  echo "   migration: $f"
  if ! $COMPOSE exec -T postgres sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -v ON_ERROR_STOP=1' < "$f"; then
    echo "ERROR: migration $f failed — aborting deploy before traffic is served." >&2
    exit 1
  fi
done
shopt -u nullglob
echo "==> Migrations applied ✅"

echo "==> Applying nginx config…"
# nginx.conf is a single-file bind mount. rsync/clean-mirror replaces the file
# (new inode), but the running container still points at the OLD inode, so
# `nginx -s reload` would re-read stale config. We must force-recreate the nginx
# container so it re-binds the current file. But EVERYTHING is behind this nginx,
# so first validate the new config in a throwaway container — only recreate if it
# passes, otherwise keep the running nginx so a bad config can't take the site down.
#
# This nginx is the shared edge for EVERY site on the VPS. Other projects add their
# site configs/certs/pages (docker cp) and attach nginx to their own networks at
# runtime. Files now persist in /opt/edge-nginx (mounted, see docker-compose.vps.yml);
# networks are not persisted by Docker, so: remember them, validate the FULL config
# (all sites) with the same mounts on all those networks, and re-attach them BEFORE
# the new nginx starts. If validation fails, keep the running nginx.
EDGE=/opt/edge-nginx
MOUNTS=(-v "$EDGE/etc-nginx:/etc/nginx" -v "$EDGE/www:/var/www"
        -v /opt/tayyibt/docker/nginx/nginx.conf:/etc/nginx/conf.d/default.conf:ro
        -v /opt/tayyibt/certs:/etc/nginx/certs:ro)
attach() {
  while read -r n; do
    [ -n "$n" ] && [ "$n" != tayyibt_tayyibt-network ] && docker network connect "$n" "$1" 2>/dev/null || true
  done < "$EDGE/networks.txt"
}

if [ ! -d "$EDGE/etc-nginx/conf.d" ] || [ ! -d "$EDGE/www" ]; then
  echo "WARNING: $EDGE is not set up — refusing to recreate nginx (every other site would be lost). Keeping the running nginx." >&2
else
  { docker inspect tayyibt-nginx-1 --format '{{range $n,$v := .NetworkSettings.Networks}}{{$n}}{{"\n"}}{{end}}' 2>/dev/null
    cat "$EDGE/networks.txt" 2>/dev/null; } | sed '/^$/d' | sort -u > "$EDGE/networks.txt.new" \
    && mv "$EDGE/networks.txt.new" "$EDGE/networks.txt"

  docker rm -f nginx-validate >/dev/null 2>&1 || true
  docker create --name nginx-validate --network tayyibt_tayyibt-network "${MOUNTS[@]}" \
    nginx:1.25-alpine nginx -t >/dev/null
  attach nginx-validate
  if out=$(docker start -a nginx-validate 2>&1); then
    docker rm -f nginx-validate >/dev/null
    $COMPOSE up -d --no-start --force-recreate --no-deps nginx
    attach tayyibt-nginx-1
    docker start tayyibt-nginx-1
  else
    docker rm -f nginx-validate >/dev/null
    echo "WARNING: full nginx config failed 'nginx -t' validation — keeping the running nginx:" >&2
    echo "$out" | tail -5 >&2
  fi
fi
docker exec tayyibt-nginx-1 nginx -s reload 2>/dev/null || true

# Authoritative health gate — runs HERE on the VPS (localhost), where the result
# is deterministic. The GitHub runner often can't reach the public endpoint
# (sslip.io DNS / provider firewall on 443), so the workflow's external probe is
# only informational; THIS is what actually decides if the deploy is healthy.
echo "==> Waiting for the stack to report healthy…"
health_ok=0
for i in $(seq 1 30); do
  code="$(curl -s -o /dev/null -w '%{http_code}' -k https://localhost/api/v1/health || echo 000)"
  echo "   health attempt $i/30 -> $code"
  if [ "$code" = "200" ]; then health_ok=1; break; fi
  sleep 5
done
if [ "$health_ok" != "1" ]; then
  echo "ERROR: backend did not become healthy on the VPS within ~150s." >&2
  echo "==> Backend container logs (last 80 lines):" >&2
  docker logs tayyibt-backend-1 --tail 80 2>&1 >&2 || true
  echo "==> Backend container status:" >&2
  docker inspect tayyibt-backend-1 --format '{{.State.Status}} exitCode={{.State.ExitCode}} error={{.State.Error}}' 2>&1 >&2 || true
  exit 1
fi
echo "==> Stack healthy ✅"

echo "==> Pruning dangling images…"
docker image prune -f >/dev/null 2>&1 || true

echo "==> Status:"
docker ps --format 'table {{.Names}}\t{{.Status}}'

echo "==> Deploy complete."
