#!/bin/bash

# RefactorIQ Backend - Fly.io Deployment Script

echo "🚀 Deploying RefactorIQ Backend to Fly.io..."

# Check if flyctl is installed
if ! command -v flyctl &> /dev/null; then
    echo "❌ flyctl is not installed. Please install it first:"
    echo "   https://fly.io/docs/hands-on/install-flyctl/"
    exit 1
fi

# Navigate to backend directory
cd "$(dirname "$0")"

# Login to Fly.io (if not already logged in)
echo "🔐 Checking Fly.io authentication..."
flyctl auth whoami || flyctl auth login

# Create or update the app
echo "📦 Creating/updating Fly.io app..."
if flyctl apps list | grep -q "refactoriq-backend"; then
    echo "✅ App already exists, updating..."
else
    echo "🆕 Creating new app..."
    flyctl apps create refactoriq-backend --org personal
fi

# Set secrets (you'll need to run these manually with your actual values)
echo "🔑 Setting up secrets..."
echo "Please run these commands with your actual values:"
echo ""
echo "flyctl secrets set DATABASE_URL='your-neon-or-supabase-url'"
echo "flyctl secrets set REDIS_URL='your-upstash-redis-url'"
echo "flyctl secrets set UPSTASH_REDIS_REST_URL='your-upstash-rest-url'"
echo "flyctl secrets set UPSTASH_REDIS_REST_TOKEN='your-upstash-token'"
echo "flyctl secrets set SECRET_KEY='your-secret-key'"
echo "flyctl secrets set OPENAI_API_KEY='your-openai-key'"
echo "flyctl secrets set ANTHROPIC_API_KEY='your-anthropic-key'"
echo "flyctl secrets set GITHUB_CLIENT_ID='your-github-client-id'"
echo "flyctl secrets set GITHUB_CLIENT_SECRET='your-github-client-secret'"
echo ""

# Deploy the application
echo "🚀 Deploying to Fly.io..."
flyctl deploy

# Show the app URL
echo "✅ Deployment complete!"
echo "🌐 Your API is available at: https://refactoriq-backend.fly.dev/api"
echo "🏥 Health check: https://refactoriq-backend.fly.dev/api/v1/health"
echo ""
echo "📋 Next steps:"
echo "1. Set your secrets using the commands above"
echo "2. Update your Vercel frontend's NEXT_PUBLIC_API_BASE_URL to: https://refactoriq-backend.fly.dev"
echo "3. Test your API endpoints"

