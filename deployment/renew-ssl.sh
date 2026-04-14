#!/bin/bash

# SSL Certificate Renewal Script
# This script renews Let's Encrypt SSL certificates and reloads Nginx
# Add to crontab: crontab -e
# Add line: 0 3 * * * /root/tayyibt/renew-ssl.sh >> /var/log/ssl-renewal.log 2>&1

set -e

CERT_DIR="/root/tayyibt/certbot/www"
LOG_FILE="/var/log/ssl-renewal.log"
DOCKER_CONTAINER="nginx"
DOMAIN="yourdomain.com"
EMAIL="admin@yourdomain.com"

echo "$(date '+%Y-%m-%d %H:%M:%S') - Starting SSL renewal..." >> $LOG_FILE

# Run certbot renewal
certbot renew \
  --webroot \
  --webroot-path $CERT_DIR \
  --post-hook "docker exec $DOCKER_CONTAINER nginx -s reload" \
  >> $LOG_FILE 2>&1

# Alternative method without docker post-hook
if [ $? -eq 0 ]; then
    echo "$(date '+%Y-%m-%d %H:%M:%S') - Certificate renewed successfully" >> $LOG_FILE
    docker exec $DOCKER_CONTAINER nginx -s reload
    echo "$(date '+%Y-%m-%d %H:%M:%S') - Nginx reloaded" >> $LOG_FILE
else
    echo "$(date '+%Y-%m-%d %H:%M:%S') - Certificate renewal failed" >> $LOG_FILE
    exit 1
fi

echo "SSL renewal completed successfully"