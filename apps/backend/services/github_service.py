"""
GitHub integration service.

This service handles GitHub API interactions, including repository management,
webhook processing, and pull request creation for auto-fixes.
"""

from typing import Dict, Any, Optional, List
import aiohttp
import hmac
import hashlib
from urllib.parse import urlparse
from app.core.config import settings
from app.models.repository import Repository
from app.models.proposal import Proposal
from app.models.user import User
from app.services.git_operations import git_operations
from loguru import logger

class GitHubService:
    """Service for GitHub API integration."""
    
    def __init__(self):
        self.api_base = "https://api.github.com"
        self.webhook_secret = settings.GITHUB_WEBHOOK_SECRET
    
    async def verify_webhook_signature(self, payload: bytes, signature: str) -> bool:
        """Verify GitHub webhook signature."""
        if not self.webhook_secret:
            return False
        
        expected_signature = f"sha256={hmac.new(self.webhook_secret.encode(), payload, hashlib.sha256).hexdigest()}"
        return hmac.compare_digest(signature, expected_signature)
    
    async def get_repository_info(self, repo_url: str, access_token: str) -> Dict[str, Any]:
        """Get repository information from GitHub API."""
        try:
            # Parse repository URL
            parsed = urlparse(repo_url)
            owner, repo_name = parsed.path.strip('/').split('/')[:2]
            
            headers = {
                "Authorization": f"token {access_token}",
                "Accept": "application/vnd.github.v3+json"
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    f"{self.api_base}/repos/{owner}/{repo_name}",
                    headers=headers
                ) as response:
                    if response.status == 200:
                        return await response.json()
                    else:
                        logger.error(f"Failed to get repo info: {response.status}")
                        return {}
                        
        except Exception as e:
            logger.error(f"Error getting repository info: {e}")
            return {}
    
    async def setup_webhook(
        self, 
        repository: Repository, 
        access_token: str,
        webhook_url: str
    ) -> Optional[str]:
        """Set up webhook for repository."""
        try:
            # Parse repository URL
            parsed = urlparse(repository.full_name)
            owner, repo_name = parsed.path.strip('/').split('/')[:2]
            
            headers = {
                "Authorization": f"token {access_token}",
                "Accept": "application/vnd.github.v3+json"
            }
            
            webhook_data = {
                "name": "web",
                "active": True,
                "events": ["push", "pull_request"],
                "config": {
                    "url": webhook_url,
                    "content_type": "json",
                    "secret": self.webhook_secret
                }
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.api_base}/repos/{owner}/{repo_name}/hooks",
                    headers=headers,
                    json=webhook_data
                ) as response:
                    if response.status == 201:
                        webhook_info = await response.json()
                        return webhook_info.get("id")
                    else:
                        logger.error(f"Failed to setup webhook: {response.status}")
                        return None
                        
        except Exception as e:
            logger.error(f"Error setting up webhook: {e}")
            return None
    
    async def create_proposal_pr(
        self, 
        proposal: Proposal, 
        user: User,
        pr_title: Optional[str] = None,
        pr_description: Optional[str] = None
    ) -> Dict[str, Any]:
        """Create a pull request for a proposal fix."""
        try:
            # Get repository information
            repository = proposal.finding.analysis.repository
            
            # Parse repository URL to get owner/repo
            if repository.full_name.startswith('http'):
                parsed = urlparse(repository.full_name)
                owner, repo_name = parsed.path.strip('/').split('/')[:2]
            else:
                owner, repo_name = repository.full_name.split('/')[:2]
            
            # Create unique branch name
            branch_name = f"refactoriq-fix-{proposal.id}-{proposal.finding.id}"
            
            # Clone repository and create branch with changes
            clone_result = await self._create_branch_with_proposal_changes(
                repository, branch_name, proposal, user
            )
            
            if not clone_result["success"]:
                return {"success": False, "error": clone_result["error"]}
            
            # Generate PR description
            pr_body = self._generate_pr_description(proposal, pr_description)
            
            # Create pull request
            pr_data = {
                "title": pr_title or f"🔧 Fix: {proposal.title}",
                "body": pr_body,
                "head": branch_name,
                "base": repository.default_branch or "main"
            }
            
            headers = {
                "Authorization": f"token {user.github_access_token}",
                "Accept": "application/vnd.github.v3+json",
                "User-Agent": "RefactorIQ/1.0"
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.api_base}/repos/{owner}/{repo_name}/pulls",
                    headers=headers,
                    json=pr_data
                ) as response:
                    if response.status == 201:
                        pr_info = await response.json()
                        
                        # Update proposal with PR information
                        proposal.pr_url = pr_info.get("html_url")
                        proposal.pr_number = pr_info.get("number")
                        proposal.status = proposal.status  # Keep current status
                        
                        logger.info(f"PR created successfully: {pr_info.get('html_url')}")
                        
                        return {
                            "success": True,
                            "pr_url": pr_info.get("html_url"),
                            "pr_number": pr_info.get("number"),
                            "branch_name": branch_name
                        }
                    else:
                        error_text = await response.text()
                        logger.error(f"Failed to create PR: {response.status} - {error_text}")
                        return {
                            "success": False, 
                            "error": f"GitHub API error: {response.status}"
                        }
                        
        except Exception as e:
            logger.error(f"Error creating proposal PR: {e}")
            return {"success": False, "error": str(e)}
    
    async def _create_branch_with_proposal_changes(
        self,
        repository: Repository,
        branch_name: str,
        proposal: Proposal,
        user: User
    ) -> Dict[str, Any]:
        """Create a new branch with the proposed changes using Git operations."""
        try:
            # Clone repository
            repo_path = await git_operations.clone_repository(
                repository=repository,
                branch=repository.default_branch or "main",
                access_token=user.github_access_token
            )
            
            if not repo_path:
                return {"success": False, "error": "Failed to clone repository"}
            
            try:
                # Create new branch
                branch_result = await git_operations.create_branch(
                    repo_path=repo_path,
                    branch_name=branch_name,
                    base_branch=repository.default_branch or "main"
                )
                
                if not branch_result:
                    return {"success": False, "error": "Failed to create branch"}
                
                # Apply the proposal patch
                patch_result = await git_operations.apply_patch(
                    repo_path=repo_path,
                    patch_content=proposal.patch_diff,
                    validate=True
                )
                
                if not patch_result["success"]:
                    return {"success": False, "error": patch_result["error"]}
                
                # Commit changes
                commit_message = f"🔧 RefactorIQ Fix: {proposal.title}\n\n{proposal.description}\n\nProposal ID: {proposal.id}\nConfidence: {proposal.confidence_score:.2f}"
                commit_result = await git_operations.commit_changes(
                    repo_path=repo_path,
                    commit_message=commit_message,
                    author_name=user.display_name or user.email.split('@')[0],
                    author_email=user.email
                )
                
                if not commit_result["success"]:
                    return {"success": False, "error": commit_result["error"]}
                
                # Push branch
                push_result = await git_operations.push_branch(
                    repo_path=repo_path,
                    branch_name=branch_name
                )
                
                if push_result["success"]:
                    return {
                        "success": True,
                        "branch_name": branch_name,
                        "commit_sha": commit_result["commit_sha"]
                    }
                else:
                    return {"success": False, "error": push_result["error"]}
                    
            finally:
                # Always clean up
                await git_operations.cleanup_repository(repo_path)
                
        except Exception as e:
            logger.error(f"Error creating branch with proposal changes: {e}")
            return {"success": False, "error": str(e)}
    
    def _generate_pr_description(
        self,
        proposal: Proposal,
        custom_description: Optional[str] = None
    ) -> str:
        """Generate comprehensive PR description."""
        if custom_description:
            return custom_description
        
        description_parts = [
            "## 🔧 RefactorIQ Auto-Fix",
            "",
            f"**Issue:** {proposal.finding.title}",
            f"**Type:** {proposal.proposal_type.value.replace('_', ' ').title()}",
            f"**Confidence:** {proposal.confidence_score:.2f}",
            f"**Impact:** {proposal.estimated_impact or 'Unknown'}",
            "",
            "### Description",
            proposal.description,
            "",
            "### Changes Made",
            f"- **File:** `{proposal.finding.file_path}`",
            f"- **Line:** {proposal.finding.line_number}",
            "",
            "### AI Analysis",
            proposal.finding.ai_explanation or "Automated fix generated by RefactorIQ AI.",
            "",
            "### Safety Information",
            f"- **Risk Score:** {proposal.risk_score or 'Low'}",
            f"- **Auto-fixable:** {'Yes' if proposal.finding.is_auto_fixable else 'No'}",
            "",
            "---",
            "*This pull request was automatically generated by RefactorIQ™*",
            f"*Proposal ID: {proposal.id}*"
        ]
        
        return "\n".join(description_parts)
    
    async def get_file_content(
        self, 
        owner: str, 
        repo_name: str, 
        file_path: str, 
        access_token: str,
        ref: str = "main"
    ) -> Optional[str]:
        """Get file content from GitHub repository."""
        try:
            headers = {
                "Authorization": f"token {access_token}",
                "Accept": "application/vnd.github.v3+json"
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    f"{self.api_base}/repos/{owner}/{repo_name}/contents/{file_path}",
                    headers=headers,
                    params={"ref": ref}
                ) as response:
                    if response.status == 200:
                        file_data = await response.json()
                        import base64
                        return base64.b64decode(file_data["content"]).decode("utf-8")
                    else:
                        logger.error(f"Failed to get file content: {response.status}")
                        return None
                        
        except Exception as e:
            logger.error(f"Error getting file content: {e}")
            return None


