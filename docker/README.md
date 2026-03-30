# Docker

Docker configuration files for all Tayyibt services.

## Folder Structure

```
docker/
├── backend/
│   └── Dockerfile          # NestJS backend image
├── admin/
│   └── Dockerfile          # Next.js admin dashboard image
├── web/
│   └── Dockerfile          # Next.js user-facing web app image
├── mobile/
│   └── Dockerfile          # Flutter build image (CI/CD use)
├── ai-service/
│   └── Dockerfile          # FastAPI AI service image
└── nginx/
    └── nginx.conf          # Reverse proxy config (production)
```

## Usage

Development (all services):
```bash
docker-compose up
```

Single service:
```bash
docker-compose up backend
docker-compose up ai-service
```

Production build:
```bash
docker-compose -f docker-compose.prod.yml up --build
```

## Standards

- Use multi-stage builds to keep images small
- Never copy `.env` into images — inject at runtime
- Pin base image versions (e.g., `node:20-alpine`, `python:3.11-slim`)
- Each service must expose only the port it needs
- Health checks required for all production containers
