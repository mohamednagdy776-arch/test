#!/bin/bash
# Deployment script for Tayyibt platform

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}🚀 Tayyibt Deployment Script${NC}"
echo "================================"

# Parse arguments
ENV=${1:-staging}
ACTION=${2:-deploy}

# Functions
log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

check_env() {
    log_info "Checking environment configuration..."
    
    if [ ! -f .env ]; then
        log_warn ".env file not found. Using .env.example as template."
        cp .env.example .env
        log_warn "Please update .env with your actual values before deploying."
    fi
}

build_docker() {
    log_info "Building Docker images..."
    
    case $ENV in
        production)
            docker-compose -f docker-compose.prod.yml build --no-cache
            ;;
        staging|*)
            docker-compose build --no-cache
            ;;
    esac
}

start_services() {
    log_info "Starting services..."
    
    case $ENV in
        production)
            docker-compose -f docker-compose.prod.yml up -d
            ;;
        staging|*)
            docker-compose up -d
            ;;
    esac
    
    log_info "Services started. Checking health..."
    sleep 10
    
    # Check services
    docker-compose ps
}

stop_services() {
    log_info "Stopping services..."
    
    case $ENV in
        production)
            docker-compose -f docker-compose.prod.yml down
            ;;
        staging|*)
            docker-compose down
            ;;
    esac
}

logs() {
    docker-compose logs -f
}

status() {
    docker-compose ps
    echo ""
    echo "Service health status:"
    curl -s http://localhost:3000/api/v1/health 2>/dev/null && echo "✅ Backend OK" || echo "❌ Backend DOWN"
}

# Main execution
case $ACTION in
    deploy)
        check_env
        build_docker
        start_services
        status
        log_info "Deployment complete! 🌟"
        ;;
    start)
        start_services
        ;;
    stop)
        stop_services
        ;;
    restart)
        stop_services
        start_services
        ;;
    logs)
        logs
        ;;
    status)
        status
        ;;
    build)
        check_env
        build_docker
        ;;
    *)
        echo "Usage: ./deploy.sh [environment] [action]"
        echo ""
        echo "Environment: staging (default), production"
        echo "Action: deploy (default), start, stop, restart, logs, status, build"
        echo ""
        echo "Examples:"
        echo "  ./deploy.sh staging deploy    # Deploy to staging"
        echo "  ./deploy.sh production start  # Start production"
        echo "  ./deploy.sh staging logs      # View staging logs"
        exit 1
        ;;
esac