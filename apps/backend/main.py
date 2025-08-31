from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import time
import uuid
from loguru import logger

from app.core.config import settings
from app.core.logging import setup_logging
from app.api.v1 import health, auth, users, analyses, uploads, webhooks, ws

# START: Claude Edit Boundary - Safe to modify FastAPI app configuration

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    setup_logging()
    logger.info("Starting AI-Powered Code Review Assistant")
    yield
    # Shutdown
    logger.info("Shutting down AI-Powered Code Review Assistant")

def create_app() -> FastAPI:
    app = FastAPI(
        title="AI-Powered Code Review & Refactoring Assistant",
        description="Intelligent code analysis and automated refactoring tool",
        version="1.0.0",
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
        lifespan=lifespan
    )

    # Middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.ALLOWED_HOSTS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=settings.ALLOWED_HOSTS
    )

    @app.middleware("http")
    async def add_request_id(request: Request, call_next):
        request_id = str(uuid.uuid4())
        request.state.request_id = request_id
        start_time = time.time()
        
        response = await call_next(request)
        
        process_time = time.time() - start_time
        response.headers["X-Request-ID"] = request_id
        response.headers["X-Process-Time"] = str(process_time)
        
        logger.info(
            f"Request {request.method} {request.url.path} completed in {process_time:.3f}s"
        )
        
        return response

    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        logger.error(f"Unhandled exception: {exc}")
        return JSONResponse(
            status_code=500,
            content={
                "error": {
                    "code": "internal_server_error",
                    "message": "An unexpected error occurred",
                    "details": {}
                }
            }
        )

    # Mount API routes
    app.include_router(health.router, prefix="/api/v1", tags=["health"])
    app.include_router(auth.router, prefix="/api/v1/auth", tags=["authentication"])
    app.include_router(users.router, prefix="/api/v1/users", tags=["users"])
    app.include_router(analyses.router, prefix="/api/v1/analyses", tags=["analyses"])
    app.include_router(uploads.router, prefix="/api/v1/uploads", tags=["uploads"])
    app.include_router(webhooks.router, prefix="/api/v1/webhooks", tags=["webhooks"])
    app.include_router(ws.router, prefix="/ws", tags=["websockets"])

    return app

app = create_app()

# END: Claude Edit Boundary
