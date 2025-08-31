"""
Proposal schemas for API requests and responses.
"""

from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
from app.models.proposal import ProposalStatus, ProposalType

class ProposalBase(BaseModel):
    title: str
    description: str
    proposal_type: ProposalType
    patch_diff: str
    test_patch_diff: Optional[str] = None
    confidence_score: float
    estimated_impact: Optional[str] = None
    risk_score: Optional[float] = None

class ProposalCreate(ProposalBase):
    finding_id: int

class ProposalUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    patch_diff: Optional[str] = None
    test_patch_diff: Optional[str] = None
    confidence_score: Optional[float] = None
    estimated_impact: Optional[str] = None
    risk_score: Optional[float] = None
    tags: Optional[Dict[str, Any]] = None

class ProposalResponse(ProposalBase):
    id: int
    finding_id: int
    status: ProposalStatus
    applied_at: Optional[str] = None
    applied_by: Optional[int] = None
    pr_url: Optional[str] = None
    pr_number: Optional[int] = None
    commit_sha: Optional[str] = None
    ai_model_used: Optional[str] = None
    processing_time: Optional[float] = None
    tags: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class ProposalApplyRequest(BaseModel):
    proposal_id: int
    auto_apply: bool = False
    create_pr: bool = True
    pr_title: Optional[str] = None
    pr_description: Optional[str] = None

class ProposalApplyResponse(BaseModel):
    success: bool
    proposal: Optional[ProposalResponse] = None
    pr_url: Optional[str] = None
    commit_sha: Optional[str] = None
    message: str

class ProposalPreviewResponse(BaseModel):
    proposal_id: int
    file_path: Optional[str] = None
    changes: List[Dict[str, str]]
    total_additions: int
    total_deletions: int
    confidence_score: float
    estimated_impact: Optional[str] = None
    risk_score: Optional[float] = None

class ProposalListResponse(BaseModel):
    proposals: List[ProposalResponse]
    total: int
    page: int
    size: int
    pages: int


