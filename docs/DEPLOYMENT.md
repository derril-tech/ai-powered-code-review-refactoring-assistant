# RefactorIQ™ Production Deployment Guide

This comprehensive guide covers the production deployment of RefactorIQ™, including infrastructure setup, security hardening, monitoring, and operational procedures.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Infrastructure Setup](#infrastructure-setup)
4. [Security Configuration](#security-configuration)
5. [Deployment Process](#deployment-process)
6. [Monitoring & Observability](#monitoring--observability)
7. [Backup & Recovery](#backup--recovery)
8. [Troubleshooting](#troubleshooting)
9. [Maintenance](#maintenance)

## Overview

RefactorIQ™ is deployed using a containerized architecture with the following components:

- **Frontend**: Next.js application served by Nginx
- **Backend**: FastAPI application with Gunicorn/Uvicorn
- **Database**: PostgreSQL with optimized configuration
- **Cache**: Redis for session storage and rate limiting
- **Reverse Proxy**: Nginx with SSL termination and load balancing
- **Monitoring**: Prometheus, Grafana, and Loki stack
- **CI/CD**: GitHub Actions with automated testing and deployment

### Architecture Diagram

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Load Balancer │────│      Nginx       │────│   Frontend      │
│   (External)    │    │  (Reverse Proxy) │    │   (Next.js)     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                       ┌──────────────────┐    ┌─────────────────┐
                       │     Backend      │────│   PostgreSQL    │
                       │    (FastAPI)     │    │   (Database)    │
                       └──────────────────┘    └─────────────────┘
                                │
                       ┌──────────────────┐    ┌─────────────────┐
                       │      Redis       │    │   Monitoring    │
                       │     (Cache)      │    │   (Prometheus)  │
                       └──────────────────┘    └─────────────────┘
```

## Prerequisites

### System Requirements

**Minimum Production Requirements:**
- **CPU**: 4 cores (8 recommended)
- **RAM**: 8GB (16GB recommended)
- **Storage**: 100GB SSD (500GB recommended)
- **Network**: 1Gbps connection
- **OS**: Ubuntu 20.04+ or CentOS 8+

**Software Dependencies:**
- Docker 24.0+
- Docker Compose 2.0+
- Git 2.30+
- OpenSSL 1.1.1+
- AWS CLI 2.0+ (for S3 backups)

### Domain & SSL

1. **Domain Setup:**
   ```bash
   # Point your domain to the server IP
   your-domain.com    A    your-server-ip
   www.your-domain.com CNAME your-domain.com
   ```

2. **SSL Certificate:**
   ```bash
   # Using Let's Encrypt (recommended)
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com -d www.your-domain.com
   
   # Or use your own certificates
   cp fullchain.pem /path/to/project/nginx/ssl/
   cp privkey.pem /path/to/project/nginx/ssl/
   ```

### External Services

Configure the following external services:

1. **AWS S3** (for file storage and backups)
2. **GitHub/GitLab** (for repository integration)
3. **SMTP Service** (for email notifications)
4. **Sentry** (optional, for error tracking)
5. **Slack** (optional, for notifications)

## Infrastructure Setup

### 1. Server Preparation

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Restart session to apply group changes
exit
```

### 2. Project Setup

```bash
# Clone repository
git clone https://github.com/your-org/refactoriq.git
cd refactoriq

# Copy environment template
cp .env.production.template .env.production

# Edit environment configuration
nano .env.production
```

### 3. Environment Configuration

Edit `.env.production` with your production values:

```bash
# =============================================================================
# ENVIRONMENT
# =============================================================================
ENVIRONMENT=production
DEBUG=false
DOMAIN=your-domain.com

# =============================================================================
# SECURITY
# =============================================================================
SECRET_KEY=your-super-secret-key-64-chars-long
ENCRYPTION_KEY=your-encryption-key-32-chars-long

# =============================================================================
# DATABASE
# =============================================================================
POSTGRES_DB=refactoriq_prod
POSTGRES_USER=refactoriq_user
POSTGRES_PASSWORD=your-secure-password
DATABASE_POOL_SIZE=20

# =============================================================================
# REDIS
# =============================================================================
REDIS_URL=redis://redis:6379/0
REDIS_MAX_CONNECTIONS=50

# =============================================================================
# EXTERNAL SERVICES
# =============================================================================
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_S3_BUCKET=your-bucket-name
BACKUP_S3_BUCKET=your-backup-bucket

GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-secret
GITLAB_CLIENT_ID=your-gitlab-client-id
GITLAB_CLIENT_SECRET=your-gitlab-secret

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@domain.com
SMTP_PASSWORD=your-app-password
FROM_EMAIL=noreply@your-domain.com

SENTRY_DSN=https://your-sentry-dsn@sentry.io/project
SLACK_WEBHOOK=https://hooks.slack.com/services/your/webhook/url
```

## Security Configuration

### 1. Firewall Setup

```bash
# Configure UFW firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable
```

### 2. System Hardening

```bash
# Disable root login
sudo sed -i 's/PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
sudo systemctl restart ssh

# Set up automatic security updates
sudo apt install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades

# Configure fail2ban
sudo apt install fail2ban
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 3. Docker Security

```bash
# Create docker daemon configuration
sudo tee /etc/docker/daemon.json << EOF
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  },
  "userland-proxy": false,
  "experimental": false,
  "live-restore": true
}
EOF

sudo systemctl restart docker
```

## Deployment Process

### 1. Initial Deployment

```bash
# Make deployment script executable
chmod +x scripts/deploy.sh

# Run initial deployment
./scripts/deploy.sh --environment production
```

### 2. CI/CD Setup

The project includes GitHub Actions workflows for automated deployment:

**GitHub Secrets Configuration:**
```bash
# Required secrets in GitHub repository settings:
POSTGRES_PASSWORD
SECRET_KEY
ENCRYPTION_KEY
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
GITHUB_TOKEN (auto-generated)
```

**Workflow Triggers:**
- **Push to `main`**: Deploys to production
- **Push to `develop`**: Deploys to staging
- **Pull requests**: Runs tests and security scans

### 3. Manual Deployment

```bash
# Pull latest changes
git pull origin main

# Build and deploy
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d

# Run database migrations
docker-compose -f docker-compose.prod.yml exec backend alembic upgrade head

# Verify deployment
curl https://your-domain.com/api/v1/health/
```

### 4. Blue-Green Deployment

For zero-downtime deployments:

```bash
# Deploy with blue-green strategy
./scripts/deploy.sh --type blue-green --health-timeout 300
```

### 5. Rolling Deployment

For gradual rollouts:

```bash
# Deploy with rolling updates
./scripts/deploy.sh --type rolling
```

## Monitoring & Observability

### 1. Monitoring Stack

The deployment includes a comprehensive monitoring stack:

- **Prometheus**: Metrics collection
- **Grafana**: Visualization and alerting
- **Loki**: Log aggregation
- **Promtail**: Log shipping

### 2. Accessing Monitoring

```bash
# Grafana Dashboard
https://your-domain.com/grafana/
# Default: admin/admin (change on first login)

# Prometheus
https://your-domain.com/prometheus/
# Restricted to internal networks

# Application Metrics
https://your-domain.com/api/v1/health/metrics
```

### 3. Key Metrics

Monitor these critical metrics:

**Application Metrics:**
- Request rate and latency
- Error rate (4xx, 5xx responses)
- Active users and sessions
- Analysis completion rate
- Proposal acceptance rate

**Infrastructure Metrics:**
- CPU and memory utilization
- Disk space and I/O
- Network throughput
- Container health status
- Database connection pool

**Business Metrics:**
- Daily/monthly active users
- Code reviews completed
- Proposals generated/applied
- User registration rate

### 4. Alerting Rules

Configure alerts for:

```yaml
# High error rate
- alert: HighErrorRate
  expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
  for: 5m
  annotations:
    summary: "High error rate detected"

# High CPU usage
- alert: HighCPUUsage
  expr: cpu_usage_percent > 80
  for: 10m
  annotations:
    summary: "High CPU usage on {{ $labels.instance }}"

# Database connection issues
- alert: DatabaseConnections
  expr: postgres_connections_active / postgres_connections_max > 0.8
  for: 5m
  annotations:
    summary: "High database connection usage"
```

## Backup & Recovery

### 1. Automated Backups

The system performs automated backups:

```bash
# Configure backup schedule (crontab)
0 2 * * * /path/to/project/scripts/backup.sh >/dev/null 2>&1

# Manual backup
./scripts/backup.sh

# Test backup integrity
./scripts/backup.sh --test-only
```

### 2. Backup Components

**Database Backup:**
- Full PostgreSQL dump with compression
- Daily automated backups
- 30-day retention (configurable)
- S3 upload with encryption

**Application Data:**
- User uploads and analysis results
- Application logs
- Configuration files

### 3. Recovery Procedures

**Database Recovery:**
```bash
# Stop application
docker-compose -f docker-compose.prod.yml down

# Restore from backup
zcat /path/to/backup/refactoriq_backup_YYYYMMDD_HHMMSS.sql.gz | \
  docker exec -i refactoriq-postgres psql -U refactoriq_user -d refactoriq_prod

# Start application
docker-compose -f docker-compose.prod.yml up -d
```

**Full System Recovery:**
```bash
# Restore from S3
aws s3 sync s3://your-backup-bucket/backups/ ./backups/

# Restore database (latest backup)
latest_backup=$(ls -t backups/refactoriq_backup_*.sql.gz | head -n1)
zcat "$latest_backup" | docker exec -i refactoriq-postgres psql -U refactoriq_user -d refactoriq_prod

# Restore application data
docker run --rm -v refactoriq_app-uploads:/target -v $(pwd)/backups:/source alpine \
  tar xzf /source/refactoriq_backup_*_app_data/uploads.tar.gz -C /target
```

### 4. Disaster Recovery

**RTO (Recovery Time Objective):** < 4 hours
**RPO (Recovery Point Objective):** < 24 hours

**Recovery Steps:**
1. Provision new infrastructure
2. Restore from S3 backups
3. Update DNS records
4. Verify system functionality
5. Notify users of recovery

## Troubleshooting

### 1. Common Issues

**Service Won't Start:**
```bash
# Check container logs
docker-compose -f docker-compose.prod.yml logs backend
docker-compose -f docker-compose.prod.yml logs postgres

# Check container status
docker-compose -f docker-compose.prod.yml ps

# Restart specific service
docker-compose -f docker-compose.prod.yml restart backend
```

**Database Connection Issues:**
```bash
# Check PostgreSQL logs
docker-compose -f docker-compose.prod.yml logs postgres

# Test database connectivity
docker-compose -f docker-compose.prod.yml exec postgres pg_isready -U refactoriq_user

# Check connection pool
docker-compose -f docker-compose.prod.yml exec backend python -c "
from app.db.session import engine
print(f'Pool size: {engine.pool.size()}')
print(f'Checked out: {engine.pool.checkedout()}')
"
```

**High Memory Usage:**
```bash
# Check container memory usage
docker stats

# Analyze memory allocation
docker-compose -f docker-compose.prod.yml exec backend python -c "
import psutil
import os
process = psutil.Process(os.getpid())
print(f'Memory: {process.memory_info().rss / 1024 / 1024:.2f} MB')
"
```

### 2. Performance Issues

**Slow API Responses:**
```bash
# Check response times
curl -o /dev/null -s -w "%{time_total}\n" https://your-domain.com/api/v1/health/

# Analyze database queries
docker-compose -f docker-compose.prod.yml exec postgres psql -U refactoriq_user -d refactoriq_prod -c "
SELECT query, mean_time, calls FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;
"

# Check Redis performance
docker-compose -f docker-compose.prod.yml exec redis redis-cli --latency-history -i 1
```

**High CPU Usage:**
```bash
# Check Python profiling
docker-compose -f docker-compose.prod.yml exec backend py-spy top -p 1

# Analyze worker processes
docker-compose -f docker-compose.prod.yml exec backend ps aux
```

### 3. Debug Mode

**Enable Debug Logging:**
```bash
# Temporarily enable debug logging
docker-compose -f docker-compose.prod.yml exec backend \
  sed -i 's/LOG_LEVEL=INFO/LOG_LEVEL=DEBUG/' /app/.env

# Restart backend
docker-compose -f docker-compose.prod.yml restart backend
```

## Maintenance

### 1. Regular Maintenance Tasks

**Weekly:**
- Review monitoring dashboards
- Check error logs
- Verify backup integrity
- Update security patches

**Monthly:**
- Review and optimize database queries
- Clean up old logs and backups
- Update dependencies
- Review access logs for anomalies

**Quarterly:**
- Security audit
- Performance benchmarking
- Disaster recovery testing
- Documentation updates

### 2. Update Procedures

**Application Updates:**
```bash
# Minor updates (automatic via CI/CD)
git checkout main
git pull origin main
./scripts/deploy.sh

# Major updates (manual)
git checkout v2.0.0
./scripts/deploy.sh --no-rollback
```

**System Updates:**
```bash
# System packages
sudo apt update && sudo apt upgrade -y

# Docker updates
sudo apt update docker-ce docker-ce-cli containerd.io

# Security updates (automatic)
sudo unattended-upgrade -d
```

### 3. Scaling

**Horizontal Scaling:**
```bash
# Scale backend instances
docker-compose -f docker-compose.prod.yml up -d --scale backend=3

# Scale frontend instances  
docker-compose -f docker-compose.prod.yml up -d --scale frontend=2
```

**Vertical Scaling:**
```bash
# Update resource limits in docker-compose.prod.yml
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 4G
          cpus: '2.0'
```

### 4. Health Checks

**Automated Health Checks:**
```bash
# Application health
curl -f https://your-domain.com/api/v1/health/ || echo "Health check failed"

# Database health
docker-compose -f docker-compose.prod.yml exec postgres pg_isready -U refactoriq_user

# Redis health
docker-compose -f docker-compose.prod.yml exec redis redis-cli ping
```

**Manual System Checks:**
```bash
# Check disk space
df -h

# Check memory usage
free -h

# Check system load
uptime

# Check container status
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

## Support & Documentation

### 1. Log Locations

- **Application Logs**: `/var/log/refactoriq/`
- **Nginx Logs**: `/var/log/nginx/`
- **System Logs**: `/var/log/syslog`
- **Docker Logs**: `docker-compose logs [service]`

### 2. Configuration Files

- **Environment**: `.env.production`
- **Nginx**: `nginx/nginx.prod.conf`
- **Docker Compose**: `docker-compose.prod.yml`
- **Monitoring**: `monitoring/prometheus.yml`

### 3. Useful Commands

```bash
# View all services status
docker-compose -f docker-compose.prod.yml ps

# Follow logs for all services
docker-compose -f docker-compose.prod.yml logs -f

# Execute command in container
docker-compose -f docker-compose.prod.yml exec backend bash

# Database shell access
docker-compose -f docker-compose.prod.yml exec postgres psql -U refactoriq_user -d refactoriq_prod

# Redis CLI access
docker-compose -f docker-compose.prod.yml exec redis redis-cli

# System resource usage
docker system df
docker system prune -f
```

### 4. Emergency Contacts

- **DevOps Team**: devops@your-domain.com
- **On-call Engineer**: +1-555-0123
- **Slack Channel**: #refactoriq-alerts
- **Status Page**: https://status.your-domain.com

---

## Conclusion

This deployment guide provides comprehensive instructions for setting up and maintaining RefactorIQ™ in a production environment. For additional support or questions, please refer to the project documentation or contact the development team.

**Important Security Note**: Always follow security best practices, keep systems updated, and regularly review access logs and monitoring alerts.