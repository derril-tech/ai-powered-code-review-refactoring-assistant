import sys
from loguru import logger
from app.core.config import settings

def setup_logging():
    """Configure loguru logging."""
    # Remove default handler
    logger.remove()
    
    # Add console handler
    logger.add(
        sys.stdout,
        format=settings.LOG_FORMAT,
        level=settings.LOG_LEVEL,
        colorize=True,
        backtrace=True,
        diagnose=True
    )
    
    # Add file handler for production
    if settings.ENVIRONMENT == "production":
        logger.add(
            "logs/app.log",
            format=settings.LOG_FORMAT,
            level=settings.LOG_LEVEL,
            rotation="10 MB",
            retention="30 days",
            compression="zip"
        )
    
    # Add error file handler
    logger.add(
        "logs/error.log",
        format=settings.LOG_FORMAT,
        level="ERROR",
        rotation="10 MB",
        retention="30 days",
        compression="zip"
    )
