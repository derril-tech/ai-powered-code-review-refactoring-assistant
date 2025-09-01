from sqlalchemy import Column, String, Text, Integer, Float, Boolean, JSON, ForeignKey, Enum
from sqlalchemy.orm import relationship
import enum
from app.db.base import Base, TimestampMixin

class ProposalStatus(str, enum.Enum):
    PENDING = "pending"
    VALIDATING = "validating"
    APPLYING = "applying"
    APPLIED = "applied"
    REJECTED = "rejected"
    FAILED = "failed"
    PR_CREATED = "pr_created"

class ProposalType(str, enum.Enum):
    BUG_FIX = "bug_fix"
    SECURITY_FIX = "security_fix"
    PERFORMANCE_IMPROVEMENT = "performance_improvement"
    CODE_QUALITY = "code_quality"
    REFACTORING = "refactoring"
    DOCUMENTATION = "documentation"

class Proposal(Base, TimestampMixin):
    __tablename__ = "proposals"
    
    id = Column(Integer, primary_key=True, index=True)
    finding_id = Column(Integer, ForeignKey("analysis_findings.id"), nullable=False)
    
    # Proposal details
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    proposal_type = Column(Enum(ProposalType), nullable=False)
    
    # Code changes
    patch_diff = Column(Text, nullable=False)  # Git diff format
    test_patch_diff = Column(Text, nullable=True)  # Test changes if applicable
    
    # Confidence and impact scoring
    confidence_score = Column(Float, nullable=False)  # 0.0 to 1.0
    estimated_impact = Column(String(50), nullable=True)  # low, medium, high
    risk_score = Column(Float, nullable=True)  # 0.0 to 1.0
    
    # Application tracking
    status = Column(Enum(ProposalStatus), default=ProposalStatus.PENDING, nullable=False)
    applied_at = Column(String(50), nullable=True)
    applied_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Validation and application details
    validation_errors = Column(JSON, nullable=True)  # Safety validation issues
    application_log = Column(Text, nullable=True)  # Application process log
    rollback_info = Column(JSON, nullable=True)  # Rollback information if needed
    
    # Git integration
    pr_url = Column(String(500), nullable=True)
    pr_number = Column(Integer, nullable=True)
    commit_sha = Column(String(100), nullable=True)
    
    # Metadata
    ai_model_used = Column(String(100), nullable=True)
    processing_time = Column(Float, nullable=True)  # in seconds
    tags = Column(JSON, nullable=True)
    
    # Relationships
    finding = relationship("AnalysisFinding", back_populates="proposals")
    applied_by_user = relationship("User", foreign_keys=[applied_by])
    
    def __repr__(self):
        return f"<Proposal(id={self.id}, type='{self.proposal_type}', confidence={self.confidence_score})>"



