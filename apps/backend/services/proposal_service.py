"""
Proposal service for auto-fix generation and management.

This service handles the creation, scoring, and application of auto-fix proposals
with confidence scoring and test patch generation.
"""

from typing import Dict, Any, Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.proposal import Proposal, ProposalStatus, ProposalType
from app.models.analysis import AnalysisFinding
from app.models.user import User
from app.services.ai_service import AIService
from app.services.github_service import GitHubService
from app.services.git_operations import git_operations
from app.utils.patch_utils import PatchValidator, PatchApplier, TestPatchGenerator, is_safe_patch
from loguru import logger
from sqlalchemy import select, update
import json
from datetime import datetime

class ProposalService:
    """Service for managing auto-fix proposals."""
    
    def __init__(self):
        self.ai_service = AIService()
        self.github_service = GitHubService()
    
    async def generate_proposal(
        self, 
        finding: AnalysisFinding,
        db: AsyncSession
    ) -> Optional[Proposal]:
        """Generate an auto-fix proposal for a finding."""
        try:
            # Get the original code context
            code_context = await self._get_code_context(finding)
            
            # Generate fix using AI
            fix_result = await self.ai_service.generate_fix(
                code=finding.code_snippet,
                language=finding.analysis.language,
                finding_type=finding.finding_type,
                description=finding.description,
                context=code_context
            )
            
            if not fix_result.get("success"):
                logger.error(f"Failed to generate fix: {fix_result.get('error')}")
                return None
            
            # Create proposal
            proposal = Proposal(
                finding_id=finding.id,
                title=fix_result.get("title", f"Fix for {finding.title}"),
                description=fix_result.get("description", finding.description),
                proposal_type=self._map_finding_to_proposal_type(finding.finding_type),
                patch_diff=fix_result.get("patch_diff"),
                test_patch_diff=fix_result.get("test_patch_diff"),
                confidence_score=fix_result.get("confidence_score", 0.5),
                estimated_impact=fix_result.get("estimated_impact", "medium"),
                risk_score=fix_result.get("risk_score", 0.3),
                ai_model_used=fix_result.get("model_used"),
                processing_time=fix_result.get("processing_time")
            )
            
            db.add(proposal)
            await db.commit()
            await db.refresh(proposal)
            
            return proposal
            
        except Exception as e:
            logger.error(f"Error generating proposal: {e}")
            return None
    
    async def apply_proposal_direct(
        self, 
        proposal: Proposal, 
        user: User, 
        db: AsyncSession
    ) -> Dict[str, Any]:
        """Apply a proposal directly to the codebase."""
        try:
            # Validate proposal can be applied
            validation_result = await self.validate_proposal_safety(proposal)
            if not validation_result["is_safe"]:
                logger.warning(f"Unsafe proposal rejected: {validation_result['issues']}")
                return {
                    "success": False, 
                    "error": "Proposal failed safety validation",
                    "issues": validation_result["issues"]
                }
            
            # Get repository information
            repository = proposal.finding.analysis.repository
            
            # Clone repository
            repo_path = await git_operations.clone_repository(
                repository=repository,
                branch=repository.default_branch,
                access_token=user.github_access_token or user.gitlab_access_token
            )
            
            if not repo_path:
                return {"success": False, "error": "Failed to clone repository"}
            
            try:
                # Apply the patch
                patch_result = await git_operations.apply_patch(
                    repo_path=repo_path,
                    patch_content=proposal.patch_diff,
                    validate=True
                )
                
                if not patch_result["success"]:
                    return {"success": False, "error": patch_result["error"]}
                
                # Commit changes
                commit_message = f"Fix: {proposal.title}\n\nApplied RefactorIQ proposal #{proposal.id}\n{proposal.description}"
                commit_result = await git_operations.commit_changes(
                    repo_path=repo_path,
                    commit_message=commit_message,
                    author_name=user.display_name or user.email,
                    author_email=user.email
                )
                
                if not commit_result["success"]:
                    return {"success": False, "error": commit_result["error"]}
                
                # Push changes
                push_result = await git_operations.push_branch(
                    repo_path=repo_path,
                    branch_name=repository.default_branch
                )
                
                if push_result["success"]:
                    # Update proposal status
                    await db.execute(
                        update(Proposal)
                        .where(Proposal.id == proposal.id)
                        .values(
                            status=ProposalStatus.APPLIED,
                            applied_at=datetime.utcnow().isoformat(),
                            applied_by=user.id,
                            commit_sha=commit_result["commit_sha"]
                        )
                    )
                    await db.commit()
                    
                    return {
                        "success": True,
                        "commit_sha": commit_result["commit_sha"],
                        "message": "Proposal applied successfully"
                    }
                else:
                    return {"success": False, "error": push_result["error"]}
                    
            finally:
                # Always clean up
                await git_operations.cleanup_repository(repo_path)
                
        except Exception as e:
            logger.error(f"Error applying proposal: {e}")
            return {"success": False, "error": str(e)}
    
    async def generate_preview(self, proposal: Proposal) -> Dict[str, Any]:
        """Generate a preview of the changes that would be made."""
        try:
            from app.utils.patch_utils import PatchParser, get_patch_summary
            
            # Parse the patch diff
            parsed_diff = PatchParser.parse_unified_diff(proposal.patch_diff)
            patch_summary = get_patch_summary(proposal.patch_diff)
            
            # Generate test patch if not exists
            test_patch = proposal.test_patch_diff
            if not test_patch and proposal.finding:
                test_patch = await TestPatchGenerator.generate_test_patch(
                    original_code=proposal.finding.code_snippet,
                    fixed_code="",  # Would need to extract from patch
                    language=proposal.finding.analysis.language,
                    finding_description=proposal.finding.description
                )
            
            # Validate safety
            safety_validation = await self.validate_proposal_safety(proposal)
            
            return {
                "proposal_id": proposal.id,
                "files": parsed_diff["files"],
                "summary": {
                    "files_changed": patch_summary["files_changed"],
                    "additions": patch_summary["additions"],
                    "deletions": patch_summary["deletions"],
                    "net_change": patch_summary["net_change"]
                },
                "confidence_score": proposal.confidence_score,
                "estimated_impact": proposal.estimated_impact,
                "risk_score": proposal.risk_score,
                "safety_validation": safety_validation,
                "test_patch": test_patch,
                "can_apply": safety_validation["is_safe"]
            }
            
        except Exception as e:
            logger.error(f"Error generating preview: {e}")
            return {"error": "Failed to generate preview"}
    
    async def batch_generate_proposals(
        self, 
        findings: List[AnalysisFinding],
        db: AsyncSession
    ) -> List[Proposal]:
        """Generate proposals for multiple findings."""
        proposals = []
        
        for finding in findings:
            # Only generate proposals for auto-fixable findings
            if finding.is_auto_fixable:
                proposal = await self.generate_proposal(finding, db)
                if proposal:
                    proposals.append(proposal)
        
        return proposals
    
    async def validate_proposal_safety(self, proposal: Proposal) -> Dict[str, Any]:
        """Validate proposal safety before application."""
        try:
            # Check patch safety
            safety_result = PatchValidator.validate_patch_safety(proposal.patch_diff)
            
            # Check format validity
            format_result = PatchValidator.validate_patch_format(proposal.patch_diff)
            
            # Check confidence score
            confidence_check = proposal.confidence_score >= 0.7
            
            # Combine results
            is_safe = (
                safety_result["is_safe"] and
                format_result["valid"] and
                confidence_check
            )
            
            issues = []
            if not safety_result["is_safe"]:
                issues.extend(safety_result["issues"])
            if not format_result["valid"]:
                issues.append({"type": "format", "description": format_result["error"]})
            if not confidence_check:
                issues.append({
                    "type": "confidence", 
                    "description": f"Low confidence score: {proposal.confidence_score}"
                })
            
            return {
                "is_safe": is_safe,
                "confidence_score": proposal.confidence_score,
                "safety_score": safety_result["safety_score"],
                "issues": issues,
                "warnings": safety_result.get("warnings", [])
            }
            
        except Exception as e:
            logger.error(f"Error validating proposal safety: {e}")
            return {
                "is_safe": False,
                "issues": [{"type": "validation_error", "description": str(e)}],
                "warnings": []
            }
    
    async def score_proposal_confidence(
        self, 
        proposal: Proposal,
        context: Optional[str] = None
    ) -> float:
        """Score the confidence of a proposal using AI."""
        try:
            # Create confidence scoring prompt
            prompt = f"""
            Analyze this code fix proposal and provide a confidence score (0.0 to 1.0):
            
            Original Issue: {proposal.finding.description}
            Proposed Fix: {proposal.patch_diff}
            Context: {context or 'No additional context'}
            
            Consider:
            1. Does the fix address the root cause?
            2. Are there potential side effects?
            3. Is the fix safe and maintainable?
            4. Are there edge cases not covered?
            
            Provide only a number between 0.0 and 1.0 as your response.
            """
            
            # Use AI to score confidence
            result = await self.ai_service.analyze_text(prompt)
            
            # Parse the confidence score
            try:
                confidence = float(result.get("response", "0.5"))
                return max(0.0, min(1.0, confidence))  # Clamp between 0 and 1
            except ValueError:
                return 0.5
                
        except Exception as e:
            logger.error(f"Error scoring proposal confidence: {e}")
            return 0.5
    
    async def _get_code_context(self, finding: AnalysisFinding) -> Optional[str]:
        """Get additional code context around the finding."""
        try:
            # Get surrounding code lines
            file_path = finding.file_path
            line_number = finding.line_number
            
            # This would typically fetch from the repository
            # For now, return the code snippet
            return finding.code_snippet
            
        except Exception as e:
            logger.error(f"Error getting code context: {e}")
            return None
    
    def _map_finding_to_proposal_type(self, finding_type: str) -> ProposalType:
        """Map finding type to proposal type."""
        mapping = {
            "bug": ProposalType.BUG_FIX,
            "security": ProposalType.SECURITY_FIX,
            "performance": ProposalType.PERFORMANCE_IMPROVEMENT,
            "code_smell": ProposalType.CODE_QUALITY,
            "refactoring": ProposalType.REFACTORING,
            "documentation": ProposalType.DOCUMENTATION
        }
        return mapping.get(finding_type, ProposalType.CODE_QUALITY)



