#!/bin/bash

# Tayyibt Production Setup Script
# Run this on a fresh VPS to set up the environment
# Usage: sudo bash setup-scripts.sh

set -e

echo "=========================================="
echo "Tayyibt Production Setup"
echo "=========================================="

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo "Please run as root"
  exit 1
fi

# Update system
echo "[1/8] Updating system..."
apt update && apt upgrade -y

# Install essential packages
echo "[2/8] Installing essential packages..."
apt install -y curl wget git nano certbot python3-certbot-nginx ufw

# Check Docker installation
if ! command -v docker &> /dev/null; then
    echo "[3/8] Installing Docker..."
    curl -fsSL https://get.docker.com | bash
    systemctl start docker
    systemctl enable docker
else
    echo "[3/8] Docker already installed"
fi

# Create project directory
echo "[4/8] Creating project directory..."
mkdir -p /root/tayyibt
cd /root/tayyibt

# Create required directories
echo "[5/8] Creating certificate directories..."
mkdir -p certs
mkdir -p certbot/conf
mkdir -p certbot/www

# Configure firewall
echo "[6/8] Configuring firewall..."
ufw --force enable
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS

# Clone repository (optional - can be done manually)
echo "[7/8] Repository setup..."
echo "Cloning from GitHub..."
git clone https://github.com/yourusername/tayyibt.git . || echo "Repository will be cloned manually"

# Create environment file
echo "[8/8] Creating environment configuration..."
if [ ! -f .env.production ]; then
    cp .env.example .env.production
    echo "Please edit .env.production with your production values"
fi

echo "=========================================="
echo "Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Edit .env.production with your values"
echo "2. Configure SSL certificates"
echo "3. Run: docker compose -f docker-compose.prod.yml up --build -d"
echo ""