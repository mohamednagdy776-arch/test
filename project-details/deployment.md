# Deployment & Development Setup

Tayyibt is designed to be easily portable and scalable using Docker.

## Development Environment

### Prerequisites
- Docker & Docker Compose
- Node.js & npm (for local development without Docker)
- Flutter SDK (for mobile development)

### Quick Start
1. **Clone the Repo:** `git clone <repo-url>`
2. **Setup Env:** Copy `.env.example` to `.env`.
3. **Launch:** `docker compose up --build`
4. **Seed Data:** Run the provided scripts to populate the database with test users and matches.

### Service URLs (Local)
- **Web App:** `http://localhost:3002`
- **Admin Dashboard:** `http://localhost:3001`
- **Backend API:** `http://localhost:3000/api/v1`
- **AI Service:** `http://localhost:5000`

## Production Deployment

The production environment is typically orchestrated using `docker-compose.prod.yml` and managed via a deployment script.

### Architecture (Prod)
- **Nginx:** Acts as a reverse proxy, handling SSL termination and routing requests to the appropriate containers.
- **PostgreSQL:** Uses persistent volumes for data safety.
- **Redis:** Provides high-speed caching for sessions and real-time features.

### Scaling
Each service is stateless (except for the databases), allowing for horizontal scaling by running multiple instances of the Backend, Web, or AI services behind a load balancer.

### Monitoring & Maintenance
- **Health Checks:** Every service has a `/health` endpoint monitored by Docker.
- **Logs:** Centralized logging via Docker stdout/stderr.
- **Backups:** Automated PostgreSQL dumps are recommended for data safety.
