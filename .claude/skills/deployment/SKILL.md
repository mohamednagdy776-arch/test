---
name: deployment
description: Deploy Tayyibt services to VPS via Docker Compose, run DB migrations in production, and verify health. Use when deploying backend/frontend changes to production, running production migrations, restarting services, or checking container logs on the VPS.
---

# Deployment — Tayyibt VPS

## Connection
- **VPS**: `root@145.14.158.100` — SSH key `~/.ssh/id_tayyibt`
- **Compose file**: `/opt/tayyibt/docker-compose.vps.yml`
- **Env file**: `/opt/tayyibt/.env.production`

## Core deploy command
```bash
ssh -i ~/.ssh/id_tayyibt root@145.14.158.100 \
  "cd /opt/tayyibt && docker compose -f docker-compose.vps.yml --env-file .env.production up -d --build"
```

## Common operations

### Pull latest and restart
```bash
ssh -i ~/.ssh/id_tayyibt root@145.14.158.100 \
  "cd /opt/tayyibt && git pull && docker compose -f docker-compose.vps.yml --env-file .env.production up -d --build"
```

### Restart a single service (no rebuild)
```bash
ssh -i ~/.ssh/id_tayyibt root@145.14.158.100 \
  "cd /opt/tayyibt && docker compose -f docker-compose.vps.yml --env-file .env.production restart <service>"
```

### View logs
```bash
ssh -i ~/.ssh/id_tayyibt root@145.14.158.100 \
  "docker compose -f /opt/tayyibt/docker-compose.vps.yml --env-file /opt/tayyibt/.env.production logs --tail=100 -f <service>"
```

### Health check
```bash
curl -s https://tayyibt.com/api/v1/health | jq .
```

## Production migration (CRITICAL)
TypeORM runs with `synchronize: false` in production. **Never change schema via ORM sync.**

Run schema changes with raw SQL directly on VPS:
```bash
ssh -i ~/.ssh/id_tayyibt root@145.14.158.100 \
  "docker exec tayyibt-db psql -U postgres -d tayyibt -c \"<ALTER TABLE ...>\""
```
See the `database-migration` skill for safe migration patterns.

## Pre-deploy checklist
1. All GitHub issues / PRs merged and pushed to `main`
2. `git pull` on VPS confirms latest commit
3. Any pending schema changes applied via ALTER TABLE (not ORM)
4. Secrets in `.env.production` up to date
5. Health endpoint returns 200 after deploy

## Rollback
```bash
ssh -i ~/.ssh/id_tayyibt root@145.14.158.100 \
  "cd /opt/tayyibt && git checkout <previous-commit> && \
   docker compose -f docker-compose.vps.yml --env-file .env.production up -d --build"
```
