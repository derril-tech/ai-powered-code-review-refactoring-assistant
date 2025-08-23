# API v1 Instructions

## Purpose
This directory contains all API v1 endpoints for the AI Code Review Assistant. Each file represents a different domain of functionality.

## Files Overview

### ✅ **COMPLETED FILES**
- `auth.py` - Authentication endpoints (login, register, refresh, password reset)
- `health.py` - Health check endpoints
- `users.py` - User profile management endpoints
- `analyses.py` - Code analysis endpoints
- `uploads.py` - File upload and processing endpoints
- `webhooks.py` - Git platform webhook integration
- `ws.py` - WebSocket endpoints for real-time communication

### 🔧 **IMPLEMENTATION STATUS**

#### **Authentication System** ✅ COMPLETE
- JWT-based authentication with refresh tokens
- User registration and login
- Password reset functionality
- Token refresh mechanism

#### **Health Checks** ✅ COMPLETE
- Basic health check endpoint
- Detailed health check with service status

#### **User Management** ✅ COMPLETE
- Get current user profile
- Update user profile
- Delete user account
- User analysis history

#### **Code Analysis** ⚠️ PARTIAL
- ✅ Create analysis endpoint
- ✅ Analysis listing with filters
- ✅ Get analysis details
- ✅ Get analysis findings
- ❌ **TODO**: Implement actual analysis logic in `perform_analysis()` function
- ❌ **TODO**: Add database queries for analysis retrieval
- ❌ **TODO**: Implement finding storage and retrieval

#### **File Upload** ⚠️ PARTIAL
- ✅ Presigned URL generation (stub)
- ✅ File validation and type checking
- ✅ Direct file upload endpoint
- ❌ **TODO**: Implement S3 integration for presigned URLs
- ❌ **TODO**: Add file processing and analysis triggering
- ❌ **TODO**: Implement temporary file storage

#### **Webhooks** ⚠️ PARTIAL
- ✅ GitHub webhook endpoint structure
- ✅ GitLab webhook endpoint structure
- ✅ Event type handling
- ❌ **TODO**: Implement signature verification
- ❌ **TODO**: Add automatic analysis triggering
- ❌ **TODO**: Connect to analysis system

#### **WebSocket** ⚠️ PARTIAL
- ✅ WebSocket connection management
- ✅ Real-time message handling
- ✅ Analysis update broadcasting
- ❌ **TODO**: Integrate with analysis progress updates
- ❌ **TODO**: Add notification system integration

## 🚀 **NEXT STEPS FOR CLAUDE**

### **Priority 1: Complete Analysis System**
1. **Implement `perform_analysis()` function** in `analyses.py`
   - Add AI service integration
   - Implement progress tracking
   - Add finding generation and storage
   - Connect to WebSocket updates

2. **Add database queries** for analysis operations
   - Analysis listing with pagination
   - Analysis retrieval by ID
   - Finding storage and retrieval

### **Priority 2: Complete File Upload System**
1. **Implement S3 integration** in `uploads.py`
   - Add boto3 for AWS S3
   - Generate actual presigned URLs
   - Implement file storage and retrieval

2. **Connect file upload to analysis**
   - Trigger analysis after file upload
   - Process uploaded files
   - Clean up temporary files

### **Priority 3: Complete Webhook Integration**
1. **Implement signature verification**
   - Add GitHub webhook secret verification
   - Add GitLab token verification
   - Secure webhook processing

2. **Connect webhooks to analysis**
   - Trigger analysis on push events
   - Handle pull request events
   - Store webhook configuration

### **Priority 4: Enhance WebSocket System**
1. **Integrate with analysis progress**
   - Send real-time progress updates
   - Broadcast finding discoveries
   - Handle analysis completion

2. **Add notification system**
   - User notification preferences
   - Email integration
   - Real-time notifications

## 📋 **CODING GUIDELINES**

### **Error Handling**
- Use proper HTTP status codes
- Return consistent error response format
- Log errors with appropriate detail
- Handle database transaction rollbacks

### **Authentication**
- All protected endpoints must use `get_current_user` dependency
- Validate user permissions where needed
- Handle token expiration gracefully

### **Validation**
- Use Pydantic schemas for request validation
- Validate file types and sizes
- Sanitize user inputs
- Check business logic constraints

### **Documentation**
- Add docstrings to all functions
- Document request/response formats
- Include examples in comments
- Update API documentation

## 🔗 **DEPENDENCIES**

### **Required Services**
- `app.services.ai_service.AIService` - AI analysis integration
- `app.models.user.User` - User model
- `app.models.analysis.Analysis` - Analysis model
- `app.schemas.*` - Request/response schemas
- `app.core.security` - Authentication utilities

### **External Dependencies**
- FastAPI for API framework
- SQLAlchemy for database operations
- WebSocket for real-time communication
- boto3 for S3 integration (TODO)

## 🧪 **TESTING**

### **Unit Tests**
- Test each endpoint function
- Mock external dependencies
- Test error scenarios
- Validate response formats

### **Integration Tests**
- Test complete API workflows
- Test database operations
- Test authentication flows
- Test WebSocket connections

### **API Tests**
- Test all endpoints with Postman/curl
- Validate OpenAPI documentation
- Test rate limiting
- Test security measures

## 📚 **RESOURCES**

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
- [WebSocket RFC](https://tools.ietf.org/html/rfc6455)
- [GitHub Webhooks](https://docs.github.com/en/developers/webhooks-and-events)
- [GitLab Webhooks](https://docs.gitlab.com/ee/user/project/integrations/webhooks.html)
