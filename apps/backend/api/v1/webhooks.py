"""
Webhook API endpoints.

This module provides endpoints for Git platform webhooks, including:
- GitHub webhook integration
- GitLab webhook integration
- Automatic analysis triggers
"""

from fastapi import APIRouter, Request, HTTPException, status, Depends
from sqlalchemy.ext.asyncio import AsyncSession
import hmac
import hashlib
import json
from typing import Optional

from app.api.deps import get_db
from app.models.user import User
from app.models.repository import Repository, RepositoryProvider
from app.models.analysis import Analysis, AnalysisStatus
from app.services.ai_service import AIService
from app.services.github_service import GitHubService
from app.services.gitlab_service import GitLabService
from app.services.rate_limit_service import rate_limit_service
from app.services.audit_service import audit_service
from app.core.config import settings
from loguru import logger
import arq
from sqlalchemy import select

router = APIRouter()

@router.post("/github")
async def github_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db)
) -> dict:
    """
    GitHub webhook endpoint for automatic analysis.
    
    Processes GitHub webhook events and triggers code analysis
    for push events to configured repositories.
    """
    # Get client IP for rate limiting
    client_ip = request.client.host if request.client else "unknown"
    
    # Verify GitHub webhook signature
    signature = request.headers.get("X-Hub-Signature-256")
    if not signature:
        logger.warning(f"Missing GitHub signature from IP: {client_ip}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing GitHub signature"
        )
    
    # Get webhook payload
    payload = await request.json()
    event_type = request.headers.get("X-GitHub-Event")
    
    # Get raw body for signature verification
    body = await request.body()
    
    # Verify signature
    if not verify_github_signature(body, signature):
        logger.warning(f"Invalid GitHub signature from IP: {client_ip}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid GitHub signature"
        )
    
    # Rate limiting check
    repo_name = payload.get("repository", {}).get("full_name", "unknown")
    rate_limit_id = f"github:{repo_name}"
    
    is_allowed, rate_info = await rate_limit_service.check_rate_limit(
        identifier=rate_limit_id,
        limit=60,  # 60 webhooks per hour per repository
        window=3600
    )
    
    if not is_allowed:
        logger.warning(f"Rate limit exceeded for GitHub webhook: {repo_name}")
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded",
            headers={"X-RateLimit-Limit": str(rate_info.get("limit", 60))}
        )
    
    # Log webhook event
    await audit_service.log_webhook_event(
        db=db,
        provider="github",
        event_type=event_type,
        repo_name=repo_name,
        client_ip=client_ip,
        success=True
    )
    
    # Process different event types
    if event_type == "push":
        result = await process_github_push(payload, db)
    elif event_type == "pull_request":
        result = await process_github_pr(payload, db)
    else:
        result = {"message": f"Event type {event_type} not supported"}
    
    return result

@router.post("/gitlab")
async def gitlab_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db)
) -> dict:
    """
    GitLab webhook endpoint for automatic analysis.
    
    Processes GitLab webhook events and triggers code analysis
    for push events to configured repositories.
    """
    # Get client IP for security logging
    client_ip = request.client.host if request.client else "unknown"
    
    # Verify GitLab webhook token
    token = request.headers.get("X-Gitlab-Token")
    if not token:
        logger.warning(f"Missing GitLab token from IP: {client_ip}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing GitLab token"
        )
    
    # Get webhook payload
    payload = await request.json()
    event_type = request.headers.get("X-Gitlab-Event")
    
    # Verify token
    if not verify_gitlab_token(token):
        logger.warning(f"Invalid GitLab token from IP: {client_ip}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid GitLab token"
        )
    
    # Rate limiting check
    repo_name = payload.get("project", {}).get("path_with_namespace", "unknown")
    rate_limit_id = f"gitlab:{repo_name}"
    
    is_allowed, rate_info = await rate_limit_service.check_rate_limit(
        identifier=rate_limit_id,
        limit=60,  # 60 webhooks per hour per repository
        window=3600
    )
    
    if not is_allowed:
        logger.warning(f"Rate limit exceeded for GitLab webhook: {repo_name}")
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded",
            headers={"X-RateLimit-Limit": str(rate_info.get("limit", 60))}
        )
    
    # Log webhook event
    await audit_service.log_webhook_event(
        db=db,
        provider="gitlab",
        event_type=event_type,
        repo_name=repo_name,
        client_ip=client_ip,
        success=True
    )
    
    # Process different event types
    if event_type == "Push Hook":
        result = await process_gitlab_push(payload, db)
    elif event_type == "Merge Request Hook":
        result = await process_gitlab_mr(payload, db)
    else:
        result = {"message": f"Event type {event_type} not supported"}
    
    return result

async def process_github_push(payload: dict, db: AsyncSession) -> dict:
    """
    Process GitHub push event.
    
    Triggers analysis for the pushed code changes.
    """
    try:
        # Extract repository information
        repo_url = payload["repository"]["html_url"]
        branch = payload["ref"].replace("refs/heads/", "")
        commit_sha = payload["after"]
        commit_message = payload["head_commit"]["message"] if payload.get("head_commit") else ""
        
        logger.info(f"Processing GitHub push event for {repo_url}, branch: {branch}")
        
        # Find repository in database
        repo_name = payload["repository"]["full_name"]
        result = await db.execute(
            select(Repository).where(
                Repository.full_name == repo_name,
                Repository.provider == RepositoryProvider.GITHUB
            )
        )
        repository = result.scalar_one_or_none()
        
        if not repository:
            logger.warning(f"Repository not found in database: {repo_name}")
            return {"message": "Repository not configured", "analysis_triggered": False}
        
        # Check if repository has auto-analysis enabled
        if not repository.settings_json or not repository.settings_json.get("auto_analyze", True):
            logger.info(f"Auto-analysis disabled for repository: {repo_name}")
            return {"message": "Auto-analysis disabled", "analysis_triggered": False}
        
        # Queue analysis job
        redis = arq.create_pool(arq.redis.RedisSettings.from_dsn(settings.ARQ_REDIS_URL))
        await redis.enqueue_job(
            'process_webhook_analysis_job',
            repo_url=repo_url,
            branch=branch,
            commit_sha=commit_sha,
            provider="github",
            event_type="push",
            user_id=repository.user_id
        )
        
        logger.info(f"Analysis job queued for {repo_url}")
        
        return {
            "message": "Push event processed",
            "repo_url": repo_url,
            "branch": branch,
            "commit_sha": commit_sha,
            "analysis_triggered": True
        }
    except KeyError as e:
        logger.error(f"Invalid GitHub payload structure: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid payload structure: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Error processing GitHub push event: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error processing webhook"
        )

async def process_github_pr(payload: dict, db: AsyncSession) -> dict:
    """
    Process GitHub pull request event.
    
    Triggers analysis for pull request changes.
    """
    try:
        # Only process opened or synchronize (updated) PRs
        action = payload.get("action")
        if action not in ["opened", "synchronize"]:
            return {"message": f"PR action '{action}' not processed", "analysis_triggered": False}
        
        # Extract PR information
        repo_url = payload["repository"]["html_url"]
        pr_number = payload["number"]
        pr_title = payload["pull_request"]["title"]
        pr_url = payload["pull_request"]["html_url"]
        head_sha = payload["pull_request"]["head"]["sha"]
        branch = payload["pull_request"]["head"]["ref"]
        
        logger.info(f"Processing GitHub PR event for {repo_url}, PR #{pr_number}")
        
        # Find repository in database
        repo_name = payload["repository"]["full_name"]
        result = await db.execute(
            select(Repository).where(
                Repository.full_name == repo_name,
                Repository.provider == RepositoryProvider.GITHUB
            )
        )
        repository = result.scalar_one_or_none()
        
        if not repository:
            logger.warning(f"Repository not found in database: {repo_name}")
            return {"message": "Repository not configured", "analysis_triggered": False}
        
        # Check if repository has auto-analysis enabled for PRs
        if not repository.settings_json or not repository.settings_json.get("auto_analyze_prs", True):
            logger.info(f"Auto-analysis for PRs disabled for repository: {repo_name}")
            return {"message": "Auto-analysis for PRs disabled", "analysis_triggered": False}
        
        # Queue analysis job for PR
        redis = arq.create_pool(arq.redis.RedisSettings.from_dsn(settings.ARQ_REDIS_URL))
        await redis.enqueue_job(
            'process_webhook_analysis_job',
            repo_url=repo_url,
            branch=branch,
            commit_sha=head_sha,
            provider="github",
            event_type="pull_request",
            user_id=repository.user_id,
            pr_number=pr_number
        )
        
        logger.info(f"PR analysis job queued for {repo_url} PR #{pr_number}")
        
        return {
            "message": "Pull request event processed",
            "repo_url": repo_url,
            "pr_number": pr_number,
            "pr_title": pr_title,
            "analysis_triggered": True
        }
    except KeyError as e:
        logger.error(f"Invalid GitHub PR payload structure: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid payload structure: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Error processing GitHub PR event: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error processing webhook"
        )

async def process_gitlab_push(payload: dict, db: AsyncSession) -> dict:
    """
    Process GitLab push event.
    
    Triggers analysis for the pushed code changes.
    """
    try:
        # Extract repository information
        repo_url = payload["project"]["web_url"]
        branch = payload["ref"].replace("refs/heads/", "")
        commit_sha = payload["after"]
        
        logger.info(f"Processing GitLab push event for {repo_url}, branch: {branch}")
        
        # Find repository in database
        repo_name = payload["project"]["path_with_namespace"]
        result = await db.execute(
            select(Repository).where(
                Repository.full_name == repo_name,
                Repository.provider == RepositoryProvider.GITLAB
            )
        )
        repository = result.scalar_one_or_none()
        
        if not repository:
            logger.warning(f"Repository not found in database: {repo_name}")
            return {"message": "Repository not configured", "analysis_triggered": False}
        
        # Check if repository has auto-analysis enabled
        if not repository.settings_json or not repository.settings_json.get("auto_analyze", True):
            logger.info(f"Auto-analysis disabled for repository: {repo_name}")
            return {"message": "Auto-analysis disabled", "analysis_triggered": False}
        
        # Queue analysis job
        redis = arq.create_pool(arq.redis.RedisSettings.from_dsn(settings.ARQ_REDIS_URL))
        await redis.enqueue_job(
            'process_webhook_analysis_job',
            repo_url=repo_url,
            branch=branch,
            commit_sha=commit_sha,
            provider="gitlab",
            event_type="push",
            user_id=repository.user_id
        )
        
        logger.info(f"Analysis job queued for {repo_url}")
        
        return {
            "message": "GitLab push event processed",
            "repo_url": repo_url,
            "branch": branch,
            "commit_sha": commit_sha,
            "analysis_triggered": True
        }
    except KeyError as e:
        logger.error(f"Invalid GitLab payload structure: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid payload structure: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Error processing GitLab push event: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error processing webhook"
        )

async def process_gitlab_mr(payload: dict, db: AsyncSession) -> dict:
    """
    Process GitLab merge request event.
    
    Triggers analysis for merge request changes.
    """
    try:
        # Only process opened or updated MRs
        action = payload["object_attributes"].get("action")
        if action not in ["open", "update"]:
            return {"message": f"MR action '{action}' not processed", "analysis_triggered": False}
        
        # Extract MR information
        repo_url = payload["project"]["web_url"]
        mr_id = payload["object_attributes"]["iid"]
        mr_title = payload["object_attributes"]["title"]
        head_sha = payload["object_attributes"]["last_commit"]["id"]
        branch = payload["object_attributes"]["source_branch"]
        
        logger.info(f"Processing GitLab MR event for {repo_url}, MR !{mr_id}")
        
        # Find repository in database
        repo_name = payload["project"]["path_with_namespace"]
        result = await db.execute(
            select(Repository).where(
                Repository.full_name == repo_name,
                Repository.provider == RepositoryProvider.GITLAB
            )
        )
        repository = result.scalar_one_or_none()
        
        if not repository:
            logger.warning(f"Repository not found in database: {repo_name}")
            return {"message": "Repository not configured", "analysis_triggered": False}
        
        # Check if repository has auto-analysis enabled for MRs
        if not repository.settings_json or not repository.settings_json.get("auto_analyze_mrs", True):
            logger.info(f"Auto-analysis for MRs disabled for repository: {repo_name}")
            return {"message": "Auto-analysis for MRs disabled", "analysis_triggered": False}
        
        # Queue analysis job for MR
        redis = arq.create_pool(arq.redis.RedisSettings.from_dsn(settings.ARQ_REDIS_URL))
        await redis.enqueue_job(
            'process_webhook_analysis_job',
            repo_url=repo_url,
            branch=branch,
            commit_sha=head_sha,
            provider="gitlab",
            event_type="merge_request",
            user_id=repository.user_id,
            pr_number=mr_id
        )
        
        logger.info(f"MR analysis job queued for {repo_url} MR !{mr_id}")
        
        return {
            "message": "GitLab merge request event processed",
            "repo_url": repo_url,
            "mr_id": mr_id,
            "mr_title": mr_title,
            "analysis_triggered": True
        }
    except KeyError as e:
        logger.error(f"Invalid GitLab MR payload structure: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid payload structure: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Error processing GitLab MR event: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error processing webhook"
        )

def verify_github_signature(payload: bytes, signature: str) -> bool:
    """
    Verify GitHub webhook signature.
    
    Validates the HMAC signature to ensure the webhook is from GitHub.
    """
    if not settings.GITHUB_WEBHOOK_SECRET:
        logger.warning("GitHub webhook secret not configured")
        return False
    
    # Remove 'sha256=' prefix if present
    if signature.startswith('sha256='):
        signature = signature[7:]
    
    # Calculate expected signature
    expected_signature = hmac.new(
        settings.GITHUB_WEBHOOK_SECRET.encode('utf-8'),
        payload,
        hashlib.sha256
    ).hexdigest()
    
    # Use constant-time comparison to prevent timing attacks
    is_valid = hmac.compare_digest(signature, expected_signature)
    
    if not is_valid:
        logger.warning(f"Invalid GitHub webhook signature received")
    
    return is_valid

def verify_gitlab_token(token: str) -> bool:
    """
    Verify GitLab webhook token.
    
    Validates the webhook token to ensure it's from the configured GitLab instance.
    """
    if not settings.GITLAB_WEBHOOK_SECRET:
        logger.warning("GitLab webhook secret not configured")
        return False
    
    # Use constant-time comparison to prevent timing attacks
    is_valid = hmac.compare_digest(token, settings.GITLAB_WEBHOOK_SECRET)
    
    if not is_valid:
        logger.warning(f"Invalid GitLab webhook token received")
    
    return is_valid
