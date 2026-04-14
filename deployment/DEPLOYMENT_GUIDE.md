# Tayyibt Production Deployment Guide

Comprehensive guide for deploying the Tayyibt platform on Hostinger VPS using Docker and VS Code.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Server Preparation](#server-preparation)
3. [Project Setup](#project-setup)
4. [GitHub Integration](#github-integration)
5. [SSL Certificate Setup](#ssl-certificate-setup)
6. [Deployment Steps](#deployment-steps)
7. [Post-Deployment](#post-deployment)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### 1.1 Required Accounts & Resources

- **Hostinger VPS** - KVM 4GB+ plan (recommended for production)
- **Domain Name** - Registered and pointing to Hostinger DNS
- **GitHub Repository** - Where your project code resides
- **Let’s Encrypt Account** - Free SSL (or purchased SSL certificate)

### 1.2 Project Architecture

```
Tayyibt Platform
├── Web App (Next.js)           - Port 3002 - User-facing web application
├── Admin Dashboard (Next.js)  - Port 3001 - Admin panel
├── Backend API (NestJS)      - Port 3000 - REST API + WebSocket
├── AI Service (FastAPI)       - Port 5000 - Matching algorithm
├── PostgreSQL                 - Port 5432 - Database
├── Redis                     - Port 6379 - Caching & Sessions
└── Nginx (Reverse Proxy)     - Ports 80/443 - SSL termination
```

### 1.3 Environment Variables Required

Create `.env.production` file with:

```bash
# Database
DATABASE_URL=postgresql://user:strongpassword@postgres:5432/tayyibt
DB_USER=tayyibt_user
DB_PASSWORD=your_secure_database_password
DB_NAME=tayyibt

# Redis (with password in production)
REDIS_URL=redis://:your_redis_password@redis:6379
REDIS_PASSWORD=your_redis_password

# JWT — use a long random secret in production
JWT_SECRET=your_32_character_minimum_random_secret
JWT_EXPIRES_IN=15m

# API
API_PORT=3000
NODE_ENV=production
CORS_ORIGIN=https://yourdomain.com

# Frontend URLs
NEXT_PUBLIC_API_URL=https://yourdomain.com/api/v1
NEXT_PUBLIC_WS_URL=wss://yourdomain.com

# AI Service
AI_SERVICE_URL=http://ai-service:5000

# Scoring weights (optional)
WEIGHT_RELIGIOUS=0.30
WEIGHT_LIFESTYLE=0.25
WEIGHT_INTERESTS=0.20
WEIGHT_LOCATION=0.15
WEIGHT_OTHER=0.10
```

---

## Server Preparation

### 2.1 Initial VPS Setup via hPanel

1. **Log in to Hostinger hPanel**
   - Navigate to: https://www.hostinger.com/hpanel

2. **Access VPS Management**
   - Go to VPS → Select your server → Manage

3. **Verify Docker Template**
   - Navigate to Settings → OS Template
   - Ensure "Docker" is installed
   - If not, reinstall with Docker template

4. **Get Server IP Address**
   - Copy from Overview page
   - Example: `192.168.1.100`

### 2.2 Configure Firewall

Allow required ports via hPanel or SSH:

```bash
# SSH into your VPS
ssh root@your_server_ip

# Check current firewall status
ufw status

# Allow necessary ports (if ufw is active)
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw allow 3000/tcp  # Backend (internal)
ufw allow 3001/tcp  # Admin (internal)
ufw allow 3002/tcp  # Web (internal)
ufw allow 5000/tcp  # AI Service (internal)
```

### 2.3 Install Required Software

```bash
# Update system
apt update && apt upgrade -y

# Install essential packages
apt install -y curl wget git nano certbot python3-certbot-nginx

# Verify Docker installation
docker --version
docker compose version
```

---

## Project Setup

### 3.1 Clone Repository to VPS

```bash
# Navigate to your projects directory
cd /root
mkdir -p tayyibt && cd tayyibt

# Clone your repository
git clone https://github.com/yourusername/tayyibt.git .

# Or if using SSH deploy key
git clone git@github.com:yourusername/tayyibt.git .
```

### 3.2 Configure Environment Files

```bash
# Copy example production env
cp .env.example .env.production

# Edit with your production values
nano .env.production
```

### 3.3 Update Docker Compose for Production

The `docker-compose.prod.yml` already includes:
- Nginx reverse proxy with SSL
- All backend services
- Database and Redis
- Health checks

No modifications needed if using provided template.

---

## GitHub Integration

### 4.1 Option A: Deploy Keys (Recommended for Private Repos)

```bash
# Generate SSH deploy key
ssh-keygen -t ed25519 -C "tayyibt-production" -N "" -f ~/.ssh/tayyibt-deploy

# Display public key
cat ~/.ssh/tayyibt-deploy.pub
```

1. Go to GitHub → Your Repository → Settings → Deploy Keys
2. Click "Add deploy key"
3. Title: "Production VPS"
4. Paste the public key content
5. Check "Allow write access" (if needed for auto-deploy)
6. Click "Add key"

### 4.2 Configure SSH for GitHub

```bash
# Create/edit SSH config
nano ~/.ssh/config

# Add the following:
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/tayyibt-deploy
    StrictHostKeyChecking no

# Save and exit
```

### 4.3 Option B: Using Hostinger Docker Manager

1. Navigate to VPS → Docker Manager → Projects
2. Click "Create Project"
3. Select "Compose from URL"
4. Enter your GitHub raw docker-compose URL:
   ```
   https://raw.githubusercontent.com/yourusername/tayyibt/main/docker-compose.prod.yml
   ```
5. Configure environment variables
6. Deploy

---

## SSL Certificate Setup

### 5.1 Option A: Using Let’s Encrypt (Free)

```bash
# Install certbot
apt install -y certbot python3-certbot-nginx

# Create directories for certificates
mkdir -p /root/tayyibt/certs
mkdir -p /root/tayyibt/certbot/conf
mkdir -p /root/tayyibt/certbot/www

# Stop nginx temporarily
cd /root/tayyibt
docker compose -f docker-compose.prod.yml down nginx

# Obtain certificate (replace yourdomain.com)
certbot certonly --webroot \
  --webroot-path /root/tayyibt/certbot/www \
  -d yourdomain.com \
  -d www.yourdomain.com \
  --email your-email@example.com \
  --agree-tos \
  --no-eff-email

# Note: Certificate files are in:
# /etc/letsencrypt/live/yourdomain.com/
# - fullchain.pem (certificate + CA chain)
# - privkey.pem (private key)
```

### 5.2 Option B: Manual SSL Setup

```bash
# Copy certificates to project directory
cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem /root/tayyibt/certs/
cp /etc/letsencrypt/live/yourdomain.com/privkey.pem /root/tayyibt/certs/

# Set proper permissions
chmod 600 /root/tayyibt/certs/privkey.pem
```

### 5.3 Configure Nginx SSL

Update nginx configuration in `docker/nginx/nginx.conf`:

```nginx
# The SSL configuration is already in place
# Ensure these paths match your certificate locations:
ssl_certificate     /etc/nginx/certs/fullchain.pem;
ssl_certificate_key /etc/nginx/certs/privkey.pem;
```

---

## Deployment Steps

### 6.1 Method A: Docker Compose (CLI)

```bash
# Navigate to project directory
cd /root/tayyibt

# Build and start all services
docker compose -f docker-compose.prod.yml up --build -d

# Check service status
docker compose -f docker-compose.prod.yml ps

# View logs
docker compose -f docker-compose.prod.yml logs -f
```

### 6.2 Method B: Hostinger Docker Manager

1. **Access Docker Manager**
   ```
   hPanel → VPS → Docker Manager → Projects
   ```

2. **Create New Project**
   - Click "Create Project"
   - Select deployment method:
     - **Compose manually**: Paste docker-compose.prod.yml content
     - **Compose from URL**: Provide GitHub raw file URL

3. **Configure Environment**
   - Add all variables from `.env.production`

4. **Set Restart Policy**
   - Select "always" for all services

5. **Deploy**
   - Click "Deploy" button
   - Wait 2-5 minutes for build and startup

### 6.3 Method C: VS Code Remote

1. **Install VS Code Extensions**
   - Docker
   - Remote - SSH
   - Remote Explorer

2. **Connect to VPS**
   - Open VS Code
   - F1 → "Remote-SSH: Connect to Host"
   - Enter: `root@your_server_ip`

3. **Clone and Configure**
   - Open terminal in VS Code
   - Clone repository
   - Configure environment

4. **Deploy via VS Code**
   - Right-click docker-compose.prod.yml
   - "Compose Up" or "Compose Down"

### 6.4 Verify Services

```bash
# Check all containers running
docker ps

# Expected output:
# CONTAINER ID  IMAGE           STATUS        PORTS
# xxx          tayyibt-nginx   Up            0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp
# xxx          tayyibt-web    Up            3002/tcp
# xxx          tayyibt-admin Up            3001/tcp
# xxx          tayyibt-ai    Up            5000/tcp
# xxx          tayyibt-api   Up            3000/tcp
# xxx          postgres:15  Up            5432/tcp
# xxx          redis:7      Up            6379/tcp

# Test health endpoints
curl http://localhost:3000/api/v1/health
curl http://localhost:5000/health
curl http://localhost:3002  # Should redirect
```

---

## Post-Deployment

### 7.1 Configure Domain DNS

In your domain registrar (or Hostinger DNS):

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | your_vps_ip | 14400 |
| A | www | your_vps_ip | 14400 |

### 7.2 Test Production URLs

```
# Web Application
https://yourdomain.com

# Admin Dashboard
https://yourdomain.com/admin

# Backend API
https://yourdomain.com/api/v1/health

# API Documentation (if enabled)
https://yourdomain.com/api/docs
```

### 7.3 Database Migration

```bash
# Run migrations (if required)
docker compose -f docker-compose.prod.yml exec backend npm run migration:run

# Or run seed data
docker compose -f docker-compose.prod.yml exec backend npm run seed
```

### 7.4 Set Up SSL Auto-Renewal

```bash
# Create renewal script
nano /root/renew-ssl.sh

# Add:
#!/bin/bash
certbot renew --webroot -w /root/tayyibt/certbot/www
docker exec nginx nginx -s reload

# Make executable
chmod +x /root/renew-ssl.sh

# Add to crontab (runs every day at 3am)
crontab -e

# Add line:
0 3 * * * /root/renew-ssl.sh >> /var/log/ssl-renewal.log 2>&1
```

### 7.5 Set Up Backups

```bash
# Create backup script
nano /root/backup.sh

# Add:
#!/bin/bash
BACKUP_DIR="/root/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Backup database
docker exec postgres:15 pg_dump -U tayyibt_user tayyibt > $BACKUP_DIR/db_$DATE.sql

# Compress
tar -czf $BACKUP_DIR/tayyibt_$DATE.tar.gz -C /root tayyibt/certs

# Keep only last 7 days
find $BACKUP_DIR -type f -mtime +7 -delete

# Make executable
chmod +x /root/backup.sh

# Add to crontab (runs daily at 2am)
crontab -e
0 2 * * * /root/backup.sh >> /var/log/backup.log 2>&1
```

---

## Troubleshooting

### 8.1 Container Issues

```bash
# Check logs for specific service
docker compose -f docker-compose.prod.yml logs backend
docker compose -f docker-compose.prod.yml logs web

# Restart specific service
docker compose -f docker-compose.prod.yml restart backend

# Rebuild specific service
docker compose -f docker-compose.prod.yml build --no-cache backend
docker compose -f docker-compose.prod.yml up -d backend
```

### 8.2 Database Connection Issues

```bash
# Check database health
docker exec postgres:15 pg_isready -U tayyibt_user

# Connect to database
docker exec -it postgres:15 psql -U tayyibt_user -d tayyibt

# View database logs
docker compose -f docker-compose.prod.yml logs postgres
```

### 8.3 SSL Certificate Issues

```bash
# Test certificate
curl -vI https://yourdomain.com

# Check certificate expiry
openssl s_client -connect yourdomain.com:443 -servername yourdomain.com 2>/dev/null | openssl x509 -noout -dates

# Manual renewal
certbot renew --webroot -w /root/tayyibt/certbot/www --force-renewal

# Reload nginx
docker exec nginx nginx -s reload
```

### 8.4 Common Error Solutions

| Error | Solution |
|-------|----------|
| "Connection refused" | Check service is running: `docker ps` |
| "Database connection failed" | Verify DATABASE_URL in .env.production |
| "SSL certificate error" | Run certbot manually or check file paths |
| "Port already in use" | Stop other services on ports 80/443 |
| "Build failed" | Check Docker logs for build errors |
| "Permission denied" | Check file permissions: `chmod -R` |

### 8.5 Monitoring

```bash
# Resource usage
docker stats

# Container health
docker inspect --format='{{.State.Health.Status}}' container_name

# View real-time logs
docker logs -f container_name
```

---

## Maintenance Commands

### Quick Reference

```bash
# Start all services
docker compose -f docker-compose.prod.yml up -d

# Stop all services
docker compose -f docker-compose.prod.yml down

# Restart all services
docker compose -f docker-compose.prod.yml restart

# View all logs
docker compose -f docker-compose.prod.yml logs -f

# Update and redeploy
git pull
docker compose -f docker-compose.prod.yml up --build -d

# Enter container
docker exec -it container_name /bin/sh
```

---

## Security Checklist

- [ ] Change default passwords
- [ ] Update JWT_SECRET to strong random value
- [ ] Enable firewall (uffw)
- [ ] Disable root SSH login (configure SSH keys)
- [ ] Set proper file permissions
- [ ] Enable SSL/HTTPS
- [ ] Configure automatic SSL renewal
- [ ] Set up regular backups
- [ ] Monitor container logs regularly
- [ ] Update Docker images regularly

---

## Support & Resources

- **Hostinger Support**: https://www.hostinger.com/support
- **Docker Docs**: https://docs.docker.com/
- **Let’s Encrypt**: https://letsencrypt.org/docs/
- **GitHub Actions**: https://github.com/features/actions

---

*Last updated: 2026-04-14*