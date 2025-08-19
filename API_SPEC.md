# API_SPEC.md
# DO NOT AUTO-GENERATE. Backend API contract for FastAPI service.

## Base
- Base URL: `/api/v1`
- Auth: Bearer JWT (access); refresh token via `/auth/refresh`
- Content-Type: `application/json` (uploads: multipart)
- OpenAPI: `/docs` (Swagger UI), `/openapi.json`

## Error Envelope
```json
{
  "error": { 
    "code": "string", 
    "message": "string", 
    "details": {} 
  }
}
```

## Authentication Endpoints

### POST /api/v1/auth/register ✅ IMPLEMENTED
**Register a new user account**
```json
{
  "email": "user@example.com",
  "username": "username",
  "password": "SecurePass123",
  "full_name": "John Doe",
  "preferred_language": "python",
  "notification_email": true,
  "notification_webhook": false
}
```
**Response**: `UserResponse` (201 Created)

### POST /api/v1/auth/login ✅ IMPLEMENTED
**Authenticate user and get tokens**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```
**Response**: `TokenResponse` (200 OK)
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer",
  "expires_in": 1800
}
```

### POST /api/v1/auth/refresh ✅ IMPLEMENTED
**Refresh access token using refresh token**
```json
{
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```
**Response**: `TokenResponse` (200 OK)

### POST /api/v1/auth/forgot-password ✅ IMPLEMENTED
**Send password reset email**
```json
{
  "email": "user@example.com"
}
```
**Response**: `{"message": "If the email exists, a password reset link has been sent"}` (200 OK)

### POST /api/v1/auth/reset-password ✅ IMPLEMENTED
**Reset password using token**
```json
{
  "token": "reset_token_here",
  "new_password": "NewSecurePass123"
}
```
**Response**: `{"message": "Password reset successfully"}` (200 OK)

## Health Check Endpoints

### GET /api/v1/health ✅ IMPLEMENTED
**Basic health check**
**Response**: 
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "environment": "production"
}
```

### GET /api/v1/health/detailed ✅ IMPLEMENTED
**Detailed health check with service status**
**Response**:
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "environment": "production",
  "services": {
    "database": "healthy",
    "redis": "healthy"
  }
}
```

## User Management Endpoints ❌ TO IMPLEMENT

### GET /api/v1/users/me
**Get current user profile**
**Headers**: `Authorization: Bearer <token>`
**Response**: `UserResponse` (200 OK)

### PUT /api/v1/users/me
**Update current user profile**
**Headers**: `Authorization: Bearer <token>`
```json
{
  "full_name": "Updated Name",
  "bio": "Updated bio",
  "preferred_language": "javascript",
  "notification_email": true,
  "notification_webhook": false
}
```
**Response**: `UserResponse` (200 OK)

### DELETE /api/v1/users/me
**Delete current user account**
**Headers**: `Authorization: Bearer <token>`
**Response**: `{"message": "Account deleted successfully"}` (200 OK)

## Analysis Endpoints ❌ TO IMPLEMENT

### POST /api/v1/analyses
**Create a new code analysis**
**Headers**: `Authorization: Bearer <token>`
```json
{
  "repo_url": "https://github.com/user/repo",
  "branch": "main",
  "commit_sha": "abc123def456",
  "language": "python",
  "analysis_type": "full",
  "custom_rules": {}
}
```
**Response**: `AnalysisResponse` (202 Accepted)

### GET /api/v1/analyses
**List user's analyses with pagination**
**Headers**: `Authorization: Bearer <token>`
**Query Parameters**:
- `page`: int (default: 1)
- `size`: int (default: 20, max: 100)
- `status`: AnalysisStatus (optional)
- `language`: SupportedLanguage (optional)
- `analysis_type`: AnalysisType (optional)

**Response**: `AnalysisListResponse` (200 OK)

### GET /api/v1/analyses/{analysis_id}
**Get analysis details**
**Headers**: `Authorization: Bearer <token>`
**Response**: `AnalysisResponse` (200 OK)

### GET /api/v1/analyses/{analysis_id}/findings
**Get analysis findings**
**Headers**: `Authorization: Bearer <token>`
**Query Parameters**:
- `severity`: FindingSeverity (optional)
- `finding_type`: FindingType (optional)
- `page`: int (default: 1)
- `size`: int (default: 20, max: 100)

**Response**: `PaginatedResponse[FindingResponse]` (200 OK)

### DELETE /api/v1/analyses/{analysis_id}
**Cancel or delete analysis**
**Headers**: `Authorization: Bearer <token>`
**Response**: `{"message": "Analysis deleted successfully"}` (200 OK)

## File Upload Endpoints ❌ TO IMPLEMENT

### POST /api/v1/uploads/presign
**Get presigned URL for file upload**
**Headers**: `Authorization: Bearer <token>`
```json
{
  "filename": "code.py",
  "content_type": "text/plain",
  "file_size": 1024
}
```
**Response**:
```json
{
  "upload_url": "https://s3.amazonaws.com/...",
  "file_url": "https://s3.amazonaws.com/...",
  "fields": {}
}
```

### POST /api/v1/uploads/analyze
**Analyze uploaded file**
**Headers**: `Authorization: Bearer <token>`
```json
{
  "file_url": "https://s3.amazonaws.com/...",
  "language": "python",
  "analysis_type": "security"
}
```
**Response**: `AnalysisResponse` (202 Accepted)

## Webhook Endpoints ❌ TO IMPLEMENT

### POST /api/v1/webhooks/github
**GitHub webhook for automatic analysis**
**Headers**: `X-GitHub-Event: push`, `X-Hub-Signature-256: ...`
**Body**: GitHub webhook payload
**Response**: `{"message": "Webhook processed"}` (200 OK)

### POST /api/v1/webhooks/gitlab
**GitLab webhook for automatic analysis**
**Headers**: `X-Gitlab-Event: Push Hook`, `X-Gitlab-Token: ...`
**Body**: GitLab webhook payload
**Response**: `{"message": "Webhook processed"}` (200 OK)

## WebSocket Endpoints ❌ TO IMPLEMENT

### WS /ws/analyses/{analysis_id}
**Real-time analysis progress updates**
**Headers**: `Authorization: Bearer <token>`

**Message Types**:
```json
// Status update
{
  "type": "status",
  "status": "processing",
  "progress": 45.5
}

// Progress update
{
  "type": "progress",
  "processed_files": 10,
  "total_files": 25,
  "current_file": "src/main.py"
}

// Finding discovered
{
  "type": "finding",
  "finding": {
    "title": "Security vulnerability found",
    "severity": "high",
    "file_path": "src/auth.py",
    "line_number": 42
  }
}

// Analysis complete
{
  "type": "done",
  "summary": "Analysis completed with 5 findings",
  "total_findings": 5
}

// Error occurred
{
  "type": "error",
  "error": "Failed to analyze repository",
  "details": {}
}
```

## Data Models

### UserResponse
```json
{
  "id": 1,
  "email": "user@example.com",
  "username": "username",
  "full_name": "John Doe",
  "is_active": true,
  "is_verified": false,
  "preferred_language": "python",
  "notification_email": true,
  "notification_webhook": false,
  "avatar_url": "https://...",
  "bio": "Developer bio",
  "github_username": "githubuser",
  "gitlab_username": "gitlabuser",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### AnalysisResponse
```json
{
  "id": 1,
  "user_id": 1,
  "repo_url": "https://github.com/user/repo",
  "repo_name": "user/repo",
  "branch": "main",
  "commit_sha": "abc123def456",
  "commit_message": "Update authentication",
  "language": "python",
  "analysis_type": "full",
  "status": "completed",
  "progress": 100.0,
  "total_files": 25,
  "processed_files": 25,
  "summary": "Analysis found 5 security issues",
  "total_findings": 5,
  "critical_findings": 1,
  "high_findings": 2,
  "medium_findings": 1,
  "low_findings": 1,
  "processing_time": 45.2,
  "ai_model_used": "claude-3-sonnet-20240229",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### FindingResponse
```json
{
  "id": 1,
  "analysis_id": 1,
  "title": "SQL Injection Vulnerability",
  "description": "User input is directly used in SQL query without sanitization",
  "severity": "high",
  "finding_type": "security",
  "file_path": "src/database.py",
  "line_number": 42,
  "column_number": 15,
  "code_snippet": "query = f\"SELECT * FROM users WHERE id = {user_id}\"",
  "ai_explanation": "This code is vulnerable to SQL injection...",
  "suggested_fix": "Use parameterized queries: query = \"SELECT * FROM users WHERE id = %s\"",
  "confidence_score": 0.95,
  "rule_id": "SQL_INJECTION_001",
  "tags": ["security", "sql-injection"],
  "is_auto_fixable": true,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

## Enums

### AnalysisStatus
- `pending` - Analysis queued
- `processing` - Analysis in progress
- `completed` - Analysis finished successfully
- `failed` - Analysis failed
- `cancelled` - Analysis cancelled by user

### FindingSeverity
- `low` - Minor issue
- `medium` - Moderate issue
- `high` - Significant issue
- `critical` - Critical security/performance issue

### FindingType
- `bug` - Software bug
- `security` - Security vulnerability
- `performance` - Performance issue
- `code_smell` - Code quality issue
- `refactoring` - Refactoring opportunity
- `style` - Code style issue
- `documentation` - Documentation issue

### SupportedLanguage
- `python`, `javascript`, `typescript`, `java`, `csharp`
- `go`, `rust`, `php`, `ruby`, `swift`, `kotlin`, `scala`

### AnalysisType
- `full` - Comprehensive analysis
- `security` - Security-focused analysis
- `performance` - Performance-focused analysis
- `style` - Code style analysis
- `documentation` - Documentation analysis
- `custom` - Custom analysis rules

## Rate Limiting
- Global: 100 requests per minute
- Login: 5 requests per minute
- Analysis: 10 requests per hour
- File upload: 20 requests per hour

## Implementation Status
- ✅ **Authentication System**: Complete JWT implementation
- ✅ **Health Checks**: Basic and detailed health endpoints
- ✅ **Data Models**: All SQLAlchemy models and Pydantic schemas
- ✅ **AI Services**: OpenAI/Claude integration
- ✅ **Email System**: SMTP notification system
- ❌ **User Management**: Profile CRUD operations
- ❌ **Analysis System**: Core analysis endpoints
- ❌ **File Upload**: S3 integration
- ❌ **Webhooks**: GitHub/GitLab integration
- ❌ **WebSockets**: Real-time progress updates
- ❌ **Worker System**: Background job processing
