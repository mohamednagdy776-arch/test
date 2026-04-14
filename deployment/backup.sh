#!/bin/bash

# Database and Configuration Backup Script
# Add to crontab: crontab -e
# Add line: 0 2 * * * /root/tayyibt/backup.sh >> /var/log/backup.log 2>&1

set -e

BACKUP_DIR="/root/backups"
DATE=$(date +%Y%m%d_%H%M%S)
PROJECT_DIR="/root/tayyibt"
DB_CONTAINER="postgres"
DB_NAME="tayyibt"
DB_USER="tayyibt_user"

# Create backup directory
mkdir -p $BACKUP_DIR

echo "Starting backup: $DATE"

# Backup PostgreSQL database
echo "Backing up database..."
docker exec $DB_CONTAINER pg_dump -U $DB_USER $DB_NAME > $BACKUP_DIR/db_$DATE.sql

# Compress database backup
 gzip $BACKUP_DIR/db_$DATE.sql

# Backup SSL certificates (important!)
echo "Backing up SSL certificates..."
tar -czf $BACKUP_DIR/ssl_certs_$DATE.tar.gz -C $PROJECT_DIR certs/

# Backup environment files (without secrets comment)
echo "Backing up configuration..."
cp $PROJECT_DIR/.env.production $BACKUP_DIR/env_$DATE.backup

# Clean up old backups (keep last 7 days)
echo "Cleaning up old backups..."
find $BACKUP_DIR -type f -mtime +7 -delete

echo "Backup completed: $DATE"
echo "Backup files:"
ls -lh $BACKUP_DIR/*$DATE*