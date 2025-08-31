# 🏗️ RefactorIQ™ 3-Tier Backend Architecture Guide

## 📋 Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Tier 1: Presentation Layer (API)](#tier-1-presentation-layer-api)
3. [Tier 2: Business Logic Layer](#tier-2-business-logic-layer)
4. [Tier 3: Data Layer](#tier-3-data-layer)
5. [Installation & Setup](#installation--setup)
6. [API Endpoints & Usage](#api-endpoints--usage)
7. [Development Workflow](#development-workflow)
8. [Production Deployment](#production-deployment)

---

## 🏛️ Architecture Overview

Your RefactorIQ backend follows a **3-tier architecture** pattern:

```
┌─────────────────────────────────────────────────────────────┐
│                    TIER 1: PRESENTATION                    │
│                     (API Gateway)                          │
├─────────────────────────────────────────────────────────────┤
│  FastAPI Server (Fly.io)                                   │
│  • REST API Endpoints                                      │
│  • WebSocket Connections                                   │
│  • Authentication & Authorization                          │
│  • Request/Response Handling                               │
│  • Rate Limiting & CORS                                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   TIER 2: BUSINESS LOGIC                   │
│                    (Application Layer)                     │
├─────────────────────────────────────────────────────────────┤
│  Services & Workers                                         │
│  • AI Analysis Service (OpenAI/Anthropic)                  │
│  • Git Operations Service                                  │
│  • Code Review Logic                                       │
│  • Background Job Processing (Arq)                         │
│  • Email & Notification Services                           │
│  • File Processing & Storage                               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     TIER 3: DATA LAYER                     │
│                   (Persistence Layer)                      │
├─────────────────────────────────────────────────────────────┤
│  Databases & Storage                                        │
│  • PostgreSQL + pgvector (Supabase) - Primary Data         │
│  • Redis (Upstash) - Cache & Job Queue                     │
│  • File Storage (S3/MinIO) - Code & Reports                │
│  • Vector Database - Code Embeddings                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 🌐 Tier 1: Presentation Layer (API)

### **Purpose**
Handles all client interactions, authentication, and request/response processing.

### **Technology Stack**
- **Framework:** FastAPI (Python)
- **Hosting:** Fly.io
- **Features:** Auto-generated docs, async support, type validation

### **Key Components**

#### **1. API Endpoints**
```
Base URL: https://refactoriq-backend.fly.dev

Authentication:
├── POST /api/v1/auth/login          # User login
├── POST /api/v1/auth/register       # User registration  
├── POST /api/v1/auth/refresh        # Token refresh
└── POST /api/v1/auth/logout         # User logout

Health & Monitoring:
├── GET  /api/v1/health              # Basic health check
├── GET  /api/v1/health/detailed     # Detailed system status
├── GET  /api/v1/health/ready        # Readiness probe
└── GET  /api/v1/health/metrics      # Prometheus metrics

Code Analysis:
├── POST /api/v1/analyses            # Create new analysis
├── GET  /api/v1/analyses            # List user analyses
├── GET  /api/v1/analyses/{id}       # Get analysis details
├── PUT  /api/v1/analyses/{id}       # Update analysis
└── DELETE /api/v1/analyses/{id}     # Delete analysis

File Management:
├── POST /api/v1/uploads             # Upload code files
├── GET  /api/v1/uploads/{id}        # Download files
└── DELETE /api/v1/uploads/{id}      # Delete files

Proposals & Reviews:
├── GET  /api/v1/proposals           # List proposals
├── POST /api/v1/proposals           # Create proposal
├── GET  /api/v1/proposals/{id}      # Get proposal details
└── PUT  /api/v1/proposals/{id}      # Update proposal

WebSocket:
└── WS   /ws/analysis/{id}           # Real-time analysis updates
```

#### **2. Authentication & Security**
```python
# JWT Token-based authentication
Headers: {
    "Authorization": "Bearer <jwt_token>",
    "Content-Type": "application/json"
}

# Rate Limiting
- Global: 100 requests/minute
- Login: 5 attempts/minute  
- Analysis: 10 requests/hour
```

#### **3. Request/Response Format**
```json
// Standard Success Response
{
    "success": true,
    "data": { ... },
    "message": "Operation completed successfully",
    "timestamp": "2024-01-01T00:00:00Z"
}

// Standard Error Response  
{
    "success": false,
    "error": {
        "code": "VALIDATION_ERROR",
        "message": "Invalid input provided",
        "details": { ... }
    },
    "timestamp": "2024-01-01T00:00:00Z"
}
```

---

## ⚙️ Tier 2: Business Logic Layer

### **Purpose**
Contains all application logic, business rules, and data processing.

### **Key Services**

#### **1. AI Analysis Service**
```python
# Location: services/ai_service.py
# Purpose: Code analysis using AI models

Features:
├── Code Quality Analysis
├── Security Vulnerability Detection  
├── Performance Optimization Suggestions
├── Code Style & Best Practices
└── Refactoring Recommendations

AI Providers:
├── OpenAI GPT-4 (Primary)
├── Anthropic Claude (Fallback)
└── Local Models (Future)
```

#### **2. Git Operations Service**
```python
# Location: services/git_operations.py  
# Purpose: Git repository management

Features:
├── Repository Cloning
├── Branch Management
├── Diff Analysis
├── Commit History Processing
└── Merge Conflict Resolution
```

#### **3. Background Job Processing**
```python
# Location: workers/analysis_worker.py
# Technology: Arq (Redis-based)

Job Types:
├── Code Analysis Jobs
├── Report Generation  
├── Email Notifications
├── File Processing
└── Cleanup Tasks

Queue Management:
├── Priority Queues
├── Retry Logic
├── Dead Letter Queues
└── Job Monitoring
```

#### **4. Proposal Service**
```python
# Location: services/proposal_service.py
# Purpose: Code change proposals

Features:
├── Diff Generation
├── Impact Analysis
├── Approval Workflows
├── Merge Strategies
└── Rollback Capabilities
```

---

## 🗄️ Tier 3: Data Layer

### **Purpose**
Manages all data persistence, caching, and storage operations.

### **Database Architecture**

#### **1. Primary Database: PostgreSQL + pgvector (Supabase)**
```sql
-- Connection Details
Host: db.gckegzixosqeuyipzkbe.supabase.co
Port: 5432
Database: postgres
User: postgres
SSL: Required

-- Key Tables
├── users                 # User accounts & profiles
├── organizations         # Team/company data
├── repositories          # Git repository metadata
├── analyses              # Code analysis results
├── proposals             # Refactoring proposals
├── files                 # File metadata & content
├── embeddings            # Vector embeddings for code
└── audit_logs            # System audit trail

-- Vector Extensions
CREATE EXTENSION IF NOT EXISTS vector;
-- Enables similarity search for code patterns
```

#### **2. Cache & Queue: Redis (Upstash)**
```redis
# Connection Details
Host: open-bison-30724.upstash.io
Port: 6379
SSL: Required
Auth: Token-based

# Data Structure Usage
├── Session Storage       # User sessions & tokens
├── Rate Limiting         # API rate limit counters
├── Job Queues           # Background task queues
├── Cache Layer          # Frequently accessed data
├── Real-time Data       # WebSocket state
└── Temporary Storage    # File upload buffers

# Key Patterns
user:session:{user_id}    # User session data
rate_limit:{ip}:{endpoint} # Rate limiting
job:queue:analysis        # Analysis job queue
cache:analysis:{id}       # Cached analysis results
```

#### **3. File Storage (Future: S3/MinIO)**
```
# Storage Structure
├── uploads/              # User uploaded files
├── analyses/            # Generated analysis reports  
├── proposals/           # Proposal diffs & patches
├── exports/             # Exported reports
└── temp/                # Temporary processing files

# File Types
├── .py, .js, .ts, .java # Source code files
├── .pdf, .html          # Generated reports
├── .patch, .diff        # Code changes
└── .zip, .tar.gz        # Archive files
```

---

## 🚀 Installation & Setup

### **Prerequisites**
```bash
# Required Software
├── Python 3.10+
├── PostgreSQL 14+ (or Supabase account)
├── Redis 6+ (or Upstash account)  
├── Git 2.30+
└── Docker (optional)

# Required Accounts
├── Supabase (Database)
├── Upstash (Redis)
├── Fly.io (Hosting)
├── OpenAI (AI Analysis)
└── GitHub/GitLab (OAuth)
```

### **Local Development Setup**

#### **1. Clone & Environment**
```bash
# Clone repository
git clone <your-repo-url>
cd ai-powered-code-review-refactoring-assistant

# Navigate to backend
cd apps/backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# or
venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt
```

#### **2. Environment Configuration**
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your credentials
DATABASE_URL=postgresql+asyncpg://postgres:password@host:5432/db
REDIS_URL=redis://default:token@host:6379
OPENAI_API_KEY=sk-your-key-here
# ... other variables
```

#### **3. Database Setup**
```bash
# Run migrations
alembic upgrade head

# Seed initial data (optional)
python -m fixtures.sample_data
```

#### **4. Start Development Server**
```bash
# Start FastAPI server
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Start background worker (separate terminal)
arq workers.analysis_worker.WorkerSettings

# Access API documentation
open http://localhost:8000/docs
```

### **Production Deployment**

#### **1. Fly.io Deployment**
```bash
# Login to Fly.io
flyctl auth login

# Deploy application
flyctl deploy

# Set production secrets
flyctl secrets set DATABASE_URL="your-production-db-url"
flyctl secrets set REDIS_URL="your-production-redis-url"
# ... other secrets

# Monitor deployment
flyctl status
flyctl logs
```

#### **2. Environment Variables**
```bash
# Required Production Variables
DATABASE_URL              # Supabase connection string
REDIS_URL                 # Upstash connection string  
UPSTASH_REDIS_REST_URL    # Upstash REST API URL
UPSTASH_REDIS_REST_TOKEN  # Upstash REST API token
SECRET_KEY                # JWT signing key
OPENAI_API_KEY            # OpenAI API key
ANTHROPIC_API_KEY         # Anthropic API key (optional)
GITHUB_CLIENT_ID          # GitHub OAuth ID
GITHUB_CLIENT_SECRET      # GitHub OAuth secret
ENVIRONMENT=production    # Environment flag
```

---

## 🔌 API Endpoints & Usage

### **Authentication Flow**
```python
# 1. Register new user
POST /api/v1/auth/register
{
    "email": "user@example.com",
    "password": "secure_password",
    "full_name": "John Doe"
}

# 2. Login user  
POST /api/v1/auth/login
{
    "email": "user@example.com", 
    "password": "secure_password"
}

# Response
{
    "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "token_type": "bearer",
    "expires_in": 1800
}

# 3. Use token in subsequent requests
Headers: {
    "Authorization": "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

### **Code Analysis Workflow**
```python
# 1. Upload code files
POST /api/v1/uploads
Content-Type: multipart/form-data
files: [file1.py, file2.js, ...]

# Response
{
    "upload_id": "uuid-here",
    "files": [
        {"filename": "file1.py", "size": 1024, "type": "python"},
        {"filename": "file2.js", "size": 2048, "type": "javascript"}
    ]
}

# 2. Create analysis
POST /api/v1/analyses
{
    "upload_id": "uuid-here",
    "analysis_type": "full",
    "options": {
        "check_security": true,
        "check_performance": true,
        "suggest_refactoring": true
    }
}

# Response
{
    "analysis_id": "analysis-uuid",
    "status": "queued",
    "estimated_time": 300
}

# 3. Monitor progress (WebSocket)
WS /ws/analysis/analysis-uuid

# Messages received:
{
    "type": "progress",
    "progress": 25,
    "message": "Analyzing file1.py..."
}

{
    "type": "complete", 
    "analysis_id": "analysis-uuid",
    "results": { ... }
}

# 4. Get results
GET /api/v1/analyses/analysis-uuid

# Response
{
    "id": "analysis-uuid",
    "status": "completed",
    "results": {
        "overall_score": 8.5,
        "issues": [
            {
                "type": "security",
                "severity": "high", 
                "file": "file1.py",
                "line": 42,
                "message": "SQL injection vulnerability",
                "suggestion": "Use parameterized queries"
            }
        ],
        "metrics": {
            "lines_of_code": 1500,
            "complexity": "medium",
            "maintainability": 7.2
        }
    }
}
```

### **Proposal Generation**
```python
# 1. Generate refactoring proposal
POST /api/v1/proposals
{
    "analysis_id": "analysis-uuid",
    "issues_to_fix": ["security-001", "performance-003"],
    "auto_apply": false
}

# Response
{
    "proposal_id": "proposal-uuid",
    "changes": [
        {
            "file": "file1.py",
            "type": "modification",
            "diff": "--- a/file1.py\n+++ b/file1.py\n@@ -40,2 +40,2 @@\n-query = f\"SELECT * FROM users WHERE id = {user_id}\"\n+query = \"SELECT * FROM users WHERE id = %s\"\n+cursor.execute(query, (user_id,))"
        }
    ],
    "impact_analysis": {
        "files_affected": 1,
        "estimated_improvement": 15
    }
}

# 2. Apply proposal
PUT /api/v1/proposals/proposal-uuid/apply
{
    "confirm": true
}
```

---

## 🔄 Development Workflow

### **Local Development Process**
```bash
# 1. Start development environment
docker-compose up -d postgres redis  # Start databases
uvicorn main:app --reload            # Start API server
arq workers.analysis_worker.WorkerSettings  # Start worker

# 2. Make changes to code
# Edit files in apps/backend/

# 3. Test changes
pytest tests/                        # Run tests
curl http://localhost:8000/api/v1/health  # Test API

# 4. Database migrations (if needed)
alembic revision --autogenerate -m "Add new table"
alembic upgrade head

# 5. Commit and deploy
git add .
git commit -m "Add new feature"
git push origin main
flyctl deploy  # Deploy to production
```

### **Testing Strategy**
```python
# Test Structure
tests/
├── unit/           # Unit tests for individual functions
├── integration/    # Integration tests for services  
├── api/           # API endpoint tests
└── fixtures/      # Test data and mocks

# Run tests
pytest tests/unit/                   # Unit tests only
pytest tests/integration/           # Integration tests  
pytest tests/api/                   # API tests
pytest --cov=. tests/               # With coverage
```

### **Monitoring & Debugging**
```bash
# Production monitoring
flyctl logs -a refactoriq-backend           # View logs
flyctl status -a refactoriq-backend         # Check status
flyctl ssh console -a refactoriq-backend    # SSH into container

# Health checks
curl https://refactoriq-backend.fly.dev/api/v1/health
curl https://refactoriq-backend.fly.dev/api/v1/health/detailed

# Database monitoring
# Check Supabase dashboard for query performance
# Monitor Redis usage in Upstash console
```

---

## 🔐 Security & Best Practices

### **Security Measures**
```python
# 1. Authentication & Authorization
- JWT tokens with expiration
- Refresh token rotation
- Role-based access control (RBAC)
- API key authentication for services

# 2. Data Protection  
- Input validation with Pydantic
- SQL injection prevention (SQLAlchemy ORM)
- XSS protection (FastAPI built-in)
- CORS configuration
- Rate limiting per endpoint

# 3. Infrastructure Security
- HTTPS only (TLS 1.3)
- Environment variable secrets
- Database connection encryption
- Redis AUTH and SSL
- Container security scanning
```

### **Performance Optimization**
```python
# 1. Database Optimization
- Connection pooling
- Query optimization with indexes
- Vector similarity search (pgvector)
- Read replicas for scaling

# 2. Caching Strategy
- Redis for session storage
- API response caching
- Database query result caching
- File upload buffering

# 3. Background Processing
- Async job processing with Arq
- Queue prioritization
- Retry mechanisms with exponential backoff
- Dead letter queues for failed jobs
```

---

## 📊 Monitoring & Observability

### **Health Monitoring**
```python
# Endpoint monitoring
GET /api/v1/health              # Basic health
GET /api/v1/health/ready        # Readiness probe  
GET /api/v1/health/detailed     # Detailed status
GET /api/v1/health/metrics      # Prometheus metrics

# Key metrics tracked:
- API response times
- Database connection pool status
- Redis connection health  
- Background job queue length
- Memory and CPU usage
- Error rates by endpoint
```

### **Logging Strategy**
```python
# Log levels and structure
import logging
from loguru import logger

# Structured logging with context
logger.info("Analysis started", 
    analysis_id=analysis_id,
    user_id=user_id, 
    file_count=len(files)
)

# Log aggregation in production
- Centralized logging with structured JSON
- Error tracking and alerting
- Performance monitoring
- Security event logging
```

---

## 🚀 Scaling Considerations

### **Horizontal Scaling**
```python
# API Layer Scaling
- Multiple Fly.io instances
- Load balancing
- Auto-scaling based on CPU/memory
- Geographic distribution

# Background Worker Scaling  
- Multiple worker instances
- Queue-based load distribution
- Priority job processing
- Resource-based scaling
```

### **Database Scaling**
```python
# PostgreSQL Scaling
- Read replicas for query distribution
- Connection pooling optimization
- Query performance monitoring
- Index optimization

# Redis Scaling
- Redis Cluster for high availability
- Separate instances for different use cases
- Memory optimization
- Persistence configuration
```

---

## 🔧 Troubleshooting Guide

### **Common Issues**

#### **1. Import Errors**
```bash
# Problem: ModuleNotFoundError
# Solution: Check Python path and imports
export PYTHONPATH=/app:$PYTHONPATH
# Ensure relative imports are correct
```

#### **2. Database Connection Issues**
```bash
# Problem: Connection refused
# Check: Database URL format and credentials
# Test: psql "postgresql://user:pass@host:port/db"
```

#### **3. Redis Connection Issues**  
```bash
# Problem: Redis connection timeout
# Check: Redis URL and authentication
# Test: redis-cli -u "redis://user:pass@host:port"
```

#### **4. Deployment Issues**
```bash
# Problem: Fly.io deployment fails
# Check: Dockerfile and requirements.txt
# Debug: flyctl logs -a app-name
```

### **Performance Issues**
```python
# 1. Slow API responses
- Check database query performance
- Monitor Redis cache hit rates  
- Profile code with cProfile
- Check network latency

# 2. High memory usage
- Monitor object creation in loops
- Check for memory leaks in long-running processes
- Optimize database query result handling
- Use streaming for large file processing

# 3. Background job delays
- Monitor Redis queue length
- Check worker process health
- Optimize job processing logic
- Scale worker instances if needed
```

---

## 📚 Additional Resources

### **Documentation Links**
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Supabase Documentation](https://supabase.com/docs)
- [Upstash Documentation](https://docs.upstash.com/)
- [Fly.io Documentation](https://fly.io/docs/)
- [Alembic Documentation](https://alembic.sqlalchemy.org/)

### **Development Tools**
```bash
# Recommended IDE extensions
- Python (Microsoft)
- FastAPI (Sebastian Ramirez)  
- SQLAlchemy (Mikhail Arkhipov)
- Redis (Dunn Software)

# Useful CLI tools
pip install httpie          # API testing
pip install pgcli           # PostgreSQL CLI
pip install redis-cli       # Redis CLI  
pip install flyctl          # Fly.io CLI
```

---

## 🎯 Next Steps

### **Immediate Actions**
1. ✅ **Complete Setup** - Follow installation guide
2. ✅ **Test API** - Verify all endpoints work
3. ✅ **Connect Frontend** - Update environment variables
4. ✅ **Add Monitoring** - Set up health checks
5. ✅ **Security Review** - Implement security best practices

### **Future Enhancements**
- [ ] **Add More AI Models** - Integrate additional AI providers
- [ ] **Implement Caching** - Add Redis caching layer
- [ ] **Add File Storage** - Implement S3/MinIO integration  
- [ ] **Enhance Security** - Add OAuth2 and RBAC
- [ ] **Performance Optimization** - Database indexing and query optimization
- [ ] **Monitoring Dashboard** - Create admin monitoring interface

---

**🎉 Congratulations! You now have a comprehensive understanding of your 3-tier backend architecture. This guide will serve as your reference for development, deployment, and maintenance.**
