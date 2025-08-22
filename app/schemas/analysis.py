from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from app.schemas.common import AnalysisStatus, FindingSeverity, FindingType, AnalysisType, SupportedLanguage

class AnalysisBase(BaseModel):
    """Base analysis schema."""
    repo_url: str = Field(..., description="Repository URL")
    branch: str = Field("main", description="Branch to analyze")
    commit_sha: str = Field(..., description="Commit SHA to analyze")
    language: SupportedLanguage
    analysis_type: AnalysisType = AnalysisType.FULL
    custom_rules: Optional[Dict[str, Any]] = None

class AnalysisCreate(AnalysisBase):
    """Schema for creating a new analysis."""
    pass

class AnalysisRequest(BaseModel):
    """Schema for analysis request."""
    repo_url: Optional[str] = Field(None, description="Repository URL")
    branch: Optional[str] = Field("main", description="Branch to analyze")
    commit_sha: Optional[str] = Field(None, description="Commit SHA to analyze")
    language: SupportedLanguage
    analysis_type: AnalysisType = AnalysisType.FULL
    custom_rules: Optional[Dict[str, Any]] = None

class AnalysisUpdate(BaseModel):
    """Schema for updating analysis."""
    status: Optional[AnalysisStatus] = None
    progress: Optional[float] = Field(None, ge=0.0, le=100.0)
    summary: Optional[str] = None
    error_message: Optional[str] = None

class AnalysisResponse(AnalysisBase):
    """Schema for analysis response."""
    id: int
    user_id: int
    repo_name: str
    commit_message: Optional[str] = None
    status: AnalysisStatus
    progress: float
    total_files: int
    processed_files: int
    summary: Optional[str] = None
    total_findings: int
    critical_findings: int
    high_findings: int
    medium_findings: int
    low_findings: int
    processing_time: Optional[float] = None
    error_message: Optional[str] = None
    ai_model_used: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class FindingBase(BaseModel):
    """Base finding schema."""
    title: str = Field(..., max_length=255)
    description: str
    severity: FindingSeverity
    finding_type: FindingType
    file_path: str = Field(..., max_length=500)
    line_number: Optional[int] = Field(None, ge=1)
    column_number: Optional[int] = Field(None, ge=1)
    code_snippet: Optional[str] = None
    ai_explanation: Optional[str] = None
    suggested_fix: Optional[str] = None
    confidence_score: Optional[float] = Field(None, ge=0.0, le=1.0)
    rule_id: Optional[str] = None
    tags: Optional[List[str]] = None
    is_auto_fixable: bool = False

class FindingCreate(FindingBase):
    """Schema for creating a finding."""
    analysis_id: int

class FindingResponse(FindingBase):
    """Schema for finding response."""
    id: int
    analysis_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class AnalysisWithFindings(AnalysisResponse):
    """Schema for analysis with included findings."""
    findings: List[FindingResponse] = []

class AnalysisListResponse(BaseModel):
    """Schema for paginated analysis list response."""
    items: List[AnalysisResponse]
    total: int
    page: int
    size: int
    pages: int

class AnalysisFilter(BaseModel):
    """Schema for analysis filtering."""
    status: Optional[AnalysisStatus] = None
    language: Optional[SupportedLanguage] = None
    analysis_type: Optional[AnalysisType] = None
    severity: Optional[FindingSeverity] = None
    finding_type: Optional[FindingType] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None

class WebhookPayload(BaseModel):
    """Schema for webhook payload from GitHub/GitLab."""
    repository: Dict[str, Any]
    commits: List[Dict[str, Any]]
    ref: str
    before: str
    after: str
    sender: Dict[str, Any]
