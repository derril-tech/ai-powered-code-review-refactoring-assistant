"""
Repository management API endpoints.

This module provides endpoints for connecting and managing Git repositories,
including GitHub, GitLab, and Bitbucket integration.
"""

from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from pydantic import BaseModel, HttpUrl

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.models.repository import Repository, RepositoryProvider, RepositoryStatus
from app.schemas.repository import RepositoryCreate, RepositoryResponse, RepositoryUpdate
from app.services.github_service import GitHubService
from app.services.gitlab_service import GitLabService
from loguru import logger

router = APIRouter()

class RepositoryConnectRequest(BaseModel):
    provider: RepositoryProvider
    repository_url: HttpUrl
    access_token: Optional[str] = None
    webhook_enabled: bool = True

class RepositoryConnectResponse(BaseModel):
    success: bool
    repository: Optional[RepositoryResponse] = None
    message: str
    webhook_url: Optional[str] = None

@router.post("/connect", response_model=RepositoryConnectResponse)
async def connect_repository(
    request: RepositoryConnectRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    background_tasks: BackgroundTasks = None
) -> RepositoryConnectResponse:
    """
    Connect a Git repository for analysis.
    
    Supports GitHub, GitLab, and Bitbucket repositories.
    Sets up webhooks for automatic analysis triggers.
    """
    try:
        # Extract repository information from URL
        repo_info = _extract_repo_info(str(request.repository_url), request.provider)
        
        # Check if repository already exists for this user
        existing_repo = await _get_repository_by_url(db, current_user.id, str(request.repository_url))
        if existing_repo:
            return RepositoryConnectResponse(
                success=False,
                message="Repository already connected"
            )
        
        # Create repository record
        repository = Repository(
            user_id=current_user.id,
            provider=request.provider,
            external_id=repo_info["external_id"],
            name=repo_info["name"],
            full_name=repo_info["full_name"],
            description=repo_info.get("description"),
            default_branch=repo_info.get("default_branch", "main"),
            private=repo_info.get("private", False),
            fork=repo_info.get("fork", False),
            status=RepositoryStatus.PENDING
        )
        
        db.add(repository)
        await db.commit()
        await db.refresh(repository)
        
        # Set up webhook if enabled
        webhook_url = None
        if request.webhook_enabled:
            webhook_url = await _setup_webhook(db, repository, request.access_token)
        
        # Update repository status
        repository.status = RepositoryStatus.ACTIVE
        await db.commit()
        
        return RepositoryConnectResponse(
            success=True,
            repository=RepositoryResponse.from_orm(repository),
            message="Repository connected successfully",
            webhook_url=webhook_url
        )
        
    except Exception as e:
        logger.error(f"Failed to connect repository: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to connect repository"
        )

@router.get("/", response_model=List[RepositoryResponse])
async def list_repositories(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    provider: Optional[RepositoryProvider] = None,
    status: Optional[RepositoryStatus] = None
) -> List[RepositoryResponse]:
    """
    List user's connected repositories.
    
    Supports filtering by provider and status.
    """
    # TODO: Implement repository listing with filters
    return []

@router.get("/{repository_id}", response_model=RepositoryResponse)
async def get_repository(
    repository_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> RepositoryResponse:
    """
    Get repository details by ID.
    """
    # TODO: Implement repository retrieval
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Repository not found"
    )

@router.put("/{repository_id}", response_model=RepositoryResponse)
async def update_repository(
    repository_id: int,
    update_data: RepositoryUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> RepositoryResponse:
    """
    Update repository settings.
    """
    # TODO: Implement repository update
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Repository not found"
    )

@router.delete("/{repository_id}")
async def disconnect_repository(
    repository_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> dict:
    """
    Disconnect and remove repository.
    """
    # TODO: Implement repository disconnection
    return {"message": "Repository disconnected successfully"}

def _extract_repo_info(repo_url: str, provider: RepositoryProvider) -> dict:
    """Extract repository information from URL."""
    # TODO: Implement URL parsing for different providers
    return {
        "external_id": "12345",
        "name": "example-repo",
        "full_name": "owner/example-repo",
        "description": "Example repository",
        "default_branch": "main",
        "private": False,
        "fork": False
    }

async def _get_repository_by_url(db: AsyncSession, user_id: int, repo_url: str) -> Optional[Repository]:
    """Get repository by URL for user."""
    # TODO: Implement repository lookup
    return None

async def _setup_webhook(db: AsyncSession, repository: Repository, access_token: str) -> Optional[str]:
    """Set up webhook for repository."""
    # TODO: Implement webhook setup
    return f"https://api.example.com/webhooks/{repository.id}"


