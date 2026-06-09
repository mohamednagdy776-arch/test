# 09 — Deployment (VPS)

## Target Environment

| Property | Value |
|----------|-------|
| Provider | Hostinger VPS |
| IP | `145.14.158.100` |
| Hostname | `srv1726898.hstgr.cloud` |
| Public domain | `145-14-158-100.sslip.io` (sslip.io maps IP → DNS) |
| OS | Ubuntu 24.04 |
| Access | `ssh root@145.14.158.100` |
| App dir | `/opt/tayyibt` |

> `sslip.io` is a free wildcard DNS service: `145-14-158-100.sslip.io` always resolves to `145.14.158.100`, which lets us obtain a real Let's Encrypt certificate without owning a domain.

---

## Compose Files

| File | Use |
|------|-----|
| `docker-compose.yml` | Local development (ports mapped to host: web 3002, admin 3001, backend 3003) |
| `docker-compose.vps.yml` | Production on the VPS (nginx fronts everything, internal-only services) |
| `docker-compose.prod.yml` | Domain-based production with SSL volume mount |

### Production stack (`docker-compose.vps.yml`)

Services: `nginx`, `backend`, `admin`, `web`, `ollama`, `ai-service`, `postgres`, `redis`.
Volumes: `postgres_data`, `redis_data`, `ollama_data`.
Network: `tayyibt-network` (bridge).

nginx publishes ports **80** and **443**; mounts `./docker/nginx/nginx.conf` and `./certs`.

---

## Environment File (`.env.production`)

Generated with strong random secrets. Key variables:

```
DATABASE_URL=postgresql://tayyibt_user:<pw>@postgres:5432/tayyibt_prod
DB_USER=tayyibt_user  DB_PASSWORD=<pw>  DB_NAME=tayyibt_prod
REDIS_URL=redis://:<pw>@redis:6379  REDIS_PASSWORD=<pw>
JWT_SECRET=<64 random chars>  JWT_EXPIRES_IN=7d
NODE_ENV=production
CORS_ORIGIN=https://145-14-158-100.sslip.io
NEXT_PUBLIC_API_URL=https://145-14-158-100.sslip.io/api/v1
NEXT_PUBLIC_WS_URL=https://145-14-158-100.sslip.io
AI_SERVICE_URL=http://ai-service:5000
TYPEORM_SYNCHRONIZE=true
```

`.env.production` is gitignored. The Next.js `NEXT_PUBLIC_*` values are baked into the build, so changing them requires rebuilding `web` and `admin`.

---

## First-Time Server Setup

`scripts/vps-setup.sh` (or the Python `vps-deploy.py`) installs:
- Docker + Docker Compose v2
- UFW firewall (allow 22, 80, 443)
- Creates `/opt/tayyibt`

---

## Deployment Workflow

The project uses **Python/paramiko automation scripts** (the dev environment is Windows; these avoid rsync/ssh-key friction):

| Script | Purpose |
|--------|---------|
| `scripts/vps-deploy.py` | Full deploy: setup, upload archive, build, launch |
| `scripts/deploy-ai.py` | Deploy AI service + pull Gemma model |
| `scripts/seed-50-users.py` | Seed 50 test users |
| `scripts/run-tests.py` | Run the full automated test suite |
| `scripts/setup-letsencrypt.py` | Obtain + install Let's Encrypt cert |

### Typical redeploy of one service

```bash
# upload changed source, then on the VPS:
docker compose -f docker-compose.vps.yml --env-file .env.production \
  build --no-cache <service>
docker compose -f docker-compose.vps.yml --env-file .env.production \
  up -d --no-deps <service>
```

---

## TLS / HTTPS

1. `sslip.io` provides the resolvable hostname.
2. `certbot certonly --standalone -d 145-14-158-100.sslip.io` obtains the certificate (nginx stopped briefly to free port 80).
3. Certs copied to `/opt/tayyibt/certs/{fullchain.pem, privkey.pem}` and mounted into nginx.
4. nginx redirects HTTP→HTTPS and serves TLS 1.2/1.3.
5. **Auto-renewal**: a weekly cron (`Mon 03:00`) runs `renew-cert.sh` (stop nginx → `certbot renew` → copy certs → start nginx).

Certificate validity: 90 days (Let's Encrypt), auto-renewed.

---

## nginx Routing (production)

```nginx
server { listen 80; return 301 https://145-14-158-100.sslip.io$request_uri; }
server {
  listen 443 ssl http2;
  server_name 145-14-158-100.sslip.io;
  ssl_certificate     /etc/nginx/certs/fullchain.pem;
  ssl_certificate_key /etc/nginx/certs/privkey.pem;
  # security headers + HSTS
  location /api/        { proxy_pass http://backend; }     # + WS upgrade
  location /socket.io/  { proxy_pass http://backend; }     # long read timeout
  location /ai/         { proxy_pass http://ai_service/; }
  location /admin/      { proxy_pass http://admin/; }
  location /            { proxy_pass http://web; }
}
```

---

## Docker Images

| Service | Base image | Build |
|---------|-----------|-------|
| backend | node:20-alpine | multi-stage (builder → runner), `node dist/main` |
| web | node:20-alpine | Next standalone, `node server.js`, `HOSTNAME=0.0.0.0` |
| admin | node:20-alpine | Next standalone, `node server.js`, `HOSTNAME=0.0.0.0` |
| ai-service | python:3.11 | venv install, `uvicorn app.main:app` |
| ollama | ollama/ollama:latest | pulls `gemma3:4b` after start |
| postgres | postgres:15-alpine | |
| redis | redis:7-alpine | password-protected |
| nginx | nginx:1.25-alpine | |

Health checks are defined for backend, web, admin, ai-service, ollama, and postgres.

---

## Operational Notes

- **DB schema**: first deploy used `TYPEORM_SYNCHRONIZE=true` to create all 42 tables. Disable for stable production and use migrations for changes.
- **Logs**: `docker compose -f docker-compose.vps.yml logs -f <service>`.
- **Model storage**: Gemma weights persist in the `ollama_data` volume (survives restarts).
- **Next.js standalone** requires `HOSTNAME=0.0.0.0` env so the server binds correctly inside the container.
