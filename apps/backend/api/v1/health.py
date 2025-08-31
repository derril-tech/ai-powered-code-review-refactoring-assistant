"""
Health check endpoints for monitoring and observability.
Provides comprehensive system health information for load balancers and monitoring tools.
"""

import time
import psutil
import asyncio
from typing import Dict, Any
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from pydantic import BaseModel

from db.session import get_db
from core.config import settings
import redis.asyncio as redis
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/health", tags=["health"])

# Health check response models
class HealthResponse(BaseModel):
    status: str
    timestamp: str
    version: str
    environment: str
    uptime: float

class ServiceHealth(BaseModel):
    status: str
    response_time_ms: float
    error: str = None

class DetailedHealthResponse(HealthResponse):
    services: Dict[str, ServiceHealth]
    system: Dict[str, Any]

# Application start time for uptime calculation
app_start_time = time.time()

@router.get("/", response_model=HealthResponse)
async def health_check():
    """
    Basic health check endpoint for load balancers.
    Returns 200 OK if the application is running.
    """
    return HealthResponse(
        status="healthy",
        timestamp=datetime.utcnow().isoformat() + "Z",
        version=getattr(settings, 'VERSION', '1.0.0'),
        environment=getattr(settings, 'ENVIRONMENT', 'development'),
        uptime=time.time() - app_start_time
    )

@router.get("/live")
async def liveness_check():
    """
    Kubernetes liveness probe endpoint.
    Returns 200 if the application process is running.
    """
    return {"status": "alive", "timestamp": datetime.utcnow().isoformat() + "Z"}

@router.get("/ready")
async def readiness_check(db: AsyncSession = Depends(get_db)):
    """
    Kubernetes readiness probe endpoint.
    Returns 200 only if all critical services are available.
    """
    errors = []
    
    # Check database connectivity
    try:
        start_time = time.time()
        result = await db.execute(text("SELECT 1"))
        result.scalar()
        db_response_time = (time.time() - start_time) * 1000
        
        if db_response_time > 5000:  # 5 second timeout
            errors.append("Database response time too high")
            
    except Exception as e:
        logger.error(f"Database readiness check failed: {e}")
        errors.append("Database unavailable")
    
    # Check Redis connectivity
    try:
        redis_client = redis.from_url(getattr(settings, 'REDIS_URL', 'redis://localhost:6379/0'))
        start_time = time.time()
        await redis_client.ping()
        redis_response_time = (time.time() - start_time) * 1000
        await redis_client.close()
        
        if redis_response_time > 2000:  # 2 second timeout
            errors.append("Redis response time too high")
            
    except Exception as e:
        logger.error(f"Redis readiness check failed: {e}")
        errors.append("Redis unavailable")
    
    if errors:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={"status": "not ready", "errors": errors}
        )
    
    return {"status": "ready", "timestamp": datetime.utcnow().isoformat() + "Z"}

@router.get("/detailed", response_model=DetailedHealthResponse)
async def detailed_health_check(db: AsyncSession = Depends(get_db)):
    """
    Comprehensive health check with detailed service information.
    Used by monitoring systems for detailed diagnostics.
    """
    health_status = {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "version": getattr(settings, 'VERSION', '1.0.0'),
        "environment": getattr(settings, 'ENVIRONMENT', 'development'),
        "uptime": time.time() - app_start_time,
        "services": {},
        "system": {}
    }
    
    # Check database with detailed metrics
    db_health = await _check_database_health(db)
    health_status["services"]["database"] = db_health
    if db_health["status"] != "healthy":
        health_status["status"] = "degraded"
    
    # Check Redis with detailed metrics
    redis_health = await _check_redis_health()
    health_status["services"]["redis"] = redis_health
    if redis_health["status"] != "healthy":
        health_status["status"] = "degraded"
    
    # System metrics
    try:
        health_status["system"] = {
            "cpu_percent": psutil.cpu_percent(interval=1),
            "memory_percent": psutil.virtual_memory().percent,
            "disk_percent": psutil.disk_usage('/').percent,
            "load_average": psutil.getloadavg()[:3] if hasattr(psutil, 'getloadavg') else None,
            "process_count": len(psutil.pids()),
        }
    except Exception as e:
        logger.warning(f"Could not collect system metrics: {e}")
        health_status["system"] = {"error": "System metrics unavailable"}
    
    return health_status

@router.get("/metrics")
async def metrics_endpoint():
    """
    Prometheus-style metrics endpoint.
    Returns key performance indicators in text format.
    """
    try:
        cpu_percent = psutil.cpu_percent(interval=1)
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        
        metrics = f"""# HELP refactoriq_cpu_usage_percent Current CPU usage percentage
# TYPE refactoriq_cpu_usage_percent gauge
refactoriq_cpu_usage_percent {cpu_percent}

# HELP refactoriq_memory_usage_percent Current memory usage percentage
# TYPE refactoriq_memory_usage_percent gauge
refactoriq_memory_usage_percent {memory.percent}

# HELP refactoriq_memory_usage_bytes Current memory usage in bytes
# TYPE refactoriq_memory_usage_bytes gauge
refactoriq_memory_usage_bytes {memory.used}

# HELP refactoriq_disk_usage_percent Current disk usage percentage
# TYPE refactoriq_disk_usage_percent gauge
refactoriq_disk_usage_percent {disk.percent}

# HELP refactoriq_uptime_seconds Application uptime in seconds
# TYPE refactoriq_uptime_seconds counter
refactoriq_uptime_seconds {time.time() - app_start_time}
"""
        
        return JSONResponse(
            content=metrics,
            media_type="text/plain; charset=utf-8"
        )
        
    except Exception as e:
        logger.error(f"Failed to generate metrics: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Metrics collection failed"
        )

async def _check_database_health(db: AsyncSession) -> Dict[str, Any]:
    """Check database health with connection pool metrics."""
    try:
        start_time = time.time()
        
        # Test basic connectivity
        result = await db.execute(text("SELECT 1"))
        result.scalar()
        
        # Test a simple query
        await db.execute(text("SELECT COUNT(*) FROM information_schema.tables"))
        
        response_time = (time.time() - start_time) * 1000
        
        # Check connection pool status if available
        pool_info = {}
        try:
            if hasattr(db.get_bind(), 'pool'):
                pool = db.get_bind().pool
                pool_info = {
                    "pool_size": pool.size(),
                    "checked_in": pool.checkedin(),
                    "checked_out": pool.checkedout(),
                    "overflow": pool.overflow(),
                }
        except Exception:
            pass
        
        return {
            "status": "healthy",
            "response_time_ms": round(response_time, 2),
            "pool_info": pool_info
        }
        
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        return {
            "status": "unhealthy",
            "response_time_ms": 0,
            "error": str(e)
        }

async def _check_redis_health() -> Dict[str, Any]:
    """Check Redis health with detailed connection info."""
    try:
        start_time = time.time()
        
        redis_client = redis.from_url(getattr(settings, 'REDIS_URL', 'redis://localhost:6379/0'))
        
        # Test connectivity
        await redis_client.ping()
        
        # Test basic operations
        test_key = "health_check_test"
        await redis_client.set(test_key, "test", ex=60)
        await redis_client.get(test_key)
        await redis_client.delete(test_key)
        
        # Get Redis info
        info = await redis_client.info()
        
        await redis_client.close()
        
        response_time = (time.time() - start_time) * 1000
        
        return {
            "status": "healthy",
            "response_time_ms": round(response_time, 2),
            "info": {
                "connected_clients": info.get("connected_clients", 0),
                "used_memory_human": info.get("used_memory_human", "unknown"),
                "keyspace_hits": info.get("keyspace_hits", 0),
                "keyspace_misses": info.get("keyspace_misses", 0)
            }
        }
        
    except Exception as e:
        logger.error(f"Redis health check failed: {e}")
        return {
            "status": "unhealthy",
            "response_time_ms": 0,
            "error": str(e)
        }
