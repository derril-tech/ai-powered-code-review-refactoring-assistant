from pydantic_settings import BaseSettings
from typing import List, Optional
import os

class Settings(BaseSettings):
    # Application
    APP_NAME: str = "AI-Powered Code Review Assistant"
    VERSION: str = "1.0.0"
    DEBUG: bool = False
    ENVIRONMENT: str = "development"
    
    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    ALLOWED_HOSTS: List[str] = ["*"]
    
    # Database
    DATABASE_URL: str = "postgresql+asyncpg://user:password@localhost/code_review_db"
    DATABASE_ECHO: bool = False
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379"
    REDIS_DB: int = 0
    
    # Security
    SECRET_KEY: str = "your-secret-key-here"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Rate Limiting
    RATE_LIMIT_GLOBAL: str = "100/minute"
    RATE_LIMIT_LOGIN: str = "5/minute"
    RATE_LIMIT_ANALYSIS: str = "10/hour"
    
    # AI Services
    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4"
    OPENAI_MAX_TOKENS: int = 4000
    OPENAI_TEMPERATURE: float = 0.1
    
    ANTHROPIC_API_KEY: str = ""
    ANTHROPIC_MODEL: str = "claude-3-sonnet-20240229"
    ANTHROPIC_MAX_TOKENS: int = 4000
    
    # Vector Database
    VECTOR_DIMENSION: int = 1536  # OpenAI embedding dimension
    
    # File Storage
    STORAGE_TYPE: str = "s3"  # s3, local
    S3_ACCESS_KEY_ID: str = ""
    S3_SECRET_ACCESS_KEY: str = ""
    S3_BUCKET_NAME: str = "code-review-assistant"
    S3_REGION: str = "us-east-1"
    S3_ENDPOINT_URL: Optional[str] = None
    
    # Email
    EMAIL_BACKEND: str = "smtp"  # smtp, postmark, sendgrid, resend
    SMTP_HOST: str = "localhost"
    SMTP_PORT: int = 587
    SMTP_USERNAME: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_TLS: bool = True
    
    POSTMARK_API_KEY: str = ""
    SENDGRID_API_KEY: str = ""
    RESEND_API_KEY: str = ""
    
    # GitHub/GitLab Integration
    GITHUB_CLIENT_ID: str = ""
    GITHUB_CLIENT_SECRET: str = ""
    GITHUB_WEBHOOK_SECRET: str = ""
    
    GITLAB_CLIENT_ID: str = ""
    GITLAB_CLIENT_SECRET: str = ""
    GITLAB_WEBHOOK_SECRET: str = ""
    
    # Analysis Settings
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10MB
    SUPPORTED_LANGUAGES: List[str] = [
        "python", "javascript", "typescript", "java", "csharp", 
        "go", "rust", "php", "ruby", "swift", "kotlin", "scala"
    ]
    
    # Job Queue
    ARQ_REDIS_URL: str = "redis://localhost:6379/1"
    ARQ_WORKER_CONCURRENCY: int = 10
    ARQ_JOB_TIMEOUT: int = 300  # 5 minutes
    ARQ_KEEP_RESULT: int = 86400  # Keep job results for 1 day
    
    # Webhook Security
    WEBHOOK_RATE_LIMIT_PER_HOUR: int = 60  # Per repository
    WEBHOOK_MAX_PAYLOAD_SIZE: int = 1024 * 1024  # 1MB
    
    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "{time:YYYY-MM-DD HH:mm:ss} | {level} | {name}:{function}:{line} | {message}"
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
