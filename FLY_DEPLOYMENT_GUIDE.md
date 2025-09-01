# 🚀 RefactorIQ Backend - Fly.io Deployment Guide

## Step 3: Deploy FastAPI to Fly.io

### Prerequisites
- ✅ Step 1: Neon/Supabase PostgreSQL with pgvector enabled
- ✅ Step 2: Upstash Redis with REST URL and token
- 📦 [Fly.io CLI installed](https://fly.io/docs/hands-on/install-flyctl/)

### 🔧 Installation

1. **Install Fly.io CLI:**
   ```bash
   # Windows (PowerShell)
   iwr https://fly.io/install.ps1 -useb | iex
   
   # macOS/Linux
   curl -L https://fly.io/install.sh | sh
   ```

2. **Login to Fly.io:**
   ```bash
   flyctl auth login
   ```

### 🚀 Deployment Steps

1. **Navigate to backend directory:**
   ```bash
   cd apps/backend
   ```

2. **Create Fly.io app:**
   ```bash
   flyctl apps create refactoriq-backend --org personal
   ```

3. **Set environment secrets:**
   ```bash
   # Database (from Step 1 - Neon/Supabase)
   flyctl secrets set DATABASE_URL="postgresql://user:password@host:5432/dbname"
   
   # Redis (from Step 2 - Upstash)
   flyctl secrets set REDIS_URL="redis://default:password@host:6379"
   flyctl secrets set UPSTASH_REDIS_REST_URL="https://your-redis.upstash.io"
   flyctl secrets set UPSTASH_REDIS_REST_TOKEN="your-token"
   
   # Security
   flyctl secrets set SECRET_KEY="$(openssl rand -hex 32)"
   
   # AI Services
   flyctl secrets set OPENAI_API_KEY="your-openai-key"
   flyctl secrets set ANTHROPIC_API_KEY="your-anthropic-key"
   
   # GitHub OAuth
   flyctl secrets set GITHUB_CLIENT_ID="your-github-client-id"
   flyctl secrets set GITHUB_CLIENT_SECRET="your-github-client-secret"
   ```

4. **Deploy the application:**
   ```bash
   flyctl deploy
   ```

5. **Verify deployment:**
   ```bash
   # Check app status
   flyctl status
   
   # View logs
   flyctl logs
   
   # Test health endpoint
   curl https://refactoriq-backend.fly.dev/api/v1/health
   ```

### 🔗 Your API URLs

After successful deployment:
- **Base URL:** `https://refactoriq-backend.fly.dev`
- **API Endpoint:** `https://refactoriq-backend.fly.dev/api`
- **Health Check:** `https://refactoriq-backend.fly.dev/api/v1/health`
- **OpenAPI Docs:** `https://refactoriq-backend.fly.dev/docs`

### 📋 Step 4: Connect to Vercel Frontend

Update your Vercel project's environment variables:

```bash
# In your Vercel dashboard or CLI
NEXT_PUBLIC_API_BASE_URL=https://refactoriq-backend.fly.dev
```

### 🔧 Troubleshooting

**Common Issues:**

1. **Database Connection:**
   ```bash
   # Test database connection
   flyctl ssh console
   python -c "import psycopg2; print('DB connection works!')"
   ```

2. **Redis Connection:**
   ```bash
   # Test Redis connection
   flyctl ssh console
   python -c "import redis; r=redis.from_url('$REDIS_URL'); print(r.ping())"
   ```

3. **View Application Logs:**
   ```bash
   flyctl logs --app refactoriq-backend
   ```

4. **Scale Resources:**
   ```bash
   # Increase memory if needed
   flyctl scale memory 1024 --app refactoriq-backend
   ```

### 🎯 Next Steps

1. ✅ **Step 3 Complete:** FastAPI deployed to Fly.io
2. 🎯 **Step 4:** Update Vercel frontend to use your new API URL
3. 🎯 **Step 5:** Add schema/prefix for new projects

### 📚 Useful Commands

```bash
# View app info
flyctl info

# SSH into the app
flyctl ssh console

# View secrets
flyctl secrets list

# Update a secret
flyctl secrets set KEY=value

# Redeploy
flyctl deploy

# Scale app
flyctl scale count 2  # Run 2 instances
```

