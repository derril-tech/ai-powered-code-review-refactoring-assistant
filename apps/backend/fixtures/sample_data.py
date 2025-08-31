"""
Sample data and fixtures for development and testing.
"""

import uuid
from datetime import datetime, timedelta
from typing import List, Dict, Any

# Sample users
SAMPLE_USERS = [
    {
        "id": str(uuid.uuid4()),
        "email": "john.doe@example.com",
        "name": "John Doe",
        "hashed_password": "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.i8eG",  # password123
        "is_active": True,
        "created_at": datetime.utcnow() - timedelta(days=30),
        "updated_at": datetime.utcnow(),
    },
    {
        "id": str(uuid.uuid4()),
        "email": "jane.smith@example.com",
        "name": "Jane Smith",
        "hashed_password": "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.i8eG",  # password123
        "is_active": True,
        "created_at": datetime.utcnow() - timedelta(days=15),
        "updated_at": datetime.utcnow(),
    },
    {
        "id": str(uuid.uuid4()),
        "email": "admin@aicode-review.com",
        "name": "Admin User",
        "hashed_password": "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.i8eG",  # password123
        "is_active": True,
        "is_admin": True,
        "created_at": datetime.utcnow() - timedelta(days=60),
        "updated_at": datetime.utcnow(),
    },
]

# Sample repositories
SAMPLE_REPOSITORIES = [
    {
        "id": str(uuid.uuid4()),
        "name": "my-web-app",
        "url": "https://github.com/johndoe/my-web-app",
        "provider": "github",
        "user_id": SAMPLE_USERS[0]["id"],
        "is_active": True,
        "created_at": datetime.utcnow() - timedelta(days=20),
        "updated_at": datetime.utcnow(),
    },
    {
        "id": str(uuid.uuid4()),
        "name": "api-service",
        "url": "https://github.com/janesmith/api-service",
        "provider": "github",
        "user_id": SAMPLE_USERS[1]["id"],
        "is_active": True,
        "created_at": datetime.utcnow() - timedelta(days=10),
        "updated_at": datetime.utcnow(),
    },
    {
        "id": str(uuid.uuid4()),
        "name": "frontend-components",
        "url": "https://gitlab.com/johndoe/frontend-components",
        "provider": "gitlab",
        "user_id": SAMPLE_USERS[0]["id"],
        "is_active": True,
        "created_at": datetime.utcnow() - timedelta(days=5),
        "updated_at": datetime.utcnow(),
    },
]

# Sample analyses
SAMPLE_ANALYSES = [
    {
        "id": str(uuid.uuid4()),
        "user_id": SAMPLE_USERS[0]["id"],
        "repository_id": SAMPLE_REPOSITORIES[0]["id"],
        "branch": "main",
        "commit_hash": "abc123def456",
        "status": "completed",
        "score": 85,
        "total_issues": 12,
        "security_issues": 3,
        "performance_issues": 2,
        "quality_issues": 7,
        "created_at": datetime.utcnow() - timedelta(hours=2),
        "updated_at": datetime.utcnow() - timedelta(hours=1),
        "completed_at": datetime.utcnow() - timedelta(hours=1),
    },
    {
        "id": str(uuid.uuid4()),
        "user_id": SAMPLE_USERS[1]["id"],
        "repository_id": SAMPLE_REPOSITORIES[1]["id"],
        "branch": "feature/auth",
        "commit_hash": "def456ghi789",
        "status": "processing",
        "score": None,
        "total_issues": None,
        "security_issues": None,
        "performance_issues": None,
        "quality_issues": None,
        "created_at": datetime.utcnow() - timedelta(minutes=30),
        "updated_at": datetime.utcnow() - timedelta(minutes=5),
        "completed_at": None,
    },
    {
        "id": str(uuid.uuid4()),
        "user_id": SAMPLE_USERS[0]["id"],
        "repository_id": SAMPLE_REPOSITORIES[2]["id"],
        "branch": "main",
        "commit_hash": "ghi789jkl012",
        "status": "completed",
        "score": 92,
        "total_issues": 8,
        "security_issues": 1,
        "performance_issues": 0,
        "quality_issues": 7,
        "created_at": datetime.utcnow() - timedelta(days=1),
        "updated_at": datetime.utcnow() - timedelta(days=1, hours=-2),
        "completed_at": datetime.utcnow() - timedelta(days=1, hours=-2),
    },
]

# Sample issues
SAMPLE_ISSUES = [
    {
        "id": str(uuid.uuid4()),
        "analysis_id": SAMPLE_ANALYSES[0]["id"],
        "file_path": "src/auth/security.py",
        "line_number": 45,
        "severity": "high",
        "category": "security",
        "title": "Hardcoded API key detected",
        "description": "API key is hardcoded in the source code, which is a security risk.",
        "suggestion": "Move the API key to environment variables or a secure configuration management system.",
        "code_snippet": "api_key = 'sk-1234567890abcdef'",
        "created_at": datetime.utcnow() - timedelta(hours=1),
    },
    {
        "id": str(uuid.uuid4()),
        "analysis_id": SAMPLE_ANALYSES[0]["id"],
        "file_path": "src/utils/performance.py",
        "line_number": 23,
        "severity": "medium",
        "category": "performance",
        "title": "Inefficient database query",
        "description": "N+1 query problem detected in the user loading function.",
        "suggestion": "Use eager loading or batch queries to reduce database calls.",
        "code_snippet": "for user in users:\n    posts = get_user_posts(user.id)",
        "created_at": datetime.utcnow() - timedelta(hours=1),
    },
    {
        "id": str(uuid.uuid4()),
        "analysis_id": SAMPLE_ANALYSES[0]["id"],
        "file_path": "src/models/user.py",
        "line_number": 67,
        "severity": "low",
        "category": "quality",
        "title": "Missing type hints",
        "description": "Function parameters lack type annotations.",
        "suggestion": "Add type hints to improve code readability and enable better IDE support.",
        "code_snippet": "def create_user(name, email, password):",
        "created_at": datetime.utcnow() - timedelta(hours=1),
    },
    {
        "id": str(uuid.uuid4()),
        "analysis_id": SAMPLE_ANALYSES[2]["id"],
        "file_path": "components/Button.tsx",
        "line_number": 12,
        "severity": "low",
        "category": "quality",
        "title": "Unused import",
        "description": "Import statement for 'useState' is not used in this component.",
        "suggestion": "Remove the unused import to clean up the code.",
        "code_snippet": "import React, { useState } from 'react';",
        "created_at": datetime.utcnow() - timedelta(days=1, hours=-2),
    },
]

# Sample recommendations
SAMPLE_RECOMMENDATIONS = [
    {
        "id": str(uuid.uuid4()),
        "analysis_id": SAMPLE_ANALYSES[0]["id"],
        "title": "Implement proper authentication",
        "description": "Consider implementing OAuth2 or JWT-based authentication for better security.",
        "priority": "high",
        "category": "security",
        "created_at": datetime.utcnow() - timedelta(hours=1),
    },
    {
        "id": str(uuid.uuid4()),
        "analysis_id": SAMPLE_ANALYSES[0]["id"],
        "title": "Add comprehensive testing",
        "description": "The codebase lacks sufficient test coverage. Aim for at least 80% coverage.",
        "priority": "medium",
        "category": "quality",
        "created_at": datetime.utcnow() - timedelta(hours=1),
    },
    {
        "id": str(uuid.uuid4()),
        "analysis_id": SAMPLE_ANALYSES[2]["id"],
        "title": "Optimize bundle size",
        "description": "Consider code splitting and lazy loading to reduce initial bundle size.",
        "priority": "medium",
        "category": "performance",
        "created_at": datetime.utcnow() - timedelta(days=1, hours=-2),
    },
]

# Sample code files for analysis
SAMPLE_CODE_FILES = {
    "python": {
        "main.py": """
import os
import requests
from typing import List, Dict

# TODO: Add proper error handling
def fetch_data(url: str) -> Dict:
    response = requests.get(url)
    return response.json()

def process_user_data(user_input: str) -> str:
    # Missing input validation
    result = user_input.strip()
    return result.upper()

def connect_database():
    password = "hardcoded_password_123"  # Security issue
    connection_string = f"postgresql://user:{password}@localhost/db"
    return connection_string

class UserManager:
    def __init__(self):
        self.users = []
    
    def add_user(self, user):
        # Missing validation
        self.users.append(user)
        return True

def calculate_fibonacci(n):
    """Calculate the nth Fibonacci number."""
    if n <= 0:
        return 0
    elif n == 1:
        return 1
    else:
        return calculate_fibonacci(n-1) + calculate_fibonacci(n-2)  # Performance issue
""",
        "requirements.txt": """
fastapi==0.104.1
uvicorn==0.24.0
sqlalchemy==2.0.23
pydantic==2.5.0
requests==2.31.0
python-dotenv==1.0.0
""",
    },
    "javascript": {
        "app.js": """
// Missing 'use strict' directive
const express = require('express');
const app = express();

// Hardcoded secret
const API_KEY = 'sk-1234567890abcdef';

app.get('/users', async (req, res) => {
    try {
        // SQL injection vulnerability
        const query = `SELECT * FROM users WHERE id = ${req.query.id}`;
        const users = await db.query(query);
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Unused function
function unusedFunction() {
    console.log('This function is never called');
}

app.listen(3000, () => {
    console.log('Server running on port 3000');
});
""",
        "package.json": """
{
  "name": "my-app",
  "version": "1.0.0",
  "dependencies": {
    "express": "^4.18.2",
    "mysql2": "^3.6.5"
  }
}
""",
    },
    "typescript": {
        "components/Button.tsx": """
import React, { useState } from 'react';  // Unused import

interface ButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: 'primary' | 'secondary';
    disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
    children, 
    onClick, 
    variant = 'primary',
    disabled = false 
}) => {
    // Missing error handling
    const handleClick = () => {
        if (onClick) onClick();
    };

    return (
        <button 
            className={`btn btn-${variant}`}
            onClick={handleClick}
            disabled={disabled}
        >
            {children}
        </button>
    );
};
""",
    },
}

# Mock API responses
MOCK_API_RESPONSES = {
    "analysis_start": {
        "success": True,
        "data": {
            "analysis_id": str(uuid.uuid4()),
            "status": "processing",
            "message": "Analysis started successfully",
        },
    },
    "analysis_complete": {
        "success": True,
        "data": {
            "analysis_id": SAMPLE_ANALYSES[0]["id"],
            "status": "completed",
            "score": 85,
            "total_issues": 12,
            "issues": SAMPLE_ISSUES[:3],
            "recommendations": SAMPLE_RECOMMENDATIONS[:2],
        },
    },
    "analysis_failed": {
        "success": False,
        "error": "Failed to analyze repository",
        "message": "Repository access denied or invalid URL",
    },
}

def get_sample_user(user_id: str = None) -> Dict[str, Any]:
    """Get a sample user by ID or return the first one."""
    if user_id:
        return next((user for user in SAMPLE_USERS if user["id"] == user_id), SAMPLE_USERS[0])
    return SAMPLE_USERS[0]

def get_sample_analysis(analysis_id: str = None) -> Dict[str, Any]:
    """Get a sample analysis by ID or return the first one."""
    if analysis_id:
        return next((analysis for analysis in SAMPLE_ANALYSES if analysis["id"] == analysis_id), SAMPLE_ANALYSES[0])
    return SAMPLE_ANALYSES[0]

def get_sample_issues(analysis_id: str = None) -> List[Dict[str, Any]]:
    """Get sample issues for an analysis."""
    if analysis_id:
        return [issue for issue in SAMPLE_ISSUES if issue["analysis_id"] == analysis_id]
    return SAMPLE_ISSUES

def get_sample_recommendations(analysis_id: str = None) -> List[Dict[str, Any]]:
    """Get sample recommendations for an analysis."""
    if analysis_id:
        return [rec for rec in SAMPLE_RECOMMENDATIONS if rec["analysis_id"] == analysis_id]
    return SAMPLE_RECOMMENDATIONS
