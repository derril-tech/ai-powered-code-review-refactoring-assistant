# Full Stack Startup Guide

## Option 1: Docker Compose (Recommended)

```bash
# 1. Make sure Docker is running
docker --version

# 2. Create backend .env file (see BACKEND_ENV_SETUP.md)
cp apps/backend/env.example apps/backend/.env
# Edit apps/backend/.env with your API keys

# 3. Create frontend .env.local file
cp apps/frontend/env.example apps/frontend/.env.local

# 4. Start all services
docker-compose up -d

# 5. Check if services are running
docker-compose ps

# 6. Run database migrations
docker-compose exec backend alembic upgrade head

# 7. Check logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

## Option 2: Manual Setup (Development)

### Terminal 1 - Database & Redis
```bash
# Start PostgreSQL (if not using Docker)
# Install PostgreSQL with pgvector extension
createdb code_review_db
psql code_review_db -c "CREATE EXTENSION IF NOT EXISTS vector;"

# Start Redis
redis-server
```

### Terminal 2 - Backend
```bash
cd apps/backend

# Install Python dependencies
pip install -r requirements.txt

# Run database migrations
alembic upgrade head

# Start FastAPI server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Terminal 3 - Background Worker
```bash
cd apps/backend

# Start background worker for async tasks
arq app.workers.arq_worker.WorkerSettings
```

### Terminal 4 - Frontend
```bash
cd apps/frontend

# Install dependencies (if not done)
npm install

# Start Next.js development server
npm run dev
```

## Verification Steps

### 1. Check Backend Health
```bash
curl http://localhost:8000/api/v1/health
# Should return: {"status": "healthy"}
```

### 2. Check Database Connection
```bash
# Check if tables were created
docker-compose exec postgres psql -U postgres -d code_review_db -c "\dt"
```

### 3. Check Frontend
```bash
# Open browser to http://localhost:3000
# Should show the RefactorIQ homepage
```

### 4. Check API Documentation
```bash
# Open browser to http://localhost:8000/docs
# Should show FastAPI Swagger documentation
```

## Troubleshooting

### Backend won't start:
- Check if .env file exists and has correct values
- Verify database is running and accessible
- Check if Redis is running

### Database connection issues:
- Verify DATABASE_URL in .env
- Check if PostgreSQL is running
- Ensure pgvector extension is installed

### Frontend API calls fail:
- Check if backend is running on port 8000
- Verify NEXT_PUBLIC_API_URL in frontend .env.local
- Check browser console for CORS errors

