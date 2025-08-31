"""
Production logging configuration for RefactorIQ.
Implements structured logging with JSON format, security audit logging, and performance metrics.
"""

import os
import sys
import json
import logging
import logging.config
from typing import Dict, Any, Optional
from datetime import datetime
from pathlib import Path

from pythonjsonlogger import jsonlogger
import structlog
from loguru import logger

from .config import get_settings

settings = get_settings()

# Custom JSON formatter that includes additional context
class RefactorIQJSONFormatter(jsonlogger.JsonFormatter):
    """Custom JSON formatter with additional context fields."""
    
    def add_fields(self, log_record: Dict[str, Any], record: logging.LogRecord, message_dict: Dict[str, Any]) -> None:
        super().add_fields(log_record, record, message_dict)
        
        # Add timestamp
        if not log_record.get('timestamp'):
            log_record['timestamp'] = datetime.utcnow().isoformat() + 'Z'
        
        # Add service information
        log_record['service'] = 'refactoriq-backend'
        log_record['environment'] = getattr(settings, 'ENVIRONMENT', 'development')
        log_record['version'] = getattr(settings, 'VERSION', '1.0.0')
        
        # Add level name
        if log_record.get('level'):
            log_record['level'] = log_record['level'].upper()
        else:
            log_record['level'] = record.levelname
        
        # Add logger name
        log_record['logger'] = record.name
        
        # Add process and thread info for debugging
        log_record['process_id'] = os.getpid()
        log_record['thread_id'] = record.thread

# Security audit logger formatter
class SecurityAuditFormatter(RefactorIQJSONFormatter):
    """Specialized formatter for security audit logs."""
    
    def add_fields(self, log_record: Dict[str, Any], record: logging.LogRecord, message_dict: Dict[str, Any]) -> None:
        super().add_fields(log_record, record, message_dict)
        
        # Mark as security audit log
        log_record['audit_type'] = 'security'
        log_record['severity'] = self._get_security_severity(record.levelno)
    
    def _get_security_severity(self, level: int) -> str:
        """Map log level to security severity."""
        if level >= logging.CRITICAL:
            return 'critical'
        elif level >= logging.ERROR:
            return 'high'
        elif level >= logging.WARNING:
            return 'medium'
        else:
            return 'low'

def setup_logging():
    """Configure production-ready logging with structured JSON format."""
    
    # Remove loguru default handler
    logger.remove()
    
    # Get configuration
    log_level = getattr(settings, 'LOG_LEVEL', 'INFO')
    log_file = getattr(settings, 'LOG_FILE', None)
    environment = getattr(settings, 'ENVIRONMENT', 'development')
    
    # Create logs directory if using file logging
    if log_file:
        log_dir = Path(log_file).parent
        log_dir.mkdir(parents=True, exist_ok=True)
    
    # Production logging with JSON format
    if environment == "production":
        # Console handler with JSON format
        logger.add(
            sys.stdout,
            format="<green>{time:YYYY-MM-DD HH:mm:ss.SSS}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> | <level>{message}</level>",
            level=log_level,
            colorize=False,
            serialize=True,  # JSON format
            backtrace=True,
            diagnose=False  # Disable in production for security
        )
        
        # Main application log file
        if log_file:
            logger.add(
                log_file,
                format="{time:YYYY-MM-DD HH:mm:ss.SSS} | {level: <8} | {name}:{function}:{line} | {message}",
                level=log_level,
                rotation="100 MB",
                retention="30 days",
                compression="gz",
                serialize=True,  # JSON format
                backtrace=True,
                diagnose=False
            )
        
        # Security audit log
        security_log_file = str(Path(log_file).parent / 'security_audit.log') if log_file else "logs/security_audit.log"
        logger.add(
            security_log_file,
            format="{time:YYYY-MM-DD HH:mm:ss.SSS} | {level: <8} | SECURITY | {name}:{function}:{line} | {message}",
            level="INFO",
            rotation="50 MB",
            retention="90 days",  # Keep security logs longer
            compression="gz",
            serialize=True,
            filter=lambda record: "security" in record["name"] or "audit" in record.get("extra", {}).get("type", "")
        )
        
        # Performance metrics log
        performance_log_file = str(Path(log_file).parent / 'performance.log') if log_file else "logs/performance.log"
        logger.add(
            performance_log_file,
            format="{time:YYYY-MM-DD HH:mm:ss.SSS} | PERFORMANCE | {message}",
            level="INFO",
            rotation="50 MB",
            retention="7 days",
            compression="gz",
            serialize=True,
            filter=lambda record: record.get("extra", {}).get("type") == "performance"
        )
        
        # Error log file
        error_log_file = str(Path(log_file).parent / 'error.log') if log_file else "logs/error.log"
        logger.add(
            error_log_file,
            format="{time:YYYY-MM-DD HH:mm:ss.SSS} | {level: <8} | {name}:{function}:{line} | {message}",
            level="ERROR",
            rotation="50 MB",
            retention="30 days",
            compression="gz",
            serialize=True,
            backtrace=True,
            diagnose=True
        )
        
    else:
        # Development logging with colorized output
        logger.add(
            sys.stdout,
            format="<green>{time:YYYY-MM-DD HH:mm:ss.SSS}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> | <level>{message}</level>",
            level=log_level,
            colorize=True,
            backtrace=True,
            diagnose=True
        )
    
    # Log configuration applied
    logger.info(
        "Logging configured",
        environment=environment,
        log_level=log_level,
        log_file=log_file
    )

def get_security_logger():
    """Get security audit logger."""
    return logger.bind(type="security")

def get_performance_logger():
    """Get performance metrics logger."""
    return logger.bind(type="performance")

# Performance monitoring decorator
def log_performance(operation_name: str):
    """Decorator to log performance metrics for functions."""
    def decorator(func):
        def wrapper(*args, **kwargs):
            perf_logger = get_performance_logger()
            start_time = datetime.utcnow()
            
            try:
                result = func(*args, **kwargs)
                
                end_time = datetime.utcnow()
                duration_ms = (end_time - start_time).total_seconds() * 1000
                
                perf_logger.info(
                    f"Operation completed: {operation_name}",
                    operation=operation_name,
                    duration_ms=round(duration_ms, 2),
                    status="success",
                    start_time=start_time.isoformat(),
                    end_time=end_time.isoformat()
                )
                
                return result
                
            except Exception as e:
                end_time = datetime.utcnow()
                duration_ms = (end_time - start_time).total_seconds() * 1000
                
                perf_logger.error(
                    f"Operation failed: {operation_name}",
                    operation=operation_name,
                    duration_ms=round(duration_ms, 2),
                    status="error",
                    error=str(e),
                    start_time=start_time.isoformat(),
                    end_time=end_time.isoformat()
                )
                raise
                
        return wrapper
    return decorator
