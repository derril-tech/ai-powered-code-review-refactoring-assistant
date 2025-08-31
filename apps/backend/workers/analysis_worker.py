"""
Background worker for processing code analysis jobs.

This module provides asynchronous job processing for code analysis,
triggered by webhook events or manual analysis requests.
"""

import asyncio
from typing import Dict, Any, Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from app.db.session import get_db
from app.models.analysis import Analysis, AnalysisStatus, AnalysisFinding, FindingSeverity, FindingType
from app.models.repository import Repository, RepositoryProvider
from app.models.user import User
from app.services.ai_service import AIService
from app.services.github_service import GitHubService
from app.services.audit_service import audit_service
from app.core.config import settings
from loguru import logger
import arq
import re
import hashlib


class AnalysisWorker:
    """Worker class for processing analysis jobs."""
    
    def __init__(self):
        self.ai_service = AIService()
        self.github_service = GitHubService()
    
    async def process_webhook_analysis(
        self,
        repo_url: str,
        branch: str,
        commit_sha: str,
        provider: str,
        event_type: str,
        user_id: Optional[int] = None,
        pr_number: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Process analysis triggered by webhook event.
        
        Args:
            repo_url: Repository URL
            branch: Git branch name
            commit_sha: Commit SHA
            provider: Repository provider (github, gitlab)
            event_type: Event type (push, pull_request, merge_request)
            user_id: User ID (if available)
            pr_number: PR/MR number (if applicable)
        
        Returns:
            Analysis result dictionary
        """
        try:
            async with get_db() as db:
                # Find repository in database
                repository = await self._find_repository(db, repo_url, provider)
                if not repository:
                    logger.error(f"Repository not found: {repo_url}")
                    return {"success": False, "error": "Repository not configured"}
                
                # Check if repository has auto-analysis enabled
                if not repository.settings_json or not repository.settings_json.get("auto_analyze", True):
                    logger.info(f"Auto-analysis disabled for repository: {repo_url}")
                    return {"success": True, "message": "Auto-analysis disabled"}
                
                # Create analysis record
                analysis = await self._create_analysis_record(
                    db, repository, branch, commit_sha, pr_number
                )
                
                # Log analysis start
                await audit_service.log_analysis_started(
                    db=db,
                    analysis_id=analysis.id,
                    repo_name=repo_url,
                    provider=provider,
                    event_type=event_type,
                    user_id=repository.user_id,
                    trigger_source="webhook"
                )
                
                # Start analysis processing
                result = await self._process_analysis(db, analysis)
                
                logger.info(f"Analysis completed for {repo_url}: {result}")
                return result
                
        except Exception as e:
            logger.error(f"Error processing webhook analysis: {e}")
            return {"success": False, "error": str(e)}
    
    async def _find_repository(
        self,
        db: AsyncSession,
        repo_url: str,
        provider: str
    ) -> Optional[Repository]:
        """Find repository by URL and provider."""
        try:
            # Normalize repository URL
            normalized_url = self._normalize_repo_url(repo_url)
            
            result = await db.execute(
                select(Repository).where(
                    Repository.full_name == normalized_url,
                    Repository.provider == RepositoryProvider(provider)
                )
            )
            return result.scalar_one_or_none()
            
        except Exception as e:
            logger.error(f"Error finding repository: {e}")
            return None
    
    def _normalize_repo_url(self, repo_url: str) -> str:
        """Normalize repository URL to owner/repo format."""
        # Extract owner/repo from URL
        # Example: https://github.com/owner/repo -> owner/repo
        match = re.search(r'[/:]([^/]+)/([^/]+?)(?:\.git)?/?$', repo_url)
        if match:
            return f"{match.group(1)}/{match.group(2)}"
        return repo_url
    
    async def _create_analysis_record(
        self,
        db: AsyncSession,
        repository: Repository,
        branch: str,
        commit_sha: str,
        pr_number: Optional[int] = None
    ) -> Analysis:
        """Create new analysis record in database."""
        try:
            # Detect primary language from repository settings
            language = await self._detect_repository_language(repository)
            
            # Create analysis record
            analysis = Analysis(
                user_id=repository.user_id,
                repo_url=repository.full_name,
                repo_name=repository.name,
                branch=branch,
                commit_sha=commit_sha,
                language=language,
                analysis_type="full",
                status=AnalysisStatus.PENDING,
                progress=0.0
            )
            
            db.add(analysis)
            await db.commit()
            await db.refresh(analysis)
            
            logger.info(f"Created analysis record: {analysis.id}")
            return analysis
            
        except Exception as e:
            logger.error(f"Error creating analysis record: {e}")
            raise
    
    async def _detect_repository_language(self, repository: Repository) -> str:
        """Detect primary programming language of repository."""
        # Default language detection logic
        # This can be enhanced with actual repository analysis
        if repository.settings_json and "primary_language" in repository.settings_json:
            return repository.settings_json["primary_language"]
        
        # Default to Python for now
        return "python"
    
    async def _process_analysis(self, db: AsyncSession, analysis: Analysis) -> Dict[str, Any]:
        """Process the actual code analysis."""
        try:
            # Update status to processing
            await db.execute(
                update(Analysis)
                .where(Analysis.id == analysis.id)
                .values(status=AnalysisStatus.PROCESSING, progress=10.0)
            )
            await db.commit()
            
            # Simulate analysis processing steps
            # In a real implementation, this would:
            # 1. Clone/fetch repository code
            # 2. Parse files and create chunks
            # 3. Generate embeddings
            # 4. Run AI analysis
            # 5. Generate findings and proposals
            
            # For now, create a sample finding
            sample_finding = AnalysisFinding(
                analysis_id=analysis.id,
                title="Sample Security Finding",
                description="This is a sample finding generated by the webhook system",
                severity=FindingSeverity.MEDIUM,
                finding_type=FindingType.SECURITY,
                file_path="src/main.py",
                line_number=42,
                code_snippet="password = 'hardcoded_password'",
                ai_explanation="Hardcoded passwords are a security risk",
                suggested_fix="Use environment variables for sensitive data",
                confidence_score=0.85,
                rule_id="SEC001",
                tags=["security", "credentials"],
                is_auto_fixable=True
            )
            
            db.add(sample_finding)
            
            # Update analysis as completed
            await db.execute(
                update(Analysis)
                .where(Analysis.id == analysis.id)
                .values(
                    status=AnalysisStatus.COMPLETED,
                    progress=100.0,
                    total_findings=1,
                    medium_findings=1,
                    summary="Analysis completed with 1 finding",
                    ai_model_used=settings.OPENAI_MODEL
                )
            )
            await db.commit()
            
            logger.info(f"Analysis {analysis.id} completed successfully")
            return {
                "success": True,
                "analysis_id": analysis.id,
                "findings_count": 1
            }
            
        except Exception as e:
            # Mark analysis as failed
            await db.execute(
                update(Analysis)
                .where(Analysis.id == analysis.id)
                .values(
                    status=AnalysisStatus.FAILED,
                    error_message=str(e)
                )
            )
            await db.commit()
            
            logger.error(f"Analysis {analysis.id} failed: {e}")
            return {"success": False, "error": str(e)}


# ARQ worker functions
async def startup(ctx: Dict[str, Any]) -> None:
    """Worker startup function."""
    logger.info("Analysis worker starting up")
    ctx['worker'] = AnalysisWorker()


async def shutdown(ctx: Dict[str, Any]) -> None:
    """Worker shutdown function."""
    logger.info("Analysis worker shutting down")


async def process_webhook_analysis_job(
    ctx: Dict[str, Any],
    repo_url: str,
    branch: str,
    commit_sha: str,
    provider: str,
    event_type: str,
    user_id: Optional[int] = None,
    pr_number: Optional[int] = None
) -> Dict[str, Any]:
    """
    ARQ job function for processing webhook-triggered analysis.
    
    This function is called by the ARQ worker to process analysis jobs
    in the background.
    """
    worker: AnalysisWorker = ctx['worker']
    return await worker.process_webhook_analysis(
        repo_url=repo_url,
        branch=branch,
        commit_sha=commit_sha,
        provider=provider,
        event_type=event_type,
        user_id=user_id,
        pr_number=pr_number
    )


# ARQ worker settings
class WorkerSettings:
    """ARQ worker configuration."""
    redis_settings = arq.redis.RedisSettings.from_dsn(settings.ARQ_REDIS_URL)
    functions = [process_webhook_analysis_job]
    on_startup = startup
    on_shutdown = shutdown
    max_jobs = settings.ARQ_WORKER_CONCURRENCY
    job_timeout = settings.ARQ_JOB_TIMEOUT
    keep_result = settings.ARQ_KEEP_RESULT