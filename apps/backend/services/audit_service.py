"""
Audit logging service for security and compliance.

This service provides comprehensive audit logging for webhook events,
security violations, and other critical system activities.
"""

from typing import Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.event import AuditLog, EventType
from app.core.config import settings
from loguru import logger
import json
from datetime import datetime


class AuditService:
    """Service for audit logging and security monitoring."""
    
    async def log_webhook_event(
        self,
        db: AsyncSession,
        provider: str,
        event_type: str,
        repo_name: str,
        client_ip: str,
        user_id: Optional[int] = None,
        success: bool = True,
        error_message: Optional[str] = None,
        additional_data: Optional[Dict[str, Any]] = None
    ) -> None:
        """
        Log webhook event for audit purposes.
        
        Args:
            db: Database session
            provider: Git provider (github, gitlab)
            event_type: Webhook event type (push, pull_request, etc.)
            repo_name: Repository name
            client_ip: Client IP address
            user_id: User ID if available
            success: Whether the event was processed successfully
            error_message: Error message if event failed
            additional_data: Additional event data
        """
        try:
            audit_data = {
                "provider": provider,
                "event_type": event_type,
                "repo_name": repo_name,
                "client_ip": client_ip,
                "success": success,
                "timestamp": datetime.utcnow().isoformat()
            }
            
            if error_message:
                audit_data["error_message"] = error_message
            
            if additional_data:
                audit_data.update(additional_data)
            
            # Create audit log entry
            audit_log = AuditLog(
                user_id=user_id,
                event_type=EventType.WEBHOOK_RECEIVED,
                details=audit_data,
                ip_address=client_ip,
                success=success
            )
            
            db.add(audit_log)
            await db.commit()
            
            # Also log to application logs
            log_level = "info" if success else "error"
            logger.log(
                log_level,
                f"Webhook event: {provider} {event_type} from {repo_name} "
                f"(IP: {client_ip}, Success: {success})"
            )
            
        except Exception as e:
            logger.error(f"Failed to log webhook event: {e}")
    
    async def log_security_violation(
        self,
        db: AsyncSession,
        violation_type: str,
        client_ip: str,
        details: Dict[str, Any],
        user_id: Optional[int] = None
    ) -> None:
        """
        Log security violation for monitoring and alerting.
        
        Args:
            db: Database session
            violation_type: Type of security violation
            client_ip: Client IP address
            details: Violation details
            user_id: User ID if available
        """
        try:
            audit_data = {
                "violation_type": violation_type,
                "client_ip": client_ip,
                "timestamp": datetime.utcnow().isoformat(),
                **details
            }
            
            # Create audit log entry
            audit_log = AuditLog(
                user_id=user_id,
                event_type=EventType.SECURITY_VIOLATION,
                details=audit_data,
                ip_address=client_ip,
                success=False
            )
            
            db.add(audit_log)
            await db.commit()
            
            # Log security violation with high priority
            logger.warning(
                f"Security violation: {violation_type} from {client_ip} "
                f"(Details: {json.dumps(details, default=str)})"
            )
            
        except Exception as e:
            logger.error(f"Failed to log security violation: {e}")
    
    async def log_rate_limit_exceeded(
        self,
        db: AsyncSession,
        identifier: str,
        client_ip: str,
        limit: int,
        current_count: int,
        user_id: Optional[int] = None
    ) -> None:
        """
        Log rate limit exceeded event.
        
        Args:
            db: Database session
            identifier: Rate limit identifier
            client_ip: Client IP address
            limit: Rate limit threshold
            current_count: Current request count
            user_id: User ID if available
        """
        try:
            audit_data = {
                "identifier": identifier,
                "limit": limit,
                "current_count": current_count,
                "client_ip": client_ip,
                "timestamp": datetime.utcnow().isoformat()
            }
            
            # Create audit log entry
            audit_log = AuditLog(
                user_id=user_id,
                event_type=EventType.RATE_LIMIT_EXCEEDED,
                details=audit_data,
                ip_address=client_ip,
                success=False
            )
            
            db.add(audit_log)
            await db.commit()
            
            logger.warning(
                f"Rate limit exceeded: {identifier} from {client_ip} "
                f"({current_count}/{limit})"
            )
            
        except Exception as e:
            logger.error(f"Failed to log rate limit event: {e}")
    
    async def log_analysis_started(
        self,
        db: AsyncSession,
        analysis_id: int,
        repo_name: str,
        provider: str,
        event_type: str,
        user_id: int,
        trigger_source: str = "webhook"
    ) -> None:
        """
        Log analysis start event.
        
        Args:
            db: Database session
            analysis_id: Analysis ID
            repo_name: Repository name
            provider: Git provider
            event_type: Event type that triggered analysis
            user_id: User ID
            trigger_source: Source of analysis trigger
        """
        try:
            audit_data = {
                "analysis_id": analysis_id,
                "repo_name": repo_name,
                "provider": provider,
                "event_type": event_type,
                "trigger_source": trigger_source,
                "timestamp": datetime.utcnow().isoformat()
            }
            
            # Create audit log entry
            audit_log = AuditLog(
                user_id=user_id,
                event_type=EventType.ANALYSIS_STARTED,
                details=audit_data,
                success=True
            )
            
            db.add(audit_log)
            await db.commit()
            
            logger.info(
                f"Analysis started: {analysis_id} for {repo_name} "
                f"(Provider: {provider}, Trigger: {trigger_source})"
            )
            
        except Exception as e:
            logger.error(f"Failed to log analysis started event: {e}")


# Global audit service instance
audit_service = AuditService()