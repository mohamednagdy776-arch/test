#!/bin/bash

# Service Health Check Script
# Run this to verify all services are running correctly
# Can be added to crontab for regular monitoring

set -e

PROJECT_DIR="/root/tayyibt"
cd $PROJECT_DIR

echo "=========================================="
echo "Tayyibt Health Check"
echo "=========================================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0

# Check if containers are running
echo "Checking container status..."
CONTAINERS=$(docker compose -f docker-compose.prod.yml ps -q)

if [ -z "$CONTAINERS" ]; then
    echo -e "${RED}ERROR: No containers running${NC}"
    exit 1
fi

# Check each service
SERVICES=("backend" "admin" "web" "ai-service" "postgres" "redis" "nginx")

for SERVICE in "${SERVICES[@]}"; do
    if docker compose -f docker-compose.prod.yml ps | grep -q "$SERVICE"; then
        STATUS=$(docker inspect --format='{{.State.Status}}' $SERVICE 2>/dev/null || echo "unknown")
        if [ "$STATUS" = "running" ]; then
            echo -e "${GREEN}✓${NC} $SERVICE: Running"
        else
            echo -e "${RED}✗${NC} $SERVICE: $STATUS"
            ((ERRORS++))
        fi
    else
        echo -e "${RED}✗${NC} $SERVICE: Not found"
        ((ERRORS++))
    fi
done

echo ""

# Check health endpoints
echo "Checking health endpoints..."

# Backend health
if curl -sf http://localhost:3000/api/v1/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Backend API: Healthy"
else
    echo -e "${RED}✗${NC} Backend API: Unhealthy"
    ((ERRORS++))
fi

# Web health
if curl -sf http://localhost:3002 > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Web App: Healthy"
else
    echo -e "${RED}✗${NC} Web App: Unhealthy"
    ((ERRORS++))
fi

# AI Service health
if curl -sf http://localhost:5000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} AI Service: Healthy"
else
    echo -e "${RED}✗${NC} AI Service: Unhealthy"
    ((ERRORS++))
fi

echo ""

# Check disk usage
echo "Checking disk usage..."
DISK_USAGE=$(df -h $PROJECT_DIR | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 90 ]; then
    echo -e "${RED}WARNING: Disk usage is at ${DISK_USAGE}%${NC}"
else
    echo -e "${GREEN}Disk usage: ${DISK_USAGE}%${NC}"
fi

echo ""

# Check memory usage
echo "Checking memory usage..."
MEMORY_USAGE=$(free | grep Mem | awk '{printf "%.0f", $3/$2 * 100}')
if [ $MEMORY_USAGE -gt 90 ]; then
    echo -e "${RED}WARNING: Memory usage is at ${MEMORY_USAGE}%${NC}"
else
    echo -e "${GREEN}Memory usage: ${MEMORY_USAGE}%${NC}"
fi

echo ""
echo "=========================================="

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}All checks passed!${NC}"
    exit 0
else
    echo -e "${RED}Found $ERRORS error(s)${NC}"
    exit 1
fi