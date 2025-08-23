#!/bin/bash

# Development script to run both frontend and backend
echo "🚀 Starting AI Code Review Assistant development environment..."

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm is not installed. Please install pnpm first."
    exit 1
fi

# Install dependencies for all packages
echo "📦 Installing dependencies..."
pnpm install

# Build shared packages
echo "🔨 Building shared packages..."
pnpm --filter "@ai-code-review/types" run build
pnpm --filter "@ai-code-review/ui" run build

# Start development servers
echo "🌐 Starting development servers..."
echo "Frontend: http://localhost:3000"
echo "Backend: http://localhost:8000"
echo "Database: localhost:5432"
echo "Redis: localhost:6379"

# Run both frontend and backend in parallel
pnpm dev
