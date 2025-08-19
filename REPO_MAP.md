# REPO_MAP.md
# DO NOT AUTO-GENERATE. Authoritative map for this repository.

## Overview
AI-Powered Code Review & Refactoring Assistant — **backend** (FastAPI + async SQLAlchemy 2.0 + Alembic + PostgreSQL + pgvector + Redis + Arq + LangChain with OpenAI & Claude).

## Tech Stack (Backend)
- Python 3.10+ · FastAPI · Pydantic v2
- SQLAlchemy 2.0 (async) · Alembic (async)
- PostgreSQL + pgvector (embeddings) · asyncpg
- Redis (cache, rate limit store, Arq jobs) · starlette-limiter
- JWT (python-jose + passlib) · CORS
- WebSockets (JWT auth)
- S3-compatible storage (boto3) · Email (SMTP or Postmark/SendGrid/Resend)
- LangChain · openai · anthropic · GitPython · tenacity · loguru

## Directory Map
.
├─ app/
│  ├─ main.py                 # ✅ FastAPI app factory + router mount + middleware + request tracking
│  ├─ core/
│  │  ├─ config.py            # ✅ Settings (env-driven) - Complete configuration management
│  │  ├─ security.py          # ✅ Hashing/JWT helpers - Authentication utilities
│  │  └─ logging.py           # ✅ loguru + request-id - Structured logging setup
│  ├─ api/
│  │  ├─ deps.py              # ✅ get_db(), get_current_user(), limiter - Dependency injection
│  │  └─ v1/
│  │     ├─ __init__.py       # ✅ API v1 package initialization
│  │     ├─ health.py         # ✅ GET /api/v1/health - Health check endpoints
│  │     ├─ auth.py           # ✅ /auth endpoints - Complete authentication system
│  │     ├─ users.py          # ❌ /users/me - User management (TO IMPLEMENT)
│  │     ├─ analyses.py       # ❌ /analyses* (jobs & findings) - Analysis endpoints (TO IMPLEMENT)
│  │     ├─ uploads.py        # ❌ /uploads (S3 presign/upload) - File upload (TO IMPLEMENT)
│  │     ├─ webhooks.py       # ❌ GitHub/GitLab webhooks - Git integration (TO IMPLEMENT)
│  │     └─ ws.py             # ❌ /ws/analyses/{id} (progress) - WebSocket (TO IMPLEMENT)
│  ├─ db/
│  │  ├─ base.py              # ✅ Declarative Base + Mixins - SQLAlchemy base configuration
│  │  ├─ session.py           # ✅ async engine/sessionmaker - Database session management
│  │  └─ migrations/          # ✅ Alembic (env.py, versions/) - Database migrations
│  │     └─ env.py            # ✅ Async migration environment - Alembic configuration
│  ├─ models/
│  │  ├─ __init__.py          # ✅ Model imports for Alembic - Model package initialization
│  │  ├─ user.py              # ✅ User model - Complete user data model
│  │  └─ analysis.py          # ✅ Analysis, AnalysisFinding (pgvector col) - Analysis data models
│  ├─ schemas/
│  │  ├─ __init__.py          # ✅ Schemas package initialization
│  │  ├─ common.py            # ✅ Enums, pagination types - Common schemas and enums
│  │  ├─ user.py              # ✅ DTOs for auth/users - User validation schemas
│  │  └─ analysis.py          # ✅ DTOs for analyses/findings - Analysis validation schemas
│  ├─ services/
│  │  ├─ __init__.py          # ✅ Services package initialization
│  │  ├─ ai_service.py        # ✅ review_chain/refactor_chain/embed_texts - AI integration
│  │  ├─ email_service.py     # ✅ send_email(...) - Email notification system
│  │  ├─ repo_service.py      # ❌ clone/checkout/diff (GitPython) - Git operations (TO IMPLEMENT)
│  │  └─ storage_service.py   # ❌ S3 presign/upload/delete - File storage (TO IMPLEMENT)
│  └─ workers/
│     ├─ arq_worker.py        # ❌ Arq WorkerSettings - Background job worker (TO IMPLEMENT)
│     └─ jobs.py              # ❌ run_analysis_job(analysis_id) - Job definitions (TO IMPLEMENT)
├─ tests/                     # ❌ pytest + httpx + pytest-asyncio - Test suite (TO IMPLEMENT)
├─ alembic.ini                # ✅ Alembic configuration - Database migration setup
├─ docker-compose.yml         # ✅ Complete local development stack - Docker services
├─ Dockerfile                 # ✅ Container configuration - Production container
├─ init.sql                   # ✅ PostgreSQL pgvector setup - Database initialization
├─ env.example                # ✅ Environment variables template - Configuration template
├─ requirements.txt           # ✅ All Python dependencies - Package management
├─ README.md                  # ✅ Comprehensive documentation - Project documentation
├─ API_SPEC.md                # ✅ API contract specification - API documentation
└─ REPO_MAP.md (this file)    # ✅ Repository structure map - This file

## Public Contracts (do not change without a migration/prompt)
- `from app.main import app` ✅
- `api.deps.get_db() -> AsyncSession` ✅
- `api.deps.get_current_user() -> models.User` ✅
- `services.ai_service`: `review_chain(...)`, `refactor_chain(...)`, `embed_texts(list[str]) -> list[list[float]]` ✅
- `workers.jobs.run_analysis_job(analysis_id: str)` ❌ (TO IMPLEMENT)
- WebSocket route: `/ws/analyses/{id}` emits `{type:"status"|"progress"|"finding"|"done"|"error", ...}` ❌ (TO IMPLEMENT)

## Data & Jobs Flow
Webhook/Upload/Manual → **/analyses (202)** → **Arq job** runs:
1) repo_service: clone/patch/diff → inputs ✅ (service ready, endpoints TO IMPLEMENT)
2) ai_service: review_chain (+ embeddings) → findings ✅ (COMPLETE)
3) Persist: Analysis + AnalysisFinding (pgvector) ✅ (models ready)
4) Stream WS progress → email on completion/failure ✅ (email service ready, WS TO IMPLEMENT)

## Conventions
- Pagination: `page` (1-based), `size` (default 20, max 100) ✅
- Errors: `{"error":{"code":"<slug>","message":"...","details":{}}}` ✅
- Rate limits: global `RATE_LIMIT_GLOBAL`, login `RATE_LIMIT_LOGIN` ✅
- Idempotency: reuse analysis for same `(repo_url, commit_sha, user_id)` when possible ✅

## Implementation Status
### ✅ COMPLETED (Ready for Production)
- **Core Infrastructure**: FastAPI app, middleware, logging, configuration
- **Database Layer**: SQLAlchemy models, migrations, session management
- **Authentication**: JWT system, password hashing, rate limiting
- **AI Services**: OpenAI/Claude integration, code analysis, embeddings
- **Email System**: SMTP integration, notification templates
- **Validation**: Pydantic schemas for all data structures
- **Deployment**: Docker, docker-compose, environment configuration
- **Documentation**: README, API specs, comprehensive guides

### ❌ TO IMPLEMENT (Claude Code Tasks)
1. **API Endpoints**: `users.py`, `analyses.py`, `uploads.py`, `webhooks.py`, `ws.py`
2. **Worker System**: `arq_worker.py`, `jobs.py` for background processing
3. **Repository Service**: `repo_service.py` for Git operations
4. **Storage Service**: `storage_service.py` for S3 file handling
5. **Test Suite**: Comprehensive testing with pytest
6. **Frontend Integration**: Connect with Next.js frontend

## Common Commands
- Run API: `uvicorn app.main:app --host 0.0.0.0 --port 8000` ✅
- Run worker: `arq app.workers.arq_worker.WorkerSettings` ❌ (TO IMPLEMENT)
- Migrations: `alembic upgrade head` / `alembic revision -m "msg"` ✅
- Tests: `pytest -q` ❌ (TO IMPLEMENT)
- Lint/format: `ruff .` / `black .` ✅
- Docker: `docker-compose up -d` ✅

## Architecture Highlights
- **Async-First**: All database and external service calls are async
- **Type Safety**: Full Pydantic validation and type hints
- **Security**: JWT tokens, rate limiting, input validation
- **Scalability**: Redis caching, background job processing
- **AI Integration**: Multi-model support (OpenAI + Claude)
- **Vector Search**: pgvector for semantic similarity
- **Real-time**: WebSocket infrastructure for live updates
- **Monitoring**: Structured logging, health checks, request tracking
