from sqlalchemy import Column, String, Text, Integer, JSON, ForeignKey, Enum, Boolean
from sqlalchemy.orm import relationship
import enum
from app.db.base import Base, TimestampMixin

class EventType(str, enum.Enum):
    # Analysis events
    ANALYSIS_STARTED = "analysis_started"
    ANALYSIS_COMPLETED = "analysis_completed"
    ANALYSIS_FAILED = "analysis_failed"
    
    # Repository events
    REPO_CONNECTED = "repo_connected"
    REPO_DISCONNECTED = "repo_disconnected"
    WEBHOOK_RECEIVED = "webhook_received"
    
    # Proposal events
    PROPOSAL_CREATED = "proposal_created"
    PROPOSAL_APPLIED = "proposal_applied"
    PROPOSAL_REJECTED = "proposal_rejected"
    PR_CREATED = "pr_created"
    
    # User events
    USER_LOGIN = "user_login"
    USER_LOGOUT = "user_logout"
    USER_REGISTERED = "user_registered"
    
    # System events
    SYSTEM_ERROR = "system_error"
    RATE_LIMIT_EXCEEDED = "rate_limit_exceeded"
    SECURITY_VIOLATION = "security_violation"

class EventSeverity(str, enum.Enum):
    DEBUG = "debug"
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"
    CRITICAL = "critical"

class Event(Base, TimestampMixin):
    __tablename__ = "events"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Event identification
    event_type = Column(Enum(EventType), nullable=False)
    severity = Column(Enum(EventSeverity), default=EventSeverity.INFO, nullable=False)
    
    # Context
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    analysis_id = Column(Integer, ForeignKey("analyses.id"), nullable=True)
    repository_id = Column(Integer, ForeignKey("repositories.id"), nullable=True)
    proposal_id = Column(Integer, ForeignKey("proposals.id"), nullable=True)
    
    # Event data
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    payload_json = Column(JSON, nullable=True)  # Additional event data
    
    # Source information
    source_ip = Column(String(45), nullable=True)  # IPv6 compatible
    user_agent = Column(String(500), nullable=True)
    session_id = Column(String(255), nullable=True)
    
    # Processing
    processed = Column(Boolean, default=False, nullable=False)
    processed_at = Column(String(50), nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="events")
    analysis = relationship("Analysis", back_populates="events")
    repository = relationship("Repository", back_populates="events")
    proposal = relationship("Proposal", back_populates="events")
    
    def __repr__(self):
        return f"<Event(id={self.id}, type='{self.event_type}', severity='{self.severity}')>"


class AuditLog(Base, TimestampMixin):
    """Audit log for security and compliance tracking."""
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Event identification
    event_type = Column(Enum(EventType), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Event details
    details = Column(JSON, nullable=False)  # Event-specific data
    ip_address = Column(String(45), nullable=True)  # IPv6 compatible
    user_agent = Column(String(500), nullable=True)
    success = Column(Boolean, nullable=False)
    
    # Relationships
    user = relationship("User")
    
    def __repr__(self):
        return f"<AuditLog(id={self.id}, type='{self.event_type}', success={self.success})>"
