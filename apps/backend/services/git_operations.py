"""
Git operations service for repository management and patch application.

This service provides safe Git operations for applying proposals,
creating branches, and managing repository changes.
"""

import os
import tempfile
import shutil
import subprocess
from typing import Dict, Any, Optional, List
from pathlib import Path
import asyncio
from app.models.repository import Repository, RepositoryProvider
from app.models.proposal import Proposal
from app.models.user import User
from app.core.config import settings
from loguru import logger
import uuid


class GitOperationsService:
    """Service for Git repository operations."""
    
    def __init__(self):
        self.temp_dir = tempfile.gettempdir()
        self.work_dir = os.path.join(self.temp_dir, "refactoriq_work")
        self.ensure_work_directory()
    
    def ensure_work_directory(self):
        """Ensure work directory exists."""
        os.makedirs(self.work_dir, exist_ok=True)
    
    async def clone_repository(
        self,
        repository: Repository,
        branch: str = None,
        access_token: str = None
    ) -> Optional[str]:
        """
        Clone repository to temporary directory.
        
        Returns:
            Path to cloned repository or None if failed
        """
        try:
            # Generate unique directory name
            repo_id = str(uuid.uuid4())[:8]
            clone_path = os.path.join(self.work_dir, f"repo_{repo_id}")
            
            # Prepare clone URL with authentication
            clone_url = self._prepare_clone_url(repository, access_token)
            
            # Clone command
            cmd = ["git", "clone"]
            if branch:
                cmd.extend(["--branch", branch])
            cmd.extend(["--depth", "1", clone_url, clone_path])
            
            # Execute clone
            result = await self._run_git_command(cmd, cwd=None)
            
            if result["success"]:
                logger.info(f"Repository cloned successfully: {clone_path}")
                return clone_path
            else:
                logger.error(f"Failed to clone repository: {result['error']}")
                return None
                
        except Exception as e:
            logger.error(f"Error cloning repository: {e}")
            return None
    
    async def create_branch(
        self,
        repo_path: str,
        branch_name: str,
        base_branch: str = "main"
    ) -> bool:
        """Create a new branch from base branch."""
        try:
            # Checkout base branch
            checkout_result = await self._run_git_command(
                ["git", "checkout", base_branch],
                cwd=repo_path
            )
            
            if not checkout_result["success"]:
                logger.error(f"Failed to checkout base branch: {checkout_result['error']}")
                return False
            
            # Create and checkout new branch
            branch_result = await self._run_git_command(
                ["git", "checkout", "-b", branch_name],
                cwd=repo_path
            )
            
            if branch_result["success"]:
                logger.info(f"Branch created successfully: {branch_name}")
                return True
            else:
                logger.error(f"Failed to create branch: {branch_result['error']}")
                return False
                
        except Exception as e:
            logger.error(f"Error creating branch: {e}")
            return False
    
    async def apply_patch(
        self,
        repo_path: str,
        patch_content: str,
        validate: bool = True
    ) -> Dict[str, Any]:
        """
        Apply patch to repository.
        
        Args:
            repo_path: Path to repository
            patch_content: Patch content in diff format
            validate: Whether to validate the patch before applying
        
        Returns:
            Result dictionary with success status and details
        """
        try:
            if validate:
                # Validate patch before applying
                validation_result = await self._validate_patch(repo_path, patch_content)
                if not validation_result["valid"]:
                    return {
                        "success": False,
                        "error": f"Invalid patch: {validation_result['error']}"
                    }
            
            # Create backup of current state
            backup_result = await self._create_backup(repo_path)
            if not backup_result["success"]:
                return {"success": False, "error": "Failed to create backup"}
            
            # Apply the patch
            patch_file = os.path.join(repo_path, "temp_patch.diff")
            with open(patch_file, 'w', encoding='utf-8') as f:
                f.write(patch_content)
            
            apply_result = await self._run_git_command(
                ["git", "apply", "--index", "temp_patch.diff"],
                cwd=repo_path
            )
            
            # Clean up patch file
            os.remove(patch_file)
            
            if apply_result["success"]:
                logger.info("Patch applied successfully")
                return {
                    "success": True,
                    "backup_path": backup_result["backup_path"]
                }
            else:
                # Rollback on failure
                await self._rollback_from_backup(repo_path, backup_result["backup_path"])
                return {
                    "success": False,
                    "error": f"Failed to apply patch: {apply_result['error']}"
                }
                
        except Exception as e:
            logger.error(f"Error applying patch: {e}")
            return {"success": False, "error": str(e)}
    
    async def commit_changes(
        self,
        repo_path: str,
        commit_message: str,
        author_name: str,
        author_email: str
    ) -> Dict[str, Any]:
        """Commit changes to repository."""
        try:
            # Configure git user
            await self._run_git_command(
                ["git", "config", "user.name", author_name],
                cwd=repo_path
            )
            await self._run_git_command(
                ["git", "config", "user.email", author_email],
                cwd=repo_path
            )
            
            # Add all changes
            add_result = await self._run_git_command(
                ["git", "add", "."],
                cwd=repo_path
            )
            
            if not add_result["success"]:
                return {"success": False, "error": "Failed to stage changes"}
            
            # Commit changes
            commit_result = await self._run_git_command(
                ["git", "commit", "-m", commit_message],
                cwd=repo_path
            )
            
            if commit_result["success"]:
                # Get commit SHA
                sha_result = await self._run_git_command(
                    ["git", "rev-parse", "HEAD"],
                    cwd=repo_path
                )
                
                return {
                    "success": True,
                    "commit_sha": sha_result["output"].strip() if sha_result["success"] else None
                }
            else:
                return {"success": False, "error": commit_result["error"]}
                
        except Exception as e:
            logger.error(f"Error committing changes: {e}")
            return {"success": False, "error": str(e)}
    
    async def push_branch(
        self,
        repo_path: str,
        branch_name: str,
        remote: str = "origin"
    ) -> Dict[str, Any]:
        """Push branch to remote repository."""
        try:
            push_result = await self._run_git_command(
                ["git", "push", "-u", remote, branch_name],
                cwd=repo_path
            )
            
            if push_result["success"]:
                logger.info(f"Branch pushed successfully: {branch_name}")
                return {"success": True}
            else:
                return {"success": False, "error": push_result["error"]}
                
        except Exception as e:
            logger.error(f"Error pushing branch: {e}")
            return {"success": False, "error": str(e)}
    
    async def cleanup_repository(self, repo_path: str) -> None:
        """Clean up cloned repository."""
        try:
            if os.path.exists(repo_path):
                shutil.rmtree(repo_path)
                logger.info(f"Repository cleaned up: {repo_path}")
        except Exception as e:
            logger.error(f"Error cleaning up repository: {e}")
    
    def _prepare_clone_url(self, repository: Repository, access_token: str) -> str:
        """Prepare clone URL with authentication."""
        if repository.provider == RepositoryProvider.GITHUB:
            # GitHub: https://token@github.com/owner/repo.git
            base_url = repository.full_name.replace("github.com/", "")
            return f"https://{access_token}@github.com/{base_url}.git"
        elif repository.provider == RepositoryProvider.GITLAB:
            # GitLab: https://oauth2:token@gitlab.com/owner/repo.git
            base_url = repository.full_name.replace("gitlab.com/", "")
            return f"https://oauth2:{access_token}@gitlab.com/{base_url}.git"
        else:
            return repository.full_name
    
    async def _validate_patch(self, repo_path: str, patch_content: str) -> Dict[str, Any]:
        """Validate patch before applying."""
        try:
            # Write patch to temporary file
            patch_file = os.path.join(repo_path, "validate_patch.diff")
            with open(patch_file, 'w', encoding='utf-8') as f:
                f.write(patch_content)
            
            # Dry run the patch
            result = await self._run_git_command(
                ["git", "apply", "--check", "validate_patch.diff"],
                cwd=repo_path
            )
            
            # Clean up
            os.remove(patch_file)
            
            return {
                "valid": result["success"],
                "error": result["error"] if not result["success"] else None
            }
            
        except Exception as e:
            return {"valid": False, "error": str(e)}
    
    async def _create_backup(self, repo_path: str) -> Dict[str, Any]:
        """Create backup of current repository state."""
        try:
            backup_id = str(uuid.uuid4())[:8]
            backup_path = os.path.join(self.work_dir, f"backup_{backup_id}")
            
            # Create backup using git stash
            stash_result = await self._run_git_command(
                ["git", "stash", "push", "-m", f"refactoriq_backup_{backup_id}"],
                cwd=repo_path
            )
            
            return {
                "success": True,
                "backup_path": backup_path,
                "backup_id": backup_id
            }
            
        except Exception as e:
            logger.error(f"Error creating backup: {e}")
            return {"success": False, "error": str(e)}
    
    async def _rollback_from_backup(self, repo_path: str, backup_path: str) -> bool:
        """Rollback repository to backup state."""
        try:
            # Reset to HEAD
            reset_result = await self._run_git_command(
                ["git", "reset", "--hard", "HEAD"],
                cwd=repo_path
            )
            
            return reset_result["success"]
            
        except Exception as e:
            logger.error(f"Error rolling back: {e}")
            return False
    
    async def _run_git_command(
        self,
        cmd: List[str],
        cwd: Optional[str] = None,
        timeout: int = 30
    ) -> Dict[str, Any]:
        """
        Run git command asynchronously.
        
        Args:
            cmd: Command to run as list
            cwd: Working directory
            timeout: Command timeout in seconds
        
        Returns:
            Result dictionary with success, output, and error
        """
        try:
            process = await asyncio.create_subprocess_exec(
                *cmd,
                cwd=cwd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
                timeout=timeout
            )
            
            stdout, stderr = await process.communicate()
            
            return {
                "success": process.returncode == 0,
                "output": stdout.decode('utf-8') if stdout else "",
                "error": stderr.decode('utf-8') if stderr else "",
                "returncode": process.returncode
            }
            
        except asyncio.TimeoutError:
            return {
                "success": False,
                "output": "",
                "error": f"Command timed out after {timeout} seconds",
                "returncode": -1
            }
        except Exception as e:
            return {
                "success": False,
                "output": "",
                "error": str(e),
                "returncode": -1
            }


# Simplified GitService class for analysis functionality
class GitService:
    """Simplified Git service for analysis operations."""
    
    def __init__(self):
        self.temp_dir = tempfile.gettempdir()
        self.work_dir = os.path.join(self.temp_dir, "refactoriq_analysis")
        os.makedirs(self.work_dir, exist_ok=True)
    
    async def clone_repository(self, repo_url: str, branch: str = "main") -> str:
        """Clone repository for analysis."""
        try:
            repo_id = str(uuid.uuid4())[:8]
            clone_path = os.path.join(self.work_dir, f"repo_{repo_id}")
            
            # Simple clone command
            cmd = ["git", "clone", "--depth", "1", "--branch", branch, repo_url, clone_path]
            
            process = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            
            stdout, stderr = await process.communicate()
            
            if process.returncode == 0:
                logger.info(f"Repository cloned successfully: {clone_path}")
                return clone_path
            else:
                logger.error(f"Failed to clone repository: {stderr.decode()}")
                raise Exception(f"Git clone failed: {stderr.decode()}")
                
        except Exception as e:
            logger.error(f"Error cloning repository: {e}")
            raise
    
    async def get_code_files(self, repo_path: str, language: str = None) -> Dict[str, str]:
        """Get code files from repository."""
        code_files = {}
        
        # Define file extensions for different languages
        extensions = {
            'python': ['.py'],
            'javascript': ['.js', '.jsx', '.ts', '.tsx'],
            'java': ['.java'],
            'go': ['.go'],
            'rust': ['.rs'],
            'cpp': ['.cpp', '.cc', '.cxx'],
            'c': ['.c', '.h'],
            'csharp': ['.cs'],
            'php': ['.php'],
            'ruby': ['.rb'],
            'swift': ['.swift'],
            'kotlin': ['.kt'],
            'scala': ['.scala']
        }
        
        # Get extensions to look for
        target_extensions = []
        if language and language in extensions:
            target_extensions = extensions[language]
        else:
            # Include all extensions for mixed language
            for ext_list in extensions.values():
                target_extensions.extend(ext_list)
        
        # Walk through directory and collect code files
        for root, dirs, files in os.walk(repo_path):
            # Skip hidden directories and common non-source directories
            dirs[:] = [d for d in dirs if not d.startswith('.') and d not in ['node_modules', '__pycache__', 'vendor', 'build', 'dist']]
            
            for file in files:
                if any(file.endswith(ext) for ext in target_extensions):
                    file_path = os.path.join(root, file)
                    relative_path = os.path.relpath(file_path, repo_path)
                    
                    try:
                        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                            content = f.read()
                            if content.strip():  # Only include non-empty files
                                code_files[relative_path] = content
                    except Exception as e:
                        logger.warning(f"Could not read file {file_path}: {e}")
                        continue
        
        logger.info(f"Found {len(code_files)} code files in repository")
        return code_files

# Global Git operations service instance
git_operations = GitOperationsService()