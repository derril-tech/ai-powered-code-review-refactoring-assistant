#!/bin/bash

# RefactorIQ Backend Environment Setup Script
# This script creates your .env file with the correct credentials

echo "🔧 Setting up RefactorIQ Backend Environment..."

# Create .env file with your actual credentials
cat > .env << 'EOF'
# RefactorIQ Backend Configuration
# Generated from your Supabase and Upstash credentials

# Application Settings
APP_NAME=RefactorIQ
VERSION=1.0.0
ENVIRONMENT=production
DEBUG=false
HOST=0.0.0.0
PORT=8000

# Database - Supabase PostgreSQL with pgvector
DATABASE_URL=postgresql+asyncpg://postgres:3sFcEkksknrp.AW@db.gckegzixosqeuyipzkbe.supabase.co:5432/postgres
DATABASE_ECHO=false

# Redis - Upstash
REDIS_URL=redis://default:AXgEAAIncDFiMmNlYjU1ZjkwYjA0MTdhODNkM2FkYWEzZGE0MjE5ZXAxMzA3MjQ@open-bison-30724.upstash.io:6379
UPSTASH_REDIS_REST_URL=https://open-bison-30724.upstash.io
UPSTASH_REDIS_REST_TOKEN=AXgEAAIncDFiMmNlYjU1ZjkwYjA0MTdhODNkM2FkYWEzZGE0MjE5ZXAxMzA3MjQ

# ARQ Job Queue (using same Redis with different DB)
ARQ_REDIS_URL=redis://default:AXgEAAIncDFiMmNlYjU1ZjkwYjA0MTdhODNkM2FkYWEzZGE0MjE5ZXAxMzA3MjQ@open-bison-30724.upstash.io:6379/1

# Security - Using your Supabase JWT keys
SECRET_KEY=7e7872e0-4717-49ca-84c2-52fff45c7215-1a7969d1-b1b2-48d7-a403-89eb15273b28
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Supabase API Keys
SUPABASE_URL=https://gckegzixosqeuyipzkbe.supabase.co
SUPABASE_ANON_KEY=sb_publishable_UM3r3OclmjD04wqwsOy40A_h8Fx0Ybp
SUPABASE_SERVICE_KEY=sb_secret_YXVsinnSomR--vWnk498Mg_ELfmJPfH

# AI Services (add your keys here)
OPENAI_API_KEY=your-openai-key-here
OPENAI_MODEL=gpt-4
ANTHROPIC_API_KEY=your-anthropic-key-here
ANTHROPIC_MODEL=claude-3-sonnet-20240229

# GitHub OAuth (set these up later)
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Rate Limiting
RATE_LIMIT_GLOBAL=100/minute
RATE_LIMIT_LOGIN=5/minute
RATE_LIMIT_ANALYSIS=10/hour

# Vector Database
VECTOR_DIMENSION=1536

# Logging
LOG_LEVEL=INFO
LOG_FORMAT=json

# CORS - Allow your frontend domains
ALLOWED_ORIGINS=http://localhost:3000,https://your-app.vercel.app
EOF

echo "✅ Environment file created successfully!"
echo "📝 Next steps:"
echo "1. Add your OpenAI API key to .env"
echo "2. Add your Anthropic API key to .env (optional)"
echo "3. Set up GitHub OAuth credentials (optional)"
echo ""
echo "🔍 Your current configuration:"
echo "Database: Supabase PostgreSQL"
echo "Redis: Upstash"
echo "Environment: Production"
