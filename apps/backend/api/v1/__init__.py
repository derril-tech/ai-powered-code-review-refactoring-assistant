# API v1 package
from fastapi import APIRouter
from app.api.v1 import health, auth, users, analyses, uploads, webhooks, ws, repos, proposals, organizations

# Create main API router
api_router = APIRouter()

# Include all routers
api_router.include_router(health.router, prefix="/health", tags=["health"])
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(analyses.router, prefix="/analyses", tags=["analyses"])
api_router.include_router(uploads.router, prefix="/uploads", tags=["uploads"])
api_router.include_router(webhooks.router, prefix="/webhooks", tags=["webhooks"])
api_router.include_router(ws.router, prefix="/ws", tags=["websocket"])
api_router.include_router(repos.router, prefix="/repos", tags=["repositories"])
api_router.include_router(proposals.router, prefix="/proposals", tags=["proposals"])
api_router.include_router(organizations.router, prefix="/organizations", tags=["organizations"])
