"""
Code analysis API endpoints.

This module provides endpoints for code analysis operations, including:
- Create new analysis
- Get analysis status and results
- List user analyses
- Get analysis findings
"""

from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from typing import List, Optional
import uuid
import asyncio
from loguru import logger

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.models.analysis import Analysis, AnalysisStatus, Finding
from app.models.repository import Repository
from app.schemas.analysis import (
    AnalysisRequest, 
    AnalysisResponse, 
    AnalysisListResponse,
    FindingResponse
)
from app.services.ai_service import ai_service
from app.services.git_operations import GitService
from app.workers.analysis_worker import start_analysis_worker

router = APIRouter()

@router.post("/", response_model=AnalysisResponse, status_code=status.HTTP_202_ACCEPTED)
async def create_analysis(
    analysis_request: AnalysisRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Analysis:
    """
    Create a new code analysis.
    
    Initiates an AI-powered analysis of the specified repository or code.
    The analysis runs asynchronously and progress can be tracked via WebSocket.
    """
    # Create analysis record
    analysis = Analysis(
        user_id=current_user.id,
        repo_url=str(analysis_request.repo_url) if analysis_request.repo_url else None,
        branch=analysis_request.branch,
        commit_sha=analysis_request.commit_sha,
        language=analysis_request.language,
        analysis_type=analysis_request.analysis_type,
        status=AnalysisStatus.PENDING,
        custom_rules=analysis_request.custom_rules or {}
    )
    
    try:
        db.add(analysis)
        await db.commit()
        await db.refresh(analysis)
        
        # Start background analysis task
        background_tasks.add_task(
            perform_analysis,
            analysis.id,
            analysis_request,
            current_user.id
        )
        
        return analysis
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create analysis"
        )

@router.get("/", response_model=AnalysisListResponse)
async def list_analyses(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    page: int = 1,
    size: int = 20,
    status_filter: Optional[AnalysisStatus] = None,
    language: Optional[str] = None,
    analysis_type: Optional[str] = None
) -> dict:
    """
    List user's analyses with pagination and filtering.
    
    Returns a paginated list of analyses performed by the current user.
    Supports filtering by status, language, and analysis type.
    """
    try:
        # Build base query
        query = select(Analysis).where(Analysis.user_id == current_user.id)
        
        # Apply filters
        if status_filter:
            query = query.where(Analysis.status == status_filter)
        if language:
            query = query.where(Analysis.language == language)
        if analysis_type:
            query = query.where(Analysis.analysis_type == analysis_type)
        
        # Get total count
        count_query = select(func.count()).select_from(query.subquery())
        total_result = await db.execute(count_query)
        total = total_result.scalar()
        
        # Apply pagination
        offset = (page - 1) * size
        query = query.order_by(Analysis.created_at.desc()).offset(offset).limit(size)
        
        # Execute query
        result = await db.execute(query)
        analyses = result.scalars().all()
        
        # Calculate pagination info
        pages = (total + size - 1) // size
        
        return {
            "analyses": analyses,
            "total": total,
            "page": page,
            "size": size,
            "pages": pages
        }
        
    except Exception as e:
        logger.error(f"Failed to list analyses: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve analyses"
        )

@router.get("/{analysis_id}", response_model=AnalysisResponse)
async def get_analysis(
    analysis_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Analysis:
    """
    Get analysis details by ID.
    
    Returns the complete analysis information including status, progress,
    and summary of findings.
    """
    try:
        # Query for the analysis
        query = select(Analysis).where(
            and_(
                Analysis.id == analysis_id,
                Analysis.user_id == current_user.id
            )
        )
        result = await db.execute(query)
        analysis = result.scalar_one_or_none()
        
        if not analysis:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Analysis not found"
            )
            
        return analysis
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to retrieve analysis {analysis_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve analysis"
        )

@router.get("/{analysis_id}/findings")
async def get_analysis_findings(
    analysis_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    severity: Optional[str] = None,
    finding_type: Optional[str] = None,
    page: int = 1,
    size: int = 20
) -> dict:
    """
    Get analysis findings with filtering and pagination.
    
    Returns the findings discovered during the analysis, with support for
    filtering by severity and finding type.
    """
    try:
        # First verify the analysis exists and belongs to the user
        analysis_query = select(Analysis).where(
            and_(
                Analysis.id == analysis_id,
                Analysis.user_id == current_user.id
            )
        )
        analysis_result = await db.execute(analysis_query)
        analysis = analysis_result.scalar_one_or_none()
        
        if not analysis:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Analysis not found"
            )
        
        # Build findings query
        query = select(Finding).where(Finding.analysis_id == analysis_id)
        
        # Apply filters
        if severity:
            query = query.where(Finding.severity == severity)
        if finding_type:
            query = query.where(Finding.type == finding_type)
        
        # Get total count
        count_query = select(func.count()).select_from(query.subquery())
        total_result = await db.execute(count_query)
        total = total_result.scalar()
        
        # Apply pagination
        offset = (page - 1) * size
        query = query.order_by(Finding.severity.desc(), Finding.line_number).offset(offset).limit(size)
        
        # Execute query
        result = await db.execute(query)
        findings = result.scalars().all()
        
        # Calculate pagination info
        pages = (total + size - 1) // size
        
        return {
            "findings": findings,
            "total": total,
            "page": page,
            "size": size,
            "pages": pages
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to retrieve findings for analysis {analysis_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve findings"
        )

@router.delete("/{analysis_id}")
async def delete_analysis(
    analysis_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> dict:
    """
    Cancel or delete analysis.
    
    Cancels a running analysis or deletes a completed analysis.
    Only the analysis owner can perform this action.
    """
    try:
        # Find the analysis
        query = select(Analysis).where(
            and_(
                Analysis.id == analysis_id,
                Analysis.user_id == current_user.id
            )
        )
        result = await db.execute(query)
        analysis = result.scalar_one_or_none()
        
        if not analysis:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Analysis not found"
            )
        
        # If analysis is running, cancel it; otherwise delete it
        if analysis.status in [AnalysisStatus.PENDING, AnalysisStatus.PROCESSING]:
            analysis.status = AnalysisStatus.CANCELLED
            analysis.updated_at = func.now()
            await db.commit()
            return {"message": "Analysis cancelled successfully"}
        else:
            # Delete the analysis and its findings
            await db.delete(analysis)
            await db.commit()
            return {"message": "Analysis deleted successfully"}
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete analysis {analysis_id}: {e}")
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete analysis"
        )

async def perform_analysis(
    analysis_id: int,
    analysis_request: AnalysisRequest,
    user_id: int
) -> None:
    """
    Background task to perform the actual code analysis.
    
    This function runs asynchronously and updates the analysis status
    and progress as it processes the code.
    """
    from app.db.session import AsyncSessionLocal
    
    async with AsyncSessionLocal() as db:
        try:
            # Get the analysis record
            query = select(Analysis).where(Analysis.id == analysis_id)
            result = await db.execute(query)
            analysis = result.scalar_one_or_none()
            
            if not analysis:
                logger.error(f"Analysis {analysis_id} not found")
                return
            
            # Update status to processing
            analysis.status = AnalysisStatus.PROCESSING
            analysis.progress = 10
            await db.commit()
            
            # Fetch code from repository or use uploaded content
            code_files = {}
            git_service = GitService()
            
            if analysis.repo_url:
                # Clone repository and get files
                try:
                    repo_path = await git_service.clone_repository(
                        analysis.repo_url,
                        branch=analysis.branch or "main"
                    )
                    
                    # Get code files based on language filter
                    code_files = await git_service.get_code_files(
                        repo_path,
                        language=analysis.language
                    )
                    
                    analysis.progress = 30
                    await db.commit()
                    
                except Exception as e:
                    logger.error(f"Failed to clone repository: {e}")
                    analysis.status = AnalysisStatus.FAILED
                    analysis.error_message = f"Failed to access repository: {str(e)}"
                    await db.commit()
                    return
            
            # Perform AI analysis on code files
            all_findings = []
            total_files = len(code_files)
            
            for i, (file_path, code_content) in enumerate(code_files.items()):
                if len(code_content.strip()) == 0:
                    continue
                    
                try:
                    # Analyze this file
                    result = await ai_service.analyze_code(
                        code=code_content,
                        language=analysis.language or "mixed",
                        analysis_type=analysis.analysis_type or "full",
                        context=f"File: {file_path}"
                    )
                    
                    if result["success"]:
                        # Convert findings to database records
                        for finding_data in result.get("findings", []):
                            finding = Finding(
                                analysis_id=analysis_id,
                                file_path=file_path,
                                title=finding_data.get("title", "Unknown Issue"),
                                description=finding_data.get("description", ""),
                                severity=finding_data.get("severity", "medium"),
                                type=finding_data.get("type", "code_smell"),
                                line_number=finding_data.get("line_number", 1),
                                suggested_fix=finding_data.get("suggested_fix", ""),
                                confidence_score=finding_data.get("confidence", 0.5)
                            )
                            db.add(finding)
                            all_findings.append(finding)
                    
                    # Update progress
                    progress = 30 + int((i + 1) / total_files * 60)
                    analysis.progress = min(progress, 90)
                    await db.commit()
                    
                except Exception as e:
                    logger.error(f"Failed to analyze file {file_path}: {e}")
                    continue
            
            # Update analysis with summary
            analysis.status = AnalysisStatus.COMPLETED
            analysis.progress = 100
            analysis.completed_at = func.now()
            
            # Calculate summary statistics
            total_findings = len(all_findings)
            critical_count = sum(1 for f in all_findings if f.severity == "critical")
            high_count = sum(1 for f in all_findings if f.severity == "high")
            medium_count = sum(1 for f in all_findings if f.severity == "medium")
            low_count = sum(1 for f in all_findings if f.severity == "low")
            
            analysis.summary = {
                "total_findings": total_findings,
                "critical": critical_count,
                "high": high_count,
                "medium": medium_count,
                "low": low_count,
                "files_analyzed": total_files
            }
            
            await db.commit()
            
            logger.info(f"Analysis {analysis_id} completed with {total_findings} findings")
            
        except Exception as e:
            logger.error(f"Analysis {analysis_id} failed: {e}")
            
            # Update analysis status to failed
            try:
                analysis.status = AnalysisStatus.FAILED
                analysis.error_message = str(e)
                analysis.progress = 0
                await db.commit()
            except:
                pass
