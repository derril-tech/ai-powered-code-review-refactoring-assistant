"""
Proposals API endpoints.

This module provides endpoints for managing auto-fix proposals,
including confidence scoring and application of fixes.
"""

from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from pydantic import BaseModel

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.models.analysis import AnalysisFinding
from app.models.proposal import Proposal, ProposalStatus, ProposalType
from app.schemas.proposal import ProposalCreate, ProposalResponse, ProposalUpdate
from app.services.proposal_service import ProposalService
from app.services.github_service import GitHubService
from loguru import logger

router = APIRouter()

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
    message: str

@router.get("/", response_model=List[ProposalResponse])
async def list_proposals(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    analysis_id: Optional[int] = None,
    finding_id: Optional[int] = None,
    status: Optional[ProposalStatus] = None,
    confidence_min: Optional[float] = None,
    page: int = 1,
    size: int = 20
) -> List[ProposalResponse]:
    """
    List proposals with filtering and pagination.
    
    Supports filtering by analysis, finding, status, and confidence score.
    """
    # TODO: Implement proposal listing with filters
    return []

@router.get("/{proposal_id}", response_model=ProposalResponse)
async def get_proposal(
    proposal_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> ProposalResponse:
    """
    Get proposal details by ID.
    """
    # TODO: Implement proposal retrieval
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Proposal not found"
    )

@router.post("/{proposal_id}/apply", response_model=ProposalApplyResponse)
async def apply_proposal(
    proposal_id: int,
    request: ProposalApplyRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    background_tasks: BackgroundTasks = None
) -> ProposalApplyResponse:
    """
    Apply a proposal fix.
    
    Can either apply directly to the codebase or create a pull request.
    """
    try:
        # Get the proposal
        proposal = await _get_proposal_by_id(db, proposal_id, current_user.id)
        if not proposal:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Proposal not found"
            )
        
        # Check if proposal can be applied
        if proposal.status != ProposalStatus.PENDING:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Proposal cannot be applied in current status"
            )
        
        # Apply the proposal
        proposal_service = ProposalService()
        github_service = GitHubService()
        
        if request.auto_apply:
            # Apply directly to the codebase
            result = await proposal_service.apply_proposal_direct(
                proposal, current_user, db
            )
            
            return ProposalApplyResponse(
                success=True,
                proposal=ProposalResponse.from_orm(proposal),
                message="Proposal applied successfully"
            )
        
        elif request.create_pr:
            # Create a pull request
            pr_result = await github_service.create_proposal_pr(
                proposal, 
                current_user,
                request.pr_title,
                request.pr_description
            )
            
            return ProposalApplyResponse(
                success=True,
                proposal=ProposalResponse.from_orm(proposal),
                pr_url=pr_result.get("pr_url"),
                message="Pull request created successfully"
            )
        
        else:
            # Just mark as applied
            proposal.status = ProposalStatus.APPLIED
            await db.commit()
            
            return ProposalApplyResponse(
                success=True,
                proposal=ProposalResponse.from_orm(proposal),
                message="Proposal marked as applied"
            )
            
    except Exception as e:
        logger.error(f"Failed to apply proposal: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to apply proposal"
        )

@router.post("/{proposal_id}/reject")
async def reject_proposal(
    proposal_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> dict:
    """
    Reject a proposal.
    """
    try:
        proposal = await _get_proposal_by_id(db, proposal_id, current_user.id)
        if not proposal:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Proposal not found"
            )
        
        proposal.status = ProposalStatus.REJECTED
        await db.commit()
        
        return {"message": "Proposal rejected successfully"}
        
    except Exception as e:
        logger.error(f"Failed to reject proposal: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to reject proposal"
        )

@router.get("/{proposal_id}/preview")
async def preview_proposal(
    proposal_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> dict:
    """
    Preview the changes that would be made by applying a proposal.
    """
    try:
        proposal = await _get_proposal_by_id(db, proposal_id, current_user.id)
        if not proposal:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Proposal not found"
            )
        
        # Generate preview
        proposal_service = ProposalService()
        preview = await proposal_service.generate_preview(proposal)
        
        return {
            "proposal_id": proposal_id,
            "preview": preview,
            "confidence_score": proposal.confidence_score,
            "estimated_impact": proposal.estimated_impact
        }
        
    except Exception as e:
        logger.error(f"Failed to generate proposal preview: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate preview"
        )

async def _get_proposal_by_id(db: AsyncSession, proposal_id: int, user_id: int) -> Optional[Proposal]:
    """Get proposal by ID for user."""
    try:
        from sqlalchemy.orm import selectinload
        from sqlalchemy import select
        
        result = await db.execute(
            select(Proposal)
            .options(
                selectinload(Proposal.finding)
                .selectinload(AnalysisFinding.analysis)
            )
            .where(
                Proposal.id == proposal_id,
                Proposal.finding.has(
                    AnalysisFinding.analysis.has(
                        Analysis.user_id == user_id
                    )
                )
            )
        )
        return result.scalar_one_or_none()
        
    except Exception as e:
        logger.error(f"Error getting proposal by ID: {e}")
        return None



