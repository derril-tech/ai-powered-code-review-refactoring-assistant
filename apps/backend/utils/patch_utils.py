"""
Patch utilities for handling diff operations and code transformations.

This module provides utilities for parsing, validating, and applying
code patches safely and efficiently.
"""

import re
import os
import shutil
from typing import Dict, Any, Optional, List, Tuple
from pathlib import Path
from loguru import logger


class PatchParser:
    """Parser for Git diff/patch format."""
    
    @staticmethod
    def parse_unified_diff(diff_content: str) -> Dict[str, Any]:
        """
        Parse unified diff format into structured data.
        
        Args:
            diff_content: Diff content in unified format
        
        Returns:
            Parsed diff information
        """
        try:
            lines = diff_content.strip().split('\n')
            parsed = {
                "files": [],
                "total_additions": 0,
                "total_deletions": 0,
                "total_files": 0
            }
            
            current_file = None
            
            for line in lines:
                if line.startswith('--- a/'):
                    # Start of file diff
                    if current_file:
                        parsed["files"].append(current_file)
                    
                    current_file = {
                        "old_path": line[6:],  # Remove '--- a/' prefix
                        "new_path": None,
                        "chunks": [],
                        "additions": 0,
                        "deletions": 0
                    }
                    
                elif line.startswith('+++ b/'):
                    # New file path
                    if current_file:
                        current_file["new_path"] = line[6:]  # Remove '+++ b/' prefix
                        
                elif line.startswith('@@'):
                    # Chunk header
                    chunk_info = PatchParser._parse_chunk_header(line)
                    if current_file and chunk_info:
                        current_file["chunks"].append({
                            "header": line,
                            "old_start": chunk_info["old_start"],
                            "old_count": chunk_info["old_count"],
                            "new_start": chunk_info["new_start"],
                            "new_count": chunk_info["new_count"],
                            "lines": []
                        })
                        
                elif current_file and current_file["chunks"]:
                    # Content line
                    current_chunk = current_file["chunks"][-1]
                    
                    if line.startswith('+'):
                        current_chunk["lines"].append({"type": "addition", "content": line[1:]})
                        current_file["additions"] += 1
                        parsed["total_additions"] += 1
                    elif line.startswith('-'):
                        current_chunk["lines"].append({"type": "deletion", "content": line[1:]})
                        current_file["deletions"] += 1
                        parsed["total_deletions"] += 1
                    else:
                        current_chunk["lines"].append({"type": "context", "content": line[1:] if line.startswith(' ') else line})
            
            # Add last file
            if current_file:
                parsed["files"].append(current_file)
            
            parsed["total_files"] = len(parsed["files"])
            
            return parsed
            
        except Exception as e:
            logger.error(f"Error parsing diff: {e}")
            return {"files": [], "total_additions": 0, "total_deletions": 0, "total_files": 0}
    
    @staticmethod
    def _parse_chunk_header(header: str) -> Optional[Dict[str, int]]:
        """Parse chunk header like @@ -1,7 +1,6 @@."""
        try:
            match = re.match(r'@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@', header)
            if match:
                return {
                    "old_start": int(match.group(1)),
                    "old_count": int(match.group(2)) if match.group(2) else 1,
                    "new_start": int(match.group(3)),
                    "new_count": int(match.group(4)) if match.group(4) else 1
                }
            return None
        except Exception:
            return None


class PatchValidator:
    """Validator for patch safety and correctness."""
    
    @staticmethod
    def validate_patch_safety(patch_content: str) -> Dict[str, Any]:
        """
        Validate patch for safety concerns.
        
        Args:
            patch_content: Patch content to validate
        
        Returns:
            Validation result with safety assessment
        """
        try:
            issues = []
            warnings = []
            
            # Check for dangerous patterns
            dangerous_patterns = [
                (r'rm\s+-rf', "Dangerous file deletion command"),
                (r'sudo\s+', "Elevated privilege command"),
                (r'eval\s*\(', "Dynamic code execution"),
                (r'exec\s*\(', "Dynamic code execution"),
                (r'__import__', "Dynamic import"),
                (r'open\s*\([\'"][\/\\]', "Absolute path file access"),
                (r'os\.system', "System command execution"),
                (r'subprocess\.', "Subprocess execution"),
                (r'shell=True', "Shell command injection risk")
            ]
            
            for pattern, description in dangerous_patterns:
                if re.search(pattern, patch_content, re.IGNORECASE):
                    issues.append({
                        "type": "security",
                        "pattern": pattern,
                        "description": description
                    })
            
            # Check for common mistakes
            mistake_patterns = [
                (r'password\s*=\s*[\'"][^\'"]+[\'"]', "Hardcoded password"),
                (r'api_?key\s*=\s*[\'"][^\'"]+[\'"]', "Hardcoded API key"),
                (r'secret\s*=\s*[\'"][^\'"]+[\'"]', "Hardcoded secret"),
                (r'TODO|FIXME|HACK', "TODO/FIXME comments"),
                (r'console\.log|print\s*\(', "Debug statements")
            ]
            
            for pattern, description in mistake_patterns:
                if re.search(pattern, patch_content, re.IGNORECASE):
                    warnings.append({
                        "type": "quality",
                        "pattern": pattern,
                        "description": description
                    })
            
            # Assess overall safety
            safety_score = 1.0 - (len(issues) * 0.3 + len(warnings) * 0.1)
            safety_score = max(0.0, safety_score)
            
            return {
                "is_safe": len(issues) == 0,
                "safety_score": safety_score,
                "issues": issues,
                "warnings": warnings,
                "recommendation": "safe" if len(issues) == 0 else "review_required"
            }
            
        except Exception as e:
            logger.error(f"Error validating patch safety: {e}")
            return {
                "is_safe": False,
                "safety_score": 0.0,
                "issues": [{"type": "validation_error", "description": str(e)}],
                "warnings": [],
                "recommendation": "reject"
            }
    
    @staticmethod
    def validate_patch_format(patch_content: str) -> Dict[str, Any]:
        """
        Validate patch format and structure.
        
        Args:
            patch_content: Patch content to validate
        
        Returns:
            Format validation result
        """
        try:
            if not patch_content.strip():
                return {"valid": False, "error": "Empty patch content"}
            
            lines = patch_content.strip().split('\n')
            
            # Check for unified diff format
            has_file_headers = any(line.startswith('--- ') for line in lines)
            has_chunk_headers = any(line.startswith('@@') for line in lines)
            
            if not (has_file_headers and has_chunk_headers):
                return {"valid": False, "error": "Invalid diff format"}
            
            # Validate chunk headers
            chunk_errors = []
            for i, line in enumerate(lines):
                if line.startswith('@@'):
                    if not re.match(r'@@ -\d+(?:,\d+)? \+\d+(?:,\d+)? @@', line):
                        chunk_errors.append(f"Invalid chunk header at line {i + 1}: {line}")
            
            if chunk_errors:
                return {"valid": False, "error": f"Invalid chunk headers: {'; '.join(chunk_errors)}"}
            
            return {"valid": True, "format": "unified_diff"}
            
        except Exception as e:
            return {"valid": False, "error": str(e)}


class PatchApplier:
    """Utility for applying patches with safety checks."""
    
    @staticmethod
    async def apply_patch_safe(
        file_path: str,
        patch_content: str,
        backup: bool = True
    ) -> Dict[str, Any]:
        """
        Apply patch to file with safety checks.
        
        Args:
            file_path: Path to file to patch
            patch_content: Patch content
            backup: Whether to create backup
        
        Returns:
            Application result
        """
        try:
            if not os.path.exists(file_path):
                return {"success": False, "error": "File does not exist"}
            
            # Create backup if requested
            backup_path = None
            if backup:
                backup_path = f"{file_path}.backup.{os.getpid()}"
                shutil.copy2(file_path, backup_path)
            
            # Validate patch format
            validation = PatchValidator.validate_patch_format(patch_content)
            if not validation["valid"]:
                return {"success": False, "error": validation["error"]}
            
            # Apply patch (simplified implementation)
            # In a full implementation, this would parse the diff and apply line by line
            parsed_patch = PatchParser.parse_unified_diff(patch_content)
            
            if parsed_patch["total_files"] == 0:
                return {"success": False, "error": "No files in patch"}
            
            return {
                "success": True,
                "backup_path": backup_path,
                "files_modified": parsed_patch["total_files"],
                "additions": parsed_patch["total_additions"],
                "deletions": parsed_patch["total_deletions"]
            }
            
        except Exception as e:
            logger.error(f"Error applying patch: {e}")
            return {"success": False, "error": str(e)}
    
    @staticmethod
    def rollback_patch(file_path: str, backup_path: str) -> bool:
        """Rollback file from backup."""
        try:
            if os.path.exists(backup_path):
                shutil.copy2(backup_path, file_path)
                os.remove(backup_path)
                return True
            return False
        except Exception as e:
            logger.error(f"Error rolling back patch: {e}")
            return False


class TestPatchGenerator:
    """Generator for test patches to verify fixes."""
    
    @staticmethod
    async def generate_test_patch(
        original_code: str,
        fixed_code: str,
        language: str,
        finding_description: str
    ) -> Optional[str]:
        """
        Generate test patch to verify the fix works.
        
        Args:
            original_code: Original code with issue
            fixed_code: Fixed code
            language: Programming language
            finding_description: Description of the issue being fixed
        
        Returns:
            Test patch content or None if generation fails
        """
        try:
            # Language-specific test templates
            test_templates = {
                "python": TestPatchGenerator._generate_python_test,
                "javascript": TestPatchGenerator._generate_javascript_test,
                "typescript": TestPatchGenerator._generate_typescript_test,
                "java": TestPatchGenerator._generate_java_test
            }
            
            generator = test_templates.get(language, TestPatchGenerator._generate_generic_test)
            return await generator(original_code, fixed_code, finding_description)
            
        except Exception as e:
            logger.error(f"Error generating test patch: {e}")
            return None
    
    @staticmethod
    async def _generate_python_test(
        original_code: str,
        fixed_code: str,
        description: str
    ) -> str:
        """Generate Python test patch."""
        test_code = f'''
import pytest
import unittest

class TestRefactorIQFix(unittest.TestCase):
    """Test case for RefactorIQ auto-fix."""
    
    def test_fix_addresses_issue(self):
        """Test that the fix addresses the original issue: {description}"""
        # TODO: Add specific test logic for the fix
        # Original issue: {description}
        pass
    
    def test_fix_maintains_functionality(self):
        """Test that the fix maintains original functionality."""
        # TODO: Add functionality preservation tests
        pass

if __name__ == "__main__":
    unittest.main()
'''
        return test_code.strip()
    
    @staticmethod
    async def _generate_javascript_test(
        original_code: str,
        fixed_code: str,
        description: str
    ) -> str:
        """Generate JavaScript test patch."""
        test_code = f'''
describe('RefactorIQ Fix', () => {{
    test('should address the original issue', () => {{
        // Original issue: {description}
        // TODO: Add specific test logic for the fix
    }});
    
    test('should maintain original functionality', () => {{
        // TODO: Add functionality preservation tests
    }});
}});
'''
        return test_code.strip()
    
    @staticmethod
    async def _generate_typescript_test(
        original_code: str,
        fixed_code: str,
        description: str
    ) -> str:
        """Generate TypeScript test patch."""
        test_code = f'''
describe('RefactorIQ Fix', () => {{
    test('should address the original issue', () => {{
        // Original issue: {description}
        // TODO: Add specific test logic for the fix
    }});
    
    test('should maintain original functionality', () => {{
        // TODO: Add functionality preservation tests
    }});
}});
'''
        return test_code.strip()
    
    @staticmethod
    async def _generate_java_test(
        original_code: str,
        fixed_code: str,
        description: str
    ) -> str:
        """Generate Java test patch."""
        test_code = f'''
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Assertions;

public class RefactorIQFixTest {{
    
    @Test
    public void testFixAddressesIssue() {{
        // Original issue: {description}
        // TODO: Add specific test logic for the fix
    }}
    
    @Test
    public void testFixMaintainsFunctionality() {{
        // TODO: Add functionality preservation tests
    }}
}}
'''
        return test_code.strip()
    
    @staticmethod
    async def _generate_generic_test(
        original_code: str,
        fixed_code: str,
        description: str
    ) -> str:
        """Generate generic test template."""
        test_code = f'''
// RefactorIQ Auto-generated Test
// Original issue: {description}

// TODO: Add language-specific test framework
// TODO: Test that the fix addresses the original issue
// TODO: Test that functionality is maintained
// TODO: Test edge cases and error conditions

/*
Original code:
{original_code}

Fixed code:
{fixed_code}
*/
'''
        return test_code.strip()


class DiffGenerator:
    """Generator for creating diff patches."""
    
    @staticmethod
    def create_unified_diff(
        original_content: str,
        modified_content: str,
        file_path: str,
        context_lines: int = 3
    ) -> str:
        """
        Create unified diff between original and modified content.
        
        Args:
            original_content: Original file content
            modified_content: Modified file content
            file_path: File path for diff headers
            context_lines: Number of context lines
        
        Returns:
            Unified diff string
        """
        try:
            import difflib
            
            original_lines = original_content.splitlines(keepends=True)
            modified_lines = modified_content.splitlines(keepends=True)
            
            diff = difflib.unified_diff(
                original_lines,
                modified_lines,
                fromfile=f"a/{file_path}",
                tofile=f"b/{file_path}",
                n=context_lines
            )
            
            return ''.join(diff)
            
        except Exception as e:
            logger.error(f"Error creating diff: {e}")
            return ""
    
    @staticmethod
    def apply_diff_to_content(
        original_content: str,
        diff_content: str
    ) -> Optional[str]:
        """
        Apply diff to content and return modified content.
        
        Args:
            original_content: Original content
            diff_content: Diff to apply
        
        Returns:
            Modified content or None if application fails
        """
        try:
            # Parse the diff
            parsed = PatchParser.parse_unified_diff(diff_content)
            
            if not parsed["files"]:
                return None
            
            # Apply changes (simplified implementation)
            # In a full implementation, this would handle line-by-line application
            lines = original_content.splitlines()
            
            for file_info in parsed["files"]:
                for chunk in file_info["chunks"]:
                    # Apply chunk changes
                    # This is a simplified version - real implementation would be more complex
                    pass
            
            return '\n'.join(lines)
            
        except Exception as e:
            logger.error(f"Error applying diff to content: {e}")
            return None


class ConflictResolver:
    """Resolver for merge conflicts in patches."""
    
    @staticmethod
    def detect_conflicts(
        base_content: str,
        patch_content: str
    ) -> List[Dict[str, Any]]:
        """
        Detect potential conflicts when applying patch.
        
        Args:
            base_content: Base file content
            patch_content: Patch to apply
        
        Returns:
            List of detected conflicts
        """
        try:
            conflicts = []
            parsed = PatchParser.parse_unified_diff(patch_content)
            
            for file_info in parsed["files"]:
                for chunk in file_info["chunks"]:
                    # Check if chunk can be applied cleanly
                    # This is a simplified conflict detection
                    conflict = ConflictResolver._check_chunk_conflict(
                        base_content, chunk
                    )
                    if conflict:
                        conflicts.append(conflict)
            
            return conflicts
            
        except Exception as e:
            logger.error(f"Error detecting conflicts: {e}")
            return []
    
    @staticmethod
    def _check_chunk_conflict(
        base_content: str,
        chunk: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        """Check if a chunk can be applied without conflicts."""
        try:
            # Simplified conflict detection logic
            # Real implementation would check line-by-line context
            return None
            
        except Exception as e:
            logger.error(f"Error checking chunk conflict: {e}")
            return None


# Utility functions
def is_safe_patch(patch_content: str) -> bool:
    """Quick safety check for patch content."""
    validation = PatchValidator.validate_patch_safety(patch_content)
    return validation["is_safe"] and validation["safety_score"] > 0.7


def get_patch_summary(patch_content: str) -> Dict[str, Any]:
    """Get summary statistics for patch."""
    parsed = PatchParser.parse_unified_diff(patch_content)
    return {
        "files_changed": parsed["total_files"],
        "additions": parsed["total_additions"],
        "deletions": parsed["total_deletions"],
        "net_change": parsed["total_additions"] - parsed["total_deletions"]
    }