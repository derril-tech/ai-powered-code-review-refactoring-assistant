#!/bin/bash
set -euo pipefail

# RefactorIQ Database Backup Script
# Automated backup with retention policy and S3 upload

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
BACKUP_DIR="${BACKUP_DIR:-$PROJECT_ROOT/backups}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-30}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="refactoriq_backup_$TIMESTAMP"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

# Create backup directory
create_backup_directory() {
    if [[ ! -d "$BACKUP_DIR" ]]; then
        mkdir -p "$BACKUP_DIR"
        log_info "Created backup directory: $BACKUP_DIR"
    fi
}

# Check database connectivity
check_database() {
    log_info "Checking database connectivity..."
    
    if ! docker exec refactoriq-postgres pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB" >/dev/null 2>&1; then
        log_error "Database is not accessible"
        exit 1
    fi
    
    log_success "Database is accessible"
}

# Create database backup
create_database_backup() {
    log_info "Starting database backup..."
    
    local sql_file="$BACKUP_DIR/${BACKUP_NAME}.sql"
    local compressed_file="$BACKUP_DIR/${BACKUP_NAME}.sql.gz"
    
    # Create SQL dump
    if docker exec refactoriq-postgres pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" --verbose --clean --no-owner --no-privileges > "$sql_file"; then
        log_success "Database dump created: $sql_file"
        
        # Compress the backup
        if gzip "$sql_file"; then
            log_success "Backup compressed: $compressed_file"
            echo "$compressed_file"
        else
            log_warning "Failed to compress backup, keeping uncompressed version"
            echo "$sql_file"
        fi
    else
        log_error "Failed to create database dump"
        exit 1
    fi
}

# Create application data backup
create_app_data_backup() {
    log_info "Creating application data backup..."
    
    local app_data_dir="$BACKUP_DIR/${BACKUP_NAME}_app_data"
    mkdir -p "$app_data_dir"
    
    # Backup uploaded files if they exist
    if docker volume inspect refactoriq_app-uploads >/dev/null 2>&1; then
        docker run --rm \
            -v refactoriq_app-uploads:/source:ro \
            -v "$app_data_dir":/backup \
            alpine tar czf /backup/uploads.tar.gz -C /source .
        log_success "Application uploads backed up"
    fi
    
    # Backup logs
    if docker volume inspect refactoriq_app-logs >/dev/null 2>&1; then
        docker run --rm \
            -v refactoriq_app-logs:/source:ro \
            -v "$app_data_dir":/backup \
            alpine tar czf /backup/logs.tar.gz -C /source .
        log_success "Application logs backed up"
    fi
    
    # Create metadata file
    cat > "$app_data_dir/metadata.json" << EOF
{
    "backup_timestamp": "$TIMESTAMP",
    "database_name": "$POSTGRES_DB",
    "created_by": "$(whoami)",
    "hostname": "$(hostname)",
    "docker_compose_version": "$(docker-compose --version)",
    "backup_type": "full"
}
EOF
    
    log_success "Application data backup completed: $app_data_dir"
}

# Upload to S3
upload_to_s3() {
    local backup_file="$1"
    
    if [[ -z "${BACKUP_S3_BUCKET:-}" ]]; then
        log_info "S3 backup not configured, skipping upload"
        return 0
    fi
    
    if ! command -v aws >/dev/null 2>&1; then
        log_warning "AWS CLI not found, skipping S3 upload"
        return 0
    fi
    
    log_info "Uploading backup to S3..."
    
    local s3_key="backups/$(basename "$backup_file")"
    
    if aws s3 cp "$backup_file" "s3://$BACKUP_S3_BUCKET/$s3_key" --storage-class STANDARD_IA; then
        log_success "Backup uploaded to S3: s3://$BACKUP_S3_BUCKET/$s3_key"
        
        # Add lifecycle policy tags
        aws s3api put-object-tagging \
            --bucket "$BACKUP_S3_BUCKET" \
            --key "$s3_key" \
            --tagging 'TagSet=[{Key=Environment,Value=production},{Key=Application,Value=refactoriq},{Key=BackupType,Value=database}]'
        
        # Verify upload
        if aws s3 ls "s3://$BACKUP_S3_BUCKET/$s3_key" >/dev/null; then
            log_success "S3 upload verified successfully"
        else
            log_error "S3 upload verification failed"
            return 1
        fi
    else
        log_error "Failed to upload backup to S3"
        return 1
    fi
}

# Clean up old backups
cleanup_old_backups() {
    log_info "Cleaning up old backups (retention: $RETENTION_DAYS days)..."
    
    # Clean up local backups
    find "$BACKUP_DIR" -name "refactoriq_backup_*.sql*" -mtime +$RETENTION_DAYS -delete
    find "$BACKUP_DIR" -name "refactoriq_backup_*_app_data" -mtime +$RETENTION_DAYS -exec rm -rf {} +
    
    local deleted_count=$(find "$BACKUP_DIR" -name "refactoriq_backup_*" -mtime +$RETENTION_DAYS | wc -l)
    if [[ $deleted_count -gt 0 ]]; then
        log_success "Deleted $deleted_count old local backups"
    fi
    
    # Clean up S3 backups if configured
    if [[ -n "${BACKUP_S3_BUCKET:-}" ]] && command -v aws >/dev/null 2>&1; then
        local cutoff_date=$(date -d "$RETENTION_DAYS days ago" +%Y-%m-%d)
        
        # List old backups
        local old_backups=$(aws s3api list-objects-v2 \
            --bucket "$BACKUP_S3_BUCKET" \
            --prefix "backups/refactoriq_backup_" \
            --query "Contents[?LastModified<='$cutoff_date'].Key" \
            --output text)
        
        if [[ -n "$old_backups" ]]; then
            echo "$old_backups" | while read -r key; do
                if [[ -n "$key" && "$key" != "None" ]]; then
                    aws s3 rm "s3://$BACKUP_S3_BUCKET/$key"
                    log_info "Deleted old S3 backup: $key"
                fi
            done
            log_success "Cleaned up old S3 backups"
        fi
    fi
}

# Test backup integrity
test_backup_integrity() {
    local backup_file="$1"
    
    log_info "Testing backup integrity..."
    
    if [[ "$backup_file" == *.gz ]]; then
        if zcat "$backup_file" | head -n 1 | grep -q "PostgreSQL database dump"; then
            log_success "Backup integrity test passed"
        else
            log_error "Backup integrity test failed"
            return 1
        fi
    else
        if head -n 1 "$backup_file" | grep -q "PostgreSQL database dump"; then
            log_success "Backup integrity test passed"
        else
            log_error "Backup integrity test failed"
            return 1
        fi
    fi
}

# Send notification
send_notification() {
    local status="$1"
    local backup_file="$2"
    local backup_size=$(du -h "$backup_file" | cut -f1)
    
    # Slack notification
    if [[ -n "${SLACK_WEBHOOK:-}" ]] && command -v curl >/dev/null 2>&1; then
        local color="good"
        local emoji="✅"
        
        if [[ "$status" != "success" ]]; then
            color="danger"
            emoji="❌"
        fi
        
        local message="$emoji RefactorIQ Database Backup $status\n"
        message+="• Timestamp: $TIMESTAMP\n"
        message+="• Backup Size: $backup_size\n"
        message+="• File: $(basename "$backup_file")"
        
        if [[ -n "${BACKUP_S3_BUCKET:-}" ]]; then
            message+"\n• S3 Location: s3://$BACKUP_S3_BUCKET/backups/$(basename "$backup_file")"
        fi
        
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"attachments\":[{\"color\":\"$color\",\"text\":\"$message\"}]}" \
            "$SLACK_WEBHOOK" >/dev/null 2>&1 || log_warning "Failed to send Slack notification"
    fi
    
    # Email notification (if configured)
    if [[ -n "${BACKUP_EMAIL:-}" ]] && command -v mail >/dev/null 2>&1; then
        local subject="RefactorIQ Backup $status - $TIMESTAMP"
        local body="Backup completed with status: $status
        
Backup Details:
- Timestamp: $TIMESTAMP
- File: $backup_file
- Size: $backup_size
- Retention: $RETENTION_DAYS days"

        if [[ -n "${BACKUP_S3_BUCKET:-}" ]]; then
            body+="\n- S3 Location: s3://$BACKUP_S3_BUCKET/backups/$(basename "$backup_file")"
        fi
        
        echo "$body" | mail -s "$subject" "$BACKUP_EMAIL" || log_warning "Failed to send email notification"
    fi
}

# Error handling
handle_error() {
    log_error "Backup failed at line $1"
    send_notification "failed" ""
    exit 1
}

trap 'handle_error $LINENO' ERR

# Main backup function
main() {
    log_info "Starting RefactorIQ backup process..."
    
    # Load environment variables if available
    if [[ -f "$PROJECT_ROOT/.env.production" ]]; then
        set -a
        source "$PROJECT_ROOT/.env.production"
        set +a
    fi
    
    # Validate required environment variables
    if [[ -z "${POSTGRES_DB:-}" ]] || [[ -z "${POSTGRES_USER:-}" ]]; then
        log_error "Required environment variables POSTGRES_DB and POSTGRES_USER are not set"
        exit 1
    fi
    
    create_backup_directory
    check_database
    
    # Create database backup
    backup_file=$(create_database_backup)
    
    # Test backup integrity
    test_backup_integrity "$backup_file"
    
    # Create application data backup
    create_app_data_backup
    
    # Upload to S3
    upload_to_s3 "$backup_file"
    
    # Cleanup old backups
    cleanup_old_backups
    
    # Send success notification
    send_notification "success" "$backup_file"
    
    log_success "Backup process completed successfully!"
    log_info "Backup location: $backup_file"
    
    if [[ -n "${BACKUP_S3_BUCKET:-}" ]]; then
        log_info "S3 backup: s3://$BACKUP_S3_BUCKET/backups/$(basename "$backup_file")"
    fi
}

# Help function
show_help() {
    cat << EOF
RefactorIQ Backup Script

Usage: $0 [OPTIONS]

Options:
    -h, --help              Show this help message
    -d, --retention-days N  Set backup retention in days (default: 30)
    --no-s3                 Skip S3 upload even if configured
    --test-only             Test database connectivity without creating backup

Environment Variables:
    POSTGRES_DB             Database name
    POSTGRES_USER           Database user
    POSTGRES_PASSWORD       Database password
    BACKUP_S3_BUCKET        S3 bucket for backup storage
    BACKUP_RETENTION_DAYS   Backup retention in days
    SLACK_WEBHOOK           Slack webhook URL for notifications
    BACKUP_EMAIL            Email address for notifications

Examples:
    $0                      # Create backup with default settings
    $0 -d 7                 # Keep backups for 7 days
    $0 --test-only          # Test database connectivity

EOF
}

# Parse command line arguments
SKIP_S3=false
TEST_ONLY=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -d|--retention-days)
            RETENTION_DAYS="$2"
            shift 2
            ;;
        --no-s3)
            SKIP_S3=true
            shift
            ;;
        --test-only)
            TEST_ONLY=true
            shift
            ;;
        *)
            log_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Run test only if requested
if [[ "$TEST_ONLY" == "true" ]]; then
    if [[ -f "$PROJECT_ROOT/.env.production" ]]; then
        set -a
        source "$PROJECT_ROOT/.env.production"
        set +a
    fi
    
    check_database
    log_success "Database connectivity test passed"
    exit 0
fi

# Skip S3 upload if requested
if [[ "$SKIP_S3" == "true" ]]; then
    unset BACKUP_S3_BUCKET
fi

# Run main function
main "$@"