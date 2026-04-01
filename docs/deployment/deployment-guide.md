# Deployment Guide

## Prerequisites

- Docker and Docker Compose installed
- Domain name with DNS configured (for production)
- SSL certificates (for production)

## Development Setup

```bash
# 1. Clone repository
git clone <repo-url>
cd tayyibt

# 2. Copy environment file
cp .env.example .env

# 3. Edit .env with your values
# DATABASE_URL, JWT_SECRET, etc.

# 4. Start all services
docker compose up --build

# 5. Seed test data
docker compose cp scripts/db/seed-docker.js backend:/app/seed-docker.js
docker compose exec backend node /app/seed-docker.js
```

## Services

| Service | URL | Port |
|---------|-----|------|
| Web App | http://localhost:3002 | 3002 |
| Admin | http://localhost:3001 | 3001 |
| Backend API | http://localhost:3000/api/v1 | 3000 |
| AI Service | http://localhost:5000 | 5000 |
| PostgreSQL | localhost:5432 | 5432 |
| Redis | localhost:6379 | 6379 |

## Production Deployment

### 1. Prepare Environment

```bash
cp .env.production.example .env.production
# Edit .env.production with production values
# Set strong JWT_SECRET, DB_PASSWORD, REDIS_PASSWORD
# Set NEXT_PUBLIC_API_URL, NEXT_PUBLIC_WS_URL
```

### 2. SSL Certificates

Place your SSL certificates in `./certs/`:
- `cert.pem` - SSL certificate
- `key.pem` - Private key

### 3. Deploy

```bash
# Using the deployment script
chmod +x scripts/deploy/deploy-prod.sh
./scripts/deploy/deploy-prod.sh
```

Or manually:
```bash
docker compose -f docker-compose.prod.yml --env-file .env.production up --build -d
```

### 4. Verify

```bash
# Check all services are running
docker compose -f docker-compose.prod.yml ps

# Check backend health
curl https://yourdomain.com/api/v1/health

# Check AI service health
curl https://yourdomain.com/ai/health
```

## Nginx Routes

| Path | Upstream | Description |
|------|----------|-------------|
| `/api/` | backend:3000 | REST API |
| `/socket.io/` | backend:3000 | WebSocket |
| `/ai/` | ai-service:5000 | AI service |
| `/admin/` | admin:3001 | Admin dashboard |
| `/` | web:3002 | Web app |

## Monitoring

- Health checks configured for backend, AI service, and PostgreSQL
- Logs available via `docker compose logs -f <service>`
- Backend logs to stdout (captured by Docker)

## Backup

```bash
# Backup PostgreSQL
docker compose exec postgres pg_dump -U $DB_USER $DB_NAME > backup.sql

# Restore PostgreSQL
docker compose exec -T postgres psql -U $DB_USER $DB_NAME < backup.sql
```

## Scaling

The architecture supports horizontal scaling:
- Backend: Run multiple instances behind a load balancer
- AI Service: Stateless, can run multiple instances
- Web/Admin: Stateless Next.js apps, can run multiple instances
- Database: Use connection pooling or read replicas
- Redis: Use Redis Cluster for high availability
