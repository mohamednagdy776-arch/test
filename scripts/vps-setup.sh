#!/bin/bash
# scripts/vps-setup.sh
# One-time setup for a fresh Ubuntu/Debian VPS.
# Run as root: bash scripts/vps-setup.sh
#
# This installs: Docker, Docker Compose v2, git, ufw firewall rules.

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() { echo -e "${GREEN}[setup]${NC} $1"; }
warn() { echo -e "${YELLOW}[warn]${NC} $1"; }

log "Updating system packages..."
apt-get update -qq
apt-get upgrade -y -qq

log "Installing prerequisites..."
apt-get install -y -qq \
  curl \
  git \
  ca-certificates \
  gnupg \
  lsb-release \
  ufw \
  htop \
  unzip

# --- Docker ---
if command -v docker &>/dev/null; then
  warn "Docker already installed: $(docker --version)"
else
  log "Installing Docker..."
  curl -fsSL https://get.docker.com | sh
  systemctl enable docker
  systemctl start docker
  log "Docker installed: $(docker --version)"
fi

# --- Docker Compose v2 ---
if docker compose version &>/dev/null; then
  warn "Docker Compose already installed: $(docker compose version)"
else
  log "Installing Docker Compose v2 plugin..."
  apt-get install -y -qq docker-compose-plugin
  log "Docker Compose: $(docker compose version)"
fi

# --- Firewall ---
log "Configuring UFW firewall..."
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
log "Firewall status:"
ufw status

# --- App directory ---
APP_DIR="/opt/tayyibt"
log "Creating app directory at $APP_DIR..."
mkdir -p "$APP_DIR"

log ""
log "=============================="
log " VPS setup complete!"
log "=============================="
log " Next steps:"
log "  1. Upload project: run scripts/deploy-vps.sh from your local machine"
log "  2. Edit /opt/tayyibt/.env.production with real secrets"
log "  3. docker compose -f /opt/tayyibt/docker-compose.vps.yml --env-file /opt/tayyibt/.env.production up -d --build"
