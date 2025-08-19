from sqlalchemy import Column, String, Text, Integer, Float, Boolean, JSON, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import VECTOR
import enum
from app.db.base import Base, TimestampMixin

class AnalysisStatus(str, enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

class FindingSeverity(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class FindingType(str, enum.Enum):
    BUG = "bug"
    SECURITY = "security"
    PERFORMANCE = "performance"
    CODE_SMELL = "code_smell"
    REFACTORING = "refactoring"
    STYLE = "style"
    DOCUMENTATION = "documentation"

class Analysis(Base, TimestampMixin):
    __tablename__ = "analyses"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Repository information
    repo_url = Column(String(500), nullable=False)
    repo_name = Column(String(255), nullable=False)
    branch = Column(String(100), default="main", nullable=False)
    commit_sha = Column(String(100), nullable=False)
    commit_message = Column(Text, nullable=True)
    
    # Analysis configuration
    language = Column(String(50), nullable=False)
    analysis_type = Column(String(50), default="full", nullable=False)  # full, security, performance, etc.
    custom_rules = Column(JSON, nullable=True)
    
    # Status and progress
    status = Column(Enum(AnalysisStatus), default=AnalysisStatus.PENDING, nullable=False)
    progress = Column(Float, default=0.0, nullable=False)
    total_files = Column(Integer, default=0, nullable=False)
    processed_files = Column(Integer, default=0, nullable=False)
    
    # Results
    summary = Column(Text, nullable=True)
    total_findings = Column(Integer, default=0, nullable=False)
    critical_findings = Column(Integer, default=0, nullable=False)
    high_findings = Column(Integer, default=0, nullable=False)
    medium_findings = Column(Integer, default=0, nullable=False)
    low_findings = Column(Integer, default=0, nullable=False)
    
    # Metadata
    processing_time = Column(Float, nullable=True)  # in seconds
    error_message = Column(Text, nullable=True)
    ai_model_used = Column(String(100), nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="analyses")
    findings = relationship("AnalysisFinding", back_populates="analysis", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Analysis(id={self.id}, repo='{self.repo_name}', status='{self.status}')>"

class AnalysisFinding(Base, TimestampMixin):
    __tablename__ = "analysis_findings"
    
    id = Column(Integer, primary_key=True, index=True)
    analysis_id = Column(Integer, ForeignKey("analyses.id"), nullable=False)
    
    # Finding details
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    severity = Column(Enum(FindingSeverity), nullable=False)
    finding_type = Column(Enum(FindingType), nullable=False)
    
    # Code location
    file_path = Column(String(500), nullable=False)
    line_number = Column(Integer, nullable=True)
    column_number = Column(Integer, nullable=True)
    code_snippet = Column(Text, nullable=True)
    
    # AI analysis
    ai_explanation = Column(Text, nullable=True)
    suggested_fix = Column(Text, nullable=True)
    confidence_score = Column(Float, nullable=True)
    
    # Vector embedding for similarity search
    embedding = Column(VECTOR(1536), nullable=True)  # OpenAI embedding dimension
    
    # Metadata
    rule_id = Column(String(100), nullable=True)
    tags = Column(JSON, nullable=True)
    is_auto_fixable = Column(Boolean, default=False, nullable=False)
    
    # Relationships
    analysis = relationship("Analysis", back_populates="findings")
    
    def __repr__(self):
        return f"<AnalysisFinding(id={self.id}, severity='{self.severity}', type='{self.finding_type}')>"
