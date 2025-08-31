"""
GitLab integration service.

This service handles GitLab API interactions, including repository management,
webhook processing, and merge request creation for auto-fixes.
"""

from typing import Dict, Any, Optional, List
import aiohttp
import hmac
from urllib.parse import urlparse
from app.core.config import settings
from app.models.repository import Repository
from app.models.proposal import Proposal
from app.models.user import User
from loguru import logger


class GitLabService:
    """Service for GitLab API integration."""
    
    def __init__(self):
        self.api_base = "https://gitlab.com/api/v4"
        self.webhook_secret = settings.GITLAB_WEBHOOK_SECRET
    
    async def verify_webhook_token(self, token: str) -> bool:
        """Verify GitLab webhook token."""
        if not self.webhook_secret:
            return False
        
        return hmac.compare_digest(token, self.webhook_secret)
    
    async def get_repository_info(self, repo_url: str, access_token: str) -> Dict[str, Any]:
        """Get repository information from GitLab API."""
        try:
            # Parse repository URL to get project path
            parsed = urlparse(repo_url)
            project_path = parsed.path.strip('/').replace('/', '%2F')
            
            headers = {
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json"
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    f"{self.api_base}/projects/{project_path}",
                    headers=headers
                ) as response:
                    if response.status == 200:
                        return await response.json()
                    else:
                        logger.error(f"Failed to get GitLab repo info: {response.status}")
                        return {}
                        
        except Exception as e:
            logger.error(f"Error getting GitLab repository info: {e}")
            return {}
    
    async def setup_webhook(
        self, 
        repository: Repository, 
        access_token: str,
        webhook_url: str
    ) -> Optional[str]:
        """Set up webhook for GitLab repository."""
        try:
            # Parse repository URL to get project path
            parsed = urlparse(repository.full_name)
            project_path = parsed.path.strip('/').replace('/', '%2F')
            
            headers = {
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json"
            }
            
            webhook_data = {
                "url": webhook_url,
                "push_events": True,
                "merge_requests_events": True,
                "token": self.webhook_secret,
                "enable_ssl_verification": True
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.api_base}/projects/{project_path}/hooks",
                    headers=headers,
                    json=webhook_data
                ) as response:
                    if response.status == 201:
                        webhook_info = await response.json()
                        return str(webhook_info.get("id"))
                    else:
                        logger.error(f"Failed to setup GitLab webhook: {response.status}")
                        return None
                        
        except Exception as e:
            logger.error(f"Error setting up GitLab webhook: {e}")
            return None
    
    async def create_proposal_mr(
        self, 
        proposal: Proposal, 
        user: User,
        mr_title: Optional[str] = None,
        mr_description: Optional[str] = None
    ) -> Dict[str, Any]:
        """Create a merge request for a proposal fix."""
        try:
            # Get repository information
            repository = proposal.finding.analysis.repository
            
            # Parse repository URL to get project path
            parsed = urlparse(repository.full_name)
            project_path = parsed.path.strip('/').replace('/', '%2F')
            
            # Create branch name
            branch_name = f"refactoriq-fix-{proposal.id}"
            
            # Create or update branch with changes
            await self._create_branch_with_changes(
                project_path, branch_name, proposal, user
            )
            
            # Create merge request
            mr_data = {
                "source_branch": branch_name,
                "target_branch": repository.default_branch,
                "title": mr_title or f"Fix: {proposal.title}",
                "description": mr_description or proposal.description,
                "remove_source_branch": True
            }
            
            headers = {
                "Authorization": f"Bearer {user.gitlab_access_token}",
                "Content-Type": "application/json"
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.api_base}/projects/{project_path}/merge_requests",
                    headers=headers,
                    json=mr_data
                ) as response:
                    if response.status == 201:
                        mr_info = await response.json()
                        return {
                            "success": True,
                            "mr_url": mr_info.get("web_url"),
                            "mr_iid": mr_info.get("iid")
                        }
                    else:
                        logger.error(f"Failed to create GitLab MR: {response.status}")
                        return {"success": False, "error": "Failed to create merge request"}
                        
        except Exception as e:
            logger.error(f"Error creating proposal MR: {e}")
            return {"success": False, "error": str(e)}
    
    async def _create_branch_with_changes(
        self, 
        project_path: str, 
        branch_name: str, 
        proposal: Proposal, 
        user: User
    ) -> bool:
        """Create a new branch with the proposed changes."""
        try:
            headers = {
                "Authorization": f"Bearer {user.gitlab_access_token}",
                "Content-Type": "application/json"
            }
            
            async with aiohttp.ClientSession() as session:
                # Get default branch reference
                async with session.get(
                    f"{self.api_base}/projects/{project_path}/repository/branches/main",
                    headers=headers
                ) as response:
                    if response.status == 200:
                        branch_data = await response.json()
                        base_sha = branch_data["commit"]["id"]
                    else:
                        logger.error(f"Failed to get GitLab base SHA: {response.status}")
                        return False
                
                # Create new branch
                branch_creation_data = {
                    "branch": branch_name,
                    "ref": base_sha
                }
                
                async with session.post(
                    f"{self.api_base}/projects/{project_path}/repository/branches",
                    headers=headers,
                    json=branch_creation_data
                ) as response:
                    if response.status != 201:
                        logger.error(f"Failed to create GitLab branch: {response.status}")
                        return False
                
                # Apply the patch (this would require more complex Git operations)
                # For now, we'll just create the branch
                return True
                
        except Exception as e:
            logger.error(f"Error creating GitLab branch with changes: {e}")
            return False
    
    async def get_file_content(
        self, 
        project_path: str, 
        file_path: str, 
        access_token: str,
        ref: str = "main"
    ) -> Optional[str]:
        """Get file content from GitLab repository."""
        try:
            headers = {
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json"
            }
            
            # URL encode the file path
            encoded_file_path = file_path.replace('/', '%2F')
            
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    f"{self.api_base}/projects/{project_path}/repository/files/{encoded_file_path}",
                    headers=headers,
                    params={"ref": ref}
                ) as response:
                    if response.status == 200:
                        file_data = await response.json()
                        import base64
                        return base64.b64decode(file_data["content"]).decode("utf-8")
                    else:
                        logger.error(f"Failed to get GitLab file content: {response.status}")
                        return None
                        
        except Exception as e:
            logger.error(f"Error getting GitLab file content: {e}")
            return None
    
    async def get_merge_request_diff(
        self,
        project_path: str,
        mr_iid: int,
        access_token: str
    ) -> Optional[str]:
        """Get merge request diff from GitLab."""
        try:
            headers = {
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json"
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    f"{self.api_base}/projects/{project_path}/merge_requests/{mr_iid}/changes",
                    headers=headers
                ) as response:
                    if response.status == 200:
                        changes_data = await response.json()
                        return changes_data.get("changes", [])
                    else:
                        logger.error(f"Failed to get GitLab MR diff: {response.status}")
                        return None
                        
        except Exception as e:
            logger.error(f"Error getting GitLab MR diff: {e}")
            return None