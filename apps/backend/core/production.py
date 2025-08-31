"""
Production configuration for RefactorIQ backend.
This module contains production-specific settings for security, performance, and reliability.
"""

import os
import secrets
from typing import Any, Dict, List, Optional

from pydantic import BaseSettings, validator
from pydantic_settings import BaseSettings as PydanticBaseSettings

from .config import Settings


class ProductionSettings(Settings):
    """Production-specific configuration settings."""
    
    # Environment
    ENVIRONMENT: str = "production"
    DEBUG: bool = False
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", secrets.token_urlsafe(32))
    ENCRYPTION_KEY: str = os.getenv("ENCRYPTION_KEY", secrets.token_urlsafe(32))
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://user:pass@localhost/refactoriq_prod")
    DATABASE_POOL_SIZE: int = int(os.getenv("DATABASE_POOL_SIZE", "20"))
    DATABASE_MAX_OVERFLOW: int = int(os.getenv("DATABASE_MAX_OVERFLOW", "30"))
    DATABASE_POOL_TIMEOUT: int = int(os.getenv("DATABASE_POOL_TIMEOUT", "30"))
    DATABASE_POOL_RECYCLE: int = int(os.getenv("DATABASE_POOL_RECYCLE", "3600"))
    
    # Redis
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    REDIS_MAX_CONNECTIONS: int = int(os.getenv("REDIS_MAX_CONNECTIONS", "50"))
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "https://app.refactoriq.com",
        "https://www.refactoriq.com",
        "https://refactoriq.com"
    ]
    CORS_ALLOW_CREDENTIALS: bool = True
    CORS_ALLOW_METHODS: List[str] = ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"]
    CORS_ALLOW_HEADERS: List[str] = [
        "Authorization", 
        "Content-Type", 
        "X-Requested-With",
        "X-API-Key",
        "X-Client-Version"
    ]
    
    # Rate Limiting
    RATE_LIMIT_ENABLED: bool = True
    RATE_LIMIT_REQUESTS_PER_MINUTE: int = int(os.getenv("RATE_LIMIT_RPM", "100"))
    RATE_LIMIT_REQUESTS_PER_HOUR: int = int(os.getenv("RATE_LIMIT_RPH", "1000"))
    RATE_LIMIT_REQUESTS_PER_DAY: int = int(os.getenv("RATE_LIMIT_RPD", "10000"))
    
    # SSL/TLS
    FORCE_HTTPS: bool = True
    SSL_REDIRECT: bool = True
    SECURE_COOKIES: bool = True
    
    # Logging
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    LOG_FORMAT: str = "json"  # json or text
    LOG_FILE: Optional[str] = os.getenv("LOG_FILE", "/var/log/refactoriq/app.log")
    
    # Monitoring
    SENTRY_DSN: Optional[str] = os.getenv("SENTRY_DSN")
    ENABLE_METRICS: bool = True
    METRICS_PORT: int = int(os.getenv("METRICS_PORT", "9090"))
    
    # Performance
    WORKERS: int = int(os.getenv("WORKERS", "4"))
    WORKER_CONNECTIONS: int = int(os.getenv("WORKER_CONNECTIONS", "1000"))
    KEEPALIVE: int = int(os.getenv("KEEPALIVE", "2"))
    MAX_REQUESTS: int = int(os.getenv("MAX_REQUESTS", "1000"))
    MAX_REQUESTS_JITTER: int = int(os.getenv("MAX_REQUESTS_JITTER", "100"))
    
    # File Upload
    MAX_UPLOAD_SIZE: int = int(os.getenv("MAX_UPLOAD_SIZE", "100")) * 1024 * 1024  # 100MB
    UPLOAD_TEMP_DIR: str = os.getenv("UPLOAD_TEMP_DIR", "/tmp/refactoriq")
    
    # External Services
    AWS_ACCESS_KEY_ID: Optional[str] = os.getenv("AWS_ACCESS_KEY_ID")
    AWS_SECRET_ACCESS_KEY: Optional[str] = os.getenv("AWS_SECRET_ACCESS_KEY")
    AWS_DEFAULT_REGION: str = os.getenv("AWS_DEFAULT_REGION", "us-east-1")
    AWS_S3_BUCKET: str = os.getenv("AWS_S3_BUCKET", "refactoriq-uploads")
    
    # GitHub Integration
    GITHUB_CLIENT_ID: Optional[str] = os.getenv("GITHUB_CLIENT_ID")
    GITHUB_CLIENT_SECRET: Optional[str] = os.getenv("GITHUB_CLIENT_SECRET")
    GITHUB_WEBHOOK_SECRET: Optional[str] = os.getenv("GITHUB_WEBHOOK_SECRET")
    
    # GitLab Integration
    GITLAB_CLIENT_ID: Optional[str] = os.getenv("GITLAB_CLIENT_ID")
    GITLAB_CLIENT_SECRET: Optional[str] = os.getenv("GITLAB_CLIENT_SECRET")
    GITLAB_WEBHOOK_SECRET: Optional[str] = os.getenv("GITLAB_WEBHOOK_SECRET")
    
    # Email
    SMTP_HOST: str = os.getenv("SMTP_HOST", "smtp.gmail.com")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USERNAME: Optional[str] = os.getenv("SMTP_USERNAME")
    SMTP_PASSWORD: Optional[str] = os.getenv("SMTP_PASSWORD")
    SMTP_TLS: bool = os.getenv("SMTP_TLS", "true").lower() == "true"
    FROM_EMAIL: str = os.getenv("FROM_EMAIL", "noreply@refactoriq.com")
    
    # Background Jobs (ARQ)
    ARQ_REDIS_URL: str = os.getenv("ARQ_REDIS_URL", REDIS_URL)
    ARQ_JOB_TIMEOUT: int = int(os.getenv("ARQ_JOB_TIMEOUT", "3600"))  # 1 hour
    ARQ_KEEP_RESULT: int = int(os.getenv("ARQ_KEEP_RESULT", "86400"))  # 24 hours
    ARQ_MAX_JOBS: int = int(os.getenv("ARQ_MAX_JOBS", "10"))
    
    # Health Checks
    HEALTH_CHECK_ENABLED: bool = True
    HEALTH_CHECK_INTERVAL: int = int(os.getenv("HEALTH_CHECK_INTERVAL", "30"))
    
    # Backup
    BACKUP_ENABLED: bool = True
    BACKUP_S3_BUCKET: str = os.getenv("BACKUP_S3_BUCKET", "refactoriq-backups")
    BACKUP_RETENTION_DAYS: int = int(os.getenv("BACKUP_RETENTION_DAYS", "30"))
    
    # Security Headers
    SECURITY_HEADERS: Dict[str, str] = {
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "X-XSS-Protection": "1; mode=block",
        "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
        "Content-Security-Policy": (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "
            "style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data: https:; "
            "connect-src 'self' wss: https:; "
            "font-src 'self'; "
            "object-src 'none'; "
            "media-src 'self'; "
            "frame-src 'none';"
        )
    }
    
    @validator('CORS_ORIGINS', pre=True)
    def validate_cors_origins(cls, v):
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",")]
        return v
    
    @validator('DATABASE_URL')
    def validate_database_url(cls, v):
        if not v.startswith(('postgresql://', 'postgresql+asyncpg://')):
            raise ValueError("DATABASE_URL must be a PostgreSQL connection string")
        return v
    
    @validator('REDIS_URL')
    def validate_redis_url(cls, v):
        if not v.startswith('redis://'):
            raise ValueError("REDIS_URL must be a Redis connection string")
        return v
    
    class Config:
        env_file = ".env.production"
        case_sensitive = True


# Gunicorn configuration for production
class GunicornConfig:
    """Gunicorn production configuration."""
    
    bind = f"0.0.0.0:{os.getenv('PORT', '8000')}"
    workers = int(os.getenv('WORKERS', '4'))
    worker_class = "uvicorn.workers.UvicornWorker"
    worker_connections = int(os.getenv('WORKER_CONNECTIONS', '1000'))
    keepalive = int(os.getenv('KEEPALIVE', '2'))
    max_requests = int(os.getenv('MAX_REQUESTS', '1000'))
    max_requests_jitter = int(os.getenv('MAX_REQUESTS_JITTER', '100'))
    timeout = int(os.getenv('TIMEOUT', '30'))
    graceful_timeout = int(os.getenv('GRACEFUL_TIMEOUT', '30'))
    
    # Logging
    accesslog = "-"
    errorlog = "-"
    loglevel = os.getenv('LOG_LEVEL', 'info').lower()
    access_log_format = (
        '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s '
        '"%(f)s" "%(a)s" %(D)s'
    )
    
    # Security
    limit_request_line = int(os.getenv('LIMIT_REQUEST_LINE', '8192'))
    limit_request_fields = int(os.getenv('LIMIT_REQUEST_FIELDS', '100'))
    limit_request_field_size = int(os.getenv('LIMIT_REQUEST_FIELD_SIZE', '8190'))
    
    # Performance
    preload_app = True
    max_requests_per_child = int(os.getenv('MAX_REQUESTS_PER_CHILD', '1000'))
    
    def when_ready(server):
        """Called when the server is started."""
        server.log.info("RefactorIQ backend server is ready. Listening on %s", server.address)
    
    def worker_int(worker):
        """Called when a worker receives the INT or QUIT signal."""
        worker.log.info("Worker received INT, shutting down gracefully")
    
    def pre_fork(server, worker):
        """Called before forking a worker."""
        server.log.info("Worker spawned (pid: %s)", worker.pid)
    
    def post_fork(server, worker):
        """Called after forking a worker."""
        server.log.info("Worker spawned (pid: %s)", worker.pid)
    
    def worker_abort(worker):
        """Called when a worker receives the SIGABRT signal."""
        worker.log.info("Worker aborted (pid: %s)", worker.pid)


# Create production settings instance
production_settings = ProductionSettings()