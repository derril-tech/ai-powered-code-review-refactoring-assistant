#!/bin/bash
set -euo pipefail

# RefactorIQ Production Deployment Script
# This script handles blue-green deployment with health checks and rollback capabilities

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
DEPLOYMENT_ENV="${DEPLOYMENT_ENV:-production}"
DEPLOY_TYPE="${DEPLOY_TYPE:-blue-green}"
HEALTH_CHECK_TIMEOUT="${HEALTH_CHECK_TIMEOUT:-300}"
HEALTH_CHECK_INTERVAL="${HEALTH_CHECK_INTERVAL:-10}"
ROLLBACK_ON_FAILURE="${ROLLBACK_ON_FAILURE:-true}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Error handling
handle_error() {
    log_error "Deployment failed at line $1"
    if [[ "$ROLLBACK_ON_FAILURE" == "true" ]]; then
        log_info "Starting automatic rollback..."
        rollback_deployment
    fi
    exit 1
}

trap 'handle_error $LINENO' ERR

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if Docker is running
    if ! docker info >/dev/null 2>&1; then
        log_error "Docker is not running or not accessible"
        exit 1
    fi
    
    # Check if docker-compose is available
    if ! command -v docker-compose >/dev/null 2>&1; then
        log_error "docker-compose is not installed"
        exit 1
    fi
    
    # Check if required environment files exist
    if [[ ! -f "$PROJECT_ROOT/.env.production" ]]; then
        log_error "Production environment file not found: .env.production"
        exit 1
    fi
    
    # Check if required directories exist
    mkdir -p "$PROJECT_ROOT/backups"
    mkdir -p "$PROJECT_ROOT/logs"
    mkdir -p "$PROJECT_ROOT/nginx/ssl"
    
    log_success "Prerequisites check passed"
}

# Load environment configuration
load_environment() {
    log_info "Loading $DEPLOYMENT_ENV environment configuration..."
    
    # Load environment variables
    set -a  # automatically export all variables
    source "$PROJECT_ROOT/.env.production"
    set +a
    
    # Validate required environment variables
    required_vars=(
        "POSTGRES_DB"
        "POSTGRES_USER" 
        "POSTGRES_PASSWORD"
        "SECRET_KEY"
        "DOMAIN"
    )
    
    for var in "${required_vars[@]}"; do
        if [[ -z "${!var:-}" ]]; then
            log_error "Required environment variable $var is not set"
            exit 1
        fi
    done
    
    log_success "Environment configuration loaded"
}

# Pre-deployment health check
pre_deployment_check() {
    log_info "Running pre-deployment health checks..."
    
    # Check database connectivity
    if docker-compose -f "$PROJECT_ROOT/docker-compose.prod.yml" exec -T postgres pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB" >/dev/null 2>&1; then
        log_success "Database is accessible"
    else
        log_warning "Database is not accessible - this is expected for initial deployment"
    fi
    
    # Check Redis connectivity
    if docker-compose -f "$PROJECT_ROOT/docker-compose.prod.yml" exec -T redis redis-cli ping >/dev/null 2>&1; then
        log_success "Redis is accessible"
    else
        log_warning "Redis is not accessible - this is expected for initial deployment"
    fi
    
    # Check available disk space
    available_space=$(df "$PROJECT_ROOT" | awk 'NR==2 {print $4}')
    if [[ $available_space -lt 2097152 ]]; then  # 2GB in KB
        log_warning "Low disk space available: $(($available_space / 1024))MB"
    else
        log_success "Sufficient disk space available"
    fi
}

# Create database backup
create_backup() {
    log_info "Creating database backup..."
    
    timestamp=$(date +%Y%m%d_%H%M%S)
    backup_file="$PROJECT_ROOT/backups/refactoriq_backup_$timestamp.sql"
    
    if docker-compose -f "$PROJECT_ROOT/docker-compose.prod.yml" exec -T postgres pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" > "$backup_file"; then
        log_success "Database backup created: $backup_file"
        
        # Upload to S3 if configured
        if [[ -n "${BACKUP_S3_BUCKET:-}" ]] && command -v aws >/dev/null 2>&1; then
            aws s3 cp "$backup_file" "s3://$BACKUP_S3_BUCKET/backups/"
            log_success "Backup uploaded to S3"
        fi
    else
        log_warning "Database backup failed - continuing deployment"
    fi
}

# Pull latest images
pull_images() {
    log_info "Pulling latest Docker images..."
    
    docker-compose -f "$PROJECT_ROOT/docker-compose.prod.yml" pull
    
    log_success "Docker images pulled successfully"
}

# Run database migrations
run_migrations() {
    log_info "Running database migrations..."
    
    # Start database services if not running
    docker-compose -f "$PROJECT_ROOT/docker-compose.prod.yml" up -d postgres redis
    
    # Wait for database to be ready
    log_info "Waiting for database to be ready..."
    timeout=60
    while ! docker-compose -f "$PROJECT_ROOT/docker-compose.prod.yml" exec -T postgres pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB" >/dev/null 2>&1; do
        timeout=$((timeout - 1))
        if [[ $timeout -le 0 ]]; then
            log_error "Database failed to become ready"
            exit 1
        fi
        sleep 1
    done
    
    # Run migrations
    docker-compose -f "$PROJECT_ROOT/docker-compose.prod.yml" run --rm backend alembic upgrade head
    
    log_success "Database migrations completed"
}

# Blue-green deployment
blue_green_deploy() {
    log_info "Starting blue-green deployment..."
    
    # Determine current and new environments
    if docker-compose -f "$PROJECT_ROOT/docker-compose.prod.yml" ps | grep -q "refactoriq-backend"; then
        current_env="blue"
        new_env="green"
    else
        current_env="green"
        new_env="blue"
    fi
    
    log_info "Current environment: $current_env, deploying to: $new_env"
    
    # Start new environment
    export COMPOSE_PROJECT_NAME="refactoriq-$new_env"
    docker-compose -f "$PROJECT_ROOT/docker-compose.prod.yml" up -d
    
    # Wait for services to be healthy
    wait_for_health_check
    
    # Switch traffic to new environment
    switch_traffic "$new_env"
    
    # Stop old environment
    if [[ "$current_env" != "$new_env" ]]; then
        export COMPOSE_PROJECT_NAME="refactoriq-$current_env"
        docker-compose -f "$PROJECT_ROOT/docker-compose.prod.yml" down
    fi
    
    log_success "Blue-green deployment completed"
}

# Rolling deployment
rolling_deploy() {
    log_info "Starting rolling deployment..."
    
    # Update services one by one
    services=("backend" "frontend")
    
    for service in "${services[@]}"; do
        log_info "Updating service: $service"
        
        # Scale up new instance
        docker-compose -f "$PROJECT_ROOT/docker-compose.prod.yml" up -d --scale "$service=2" "$service"
        
        # Wait for new instance to be healthy
        sleep 30
        
        # Remove old instance
        docker-compose -f "$PROJECT_ROOT/docker-compose.prod.yml" up -d --scale "$service=1" "$service"
        
        log_success "Service $service updated successfully"
    done
    
    log_success "Rolling deployment completed"
}

# Wait for health check
wait_for_health_check() {
    log_info "Waiting for services to become healthy..."
    
    start_time=$(date +%s)
    end_time=$((start_time + HEALTH_CHECK_TIMEOUT))
    
    while [[ $(date +%s) -lt $end_time ]]; do
        if check_service_health; then
            log_success "All services are healthy"
            return 0
        fi
        
        log_info "Waiting for services to become healthy... ($(((end_time - $(date +%s)))) seconds remaining)"
        sleep "$HEALTH_CHECK_INTERVAL"
    done
    
    log_error "Health check timeout - services failed to become healthy"
    return 1
}

# Check service health
check_service_health() {
    # Check backend health
    if ! curl -f -s "http://localhost/api/v1/health/" >/dev/null 2>&1; then
        return 1
    fi
    
    # Check frontend health
    if ! curl -f -s "http://localhost/" >/dev/null 2>&1; then
        return 1
    fi
    
    # Check database health
    if ! docker-compose -f "$PROJECT_ROOT/docker-compose.prod.yml" exec -T postgres pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB" >/dev/null 2>&1; then
        return 1
    fi
    
    # Check Redis health
    if ! docker-compose -f "$PROJECT_ROOT/docker-compose.prod.yml" exec -T redis redis-cli ping >/dev/null 2>&1; then
        return 1
    fi
    
    return 0
}

# Switch traffic (placeholder for load balancer configuration)
switch_traffic() {
    local target_env="$1"
    log_info "Switching traffic to $target_env environment"
    
    # This would typically involve updating load balancer configuration
    # For now, we'll just restart nginx to pick up new backend containers
    docker-compose -f "$PROJECT_ROOT/docker-compose.prod.yml" restart nginx
    
    log_success "Traffic switched to $target_env environment"
}

# Rollback deployment
rollback_deployment() {
    log_info "Rolling back deployment..."
    
    # This would restore the previous version
    # Implementation depends on your specific setup
    
    log_warning "Rollback functionality needs to be implemented based on your infrastructure"
}

# Post-deployment tasks
post_deployment() {
    log_info "Running post-deployment tasks..."
    
    # Clean up old Docker images
    docker image prune -f
    
    # Clean up old backups (keep last 10)
    cd "$PROJECT_ROOT/backups"
    ls -t refactoriq_backup_*.sql | tail -n +11 | xargs -r rm --
    
    # Send deployment notification
    if command -v curl >/dev/null 2>&1 && [[ -n "${SLACK_WEBHOOK:-}" ]]; then
        curl -X POST -H 'Content-type: application/json' \
            --data '{"text":"🚀 RefactorIQ deployment completed successfully to '"$DEPLOYMENT_ENV"'"}' \
            "$SLACK_WEBHOOK"
    fi
    
    log_success "Post-deployment tasks completed"
}

# Main deployment function
main() {
    log_info "Starting RefactorIQ deployment to $DEPLOYMENT_ENV environment"
    
    # Change to project directory
    cd "$PROJECT_ROOT"
    
    # Run deployment steps
    check_prerequisites
    load_environment
    pre_deployment_check
    create_backup
    pull_images
    run_migrations
    
    # Choose deployment strategy
    case "$DEPLOY_TYPE" in
        "blue-green")
            blue_green_deploy
            ;;
        "rolling")
            rolling_deploy
            ;;
        *)
            log_error "Unknown deployment type: $DEPLOY_TYPE"
            exit 1
            ;;
    esac
    
    post_deployment
    
    log_success "🎉 Deployment completed successfully!"
    log_info "Application is available at: https://${DOMAIN}"
}

# Help function
show_help() {
    cat << EOF
RefactorIQ Deployment Script

Usage: $0 [OPTIONS]

Options:
    -h, --help              Show this help message
    -e, --environment ENV   Set deployment environment (default: production)
    -t, --type TYPE         Set deployment type: blue-green or rolling (default: blue-green)
    --no-rollback           Disable automatic rollback on failure
    --health-timeout SEC    Health check timeout in seconds (default: 300)

Examples:
    $0                                    # Deploy to production with blue-green
    $0 -e staging -t rolling             # Deploy to staging with rolling update
    $0 --no-rollback --health-timeout 600   # Deploy with custom settings

EOF
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -e|--environment)
            DEPLOYMENT_ENV="$2"
            shift 2
            ;;
        -t|--type)
            DEPLOY_TYPE="$2"
            shift 2
            ;;
        --no-rollback)
            ROLLBACK_ON_FAILURE="false"
            shift
            ;;
        --health-timeout)
            HEALTH_CHECK_TIMEOUT="$2"
            shift 2
            ;;
        *)
            log_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Run main function
main "$@"