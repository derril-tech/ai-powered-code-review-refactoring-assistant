# Backend Environment Setup

Create `apps/backend/.env` file with these values:

```bash
# Database Configuration
DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/code_review_db
REDIS_URL=redis://localhost:6379
ARQ_REDIS_URL=redis://localhost:6379/1

# Security (CHANGE THESE!)
SECRET_KEY=your-super-secret-key-change-this-in-production-make-it-long-and-random
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# AI Services (REQUIRED for real data testing)
OPENAI_API_KEY=sk-your-openai-api-key-here
ANTHROPIC_API_KEY=your-anthropic-api-key-here  # Optional

# GitHub Integration (REQUIRED for repository access)
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# GitLab Integration (Optional)
GITLAB_CLIENT_ID=your-gitlab-client-id
GITLAB_CLIENT_SECRET=your-gitlab-client-secret

# Email Configuration (Optional for now)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=noreply@refactoriq.com

# File Storage (Optional - uses local storage if not set)
S3_ACCESS_KEY=your-s3-access-key
S3_SECRET_KEY=your-s3-secret-key
S3_BUCKET=your-s3-bucket
S3_REGION=us-east-1

# Application Settings
ENVIRONMENT=development
DEBUG=true
CORS_ORIGINS=http://localhost:3000,http://localhost:8000
LOG_LEVEL=INFO
LOG_FORMAT=json
```

## Critical Environment Variables for Real Data Testing:

### **MUST HAVE:**
- `OPENAI_API_KEY` - For AI code analysis
- `GITHUB_CLIENT_ID` & `GITHUB_CLIENT_SECRET` - For repository access
- `SECRET_KEY` - For JWT tokens

### **OPTIONAL:**
- `ANTHROPIC_API_KEY` - For Claude AI (fallback)
- Email settings - For notifications
- S3 settings - For file storage (uses local if not set)

