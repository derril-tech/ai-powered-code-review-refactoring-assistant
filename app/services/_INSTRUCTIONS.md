# Services Instructions

## Purpose
This directory contains business logic services that handle core application functionality, including AI integration, email notifications, and external API interactions.

## Files Overview

### ✅ **COMPLETED FILES**
- `ai_service.py` - AI analysis service (OpenAI/Claude integration)
- `email_service.py` - Email notification service

### 🔧 **IMPLEMENTATION STATUS**

#### **AI Service** ⚠️ PARTIAL
- ✅ Basic OpenAI integration structure
- ✅ Claude API integration structure
- ✅ Code analysis prompts
- ✅ Finding generation
- ❌ **TODO**: Implement actual AI model calls
- ❌ **TODO**: Add error handling and retries
- ❌ **TODO**: Implement rate limiting
- ❌ **TODO**: Add result caching

#### **Email Service** ⚠️ PARTIAL
- ✅ SMTP configuration
- ✅ Email template structure
- ✅ Notification types
- ❌ **TODO**: Implement actual email sending
- ❌ **TODO**: Add email templates
- ❌ **TODO**: Implement email queuing
- ❌ **TODO**: Add email tracking

### ❌ **MISSING SERVICES**

#### **File Processing Service**
- `file_service.py` - File upload, processing, and storage
- `git_service.py` - Git repository integration
- `storage_service.py` - Cloud storage integration (S3)

#### **Analysis Service**
- `analysis_service.py` - Core analysis orchestration
- `finding_service.py` - Finding processing and storage
- `report_service.py` - Report generation

#### **Notification Service**
- `notification_service.py` - Multi-channel notifications
- `webhook_service.py` - Webhook processing
- `websocket_service.py` - Real-time updates

## 🚀 **NEXT STEPS FOR CLAUDE**

### **Priority 1: Complete AI Service**
1. **Implement AI model integration**
   ```python
   # In ai_service.py
   async def analyze_code(self, code: str, language: str, analysis_type: str) -> List[Finding]:
       """Analyze code using AI models."""
       # TODO: Implement actual AI calls
       # TODO: Add proper error handling
       # TODO: Implement result caching
       pass
   ```

2. **Add comprehensive error handling**
   - API rate limiting
   - Network timeouts
   - Model availability
   - Fallback strategies

3. **Implement result caching**
   - Cache analysis results
   - Cache model responses
   - Implement cache invalidation
   - Add cache monitoring

### **Priority 2: Complete Email Service**
1. **Implement email sending**
   ```python
   # In email_service.py
   async def send_analysis_complete_email(self, user: User, analysis: Analysis) -> bool:
       """Send analysis completion email."""
       # TODO: Implement actual email sending
       # TODO: Add email templates
       # TODO: Handle email failures
       pass
   ```

2. **Add email templates**
   - HTML email templates
   - Text email templates
   - Dynamic content injection
   - Branding and styling

3. **Implement email queuing**
   - Background email processing
   - Retry mechanisms
   - Email delivery tracking
   - Bounce handling

### **Priority 3: Create Missing Services**
1. **File Processing Service**
   ```python
   # file_service.py
   class FileService:
       async def upload_file(self, file: UploadFile) -> str:
           """Upload file to cloud storage."""
           pass
       
       async def process_file(self, file_url: str) -> dict:
           """Process uploaded file."""
           pass
   ```

2. **Git Integration Service**
   ```python
   # git_service.py
   class GitService:
       async def clone_repository(self, repo_url: str) -> str:
           """Clone repository for analysis."""
           pass
       
       async def get_file_contents(self, repo_path: str, file_path: str) -> str:
           """Get file contents from repository."""
           pass
   ```

3. **Analysis Orchestration Service**
   ```python
   # analysis_service.py
   class AnalysisService:
       async def run_analysis(self, analysis_request: AnalysisRequest) -> Analysis:
           """Run complete analysis workflow."""
           pass
       
       async def process_findings(self, findings: List[Finding]) -> List[Finding]:
           """Process and categorize findings."""
           pass
   ```

## 📋 **CODING GUIDELINES**

### **Service Architecture**
- Use dependency injection
- Implement proper error handling
- Add comprehensive logging
- Use async/await patterns

### **Error Handling**
- Catch specific exceptions
- Implement retry mechanisms
- Add fallback strategies
- Log errors with context

### **Performance**
- Implement caching where appropriate
- Use connection pooling
- Add request timeouts
- Monitor service performance

### **Testing**
- Mock external dependencies
- Test error scenarios
- Validate service contracts
- Add integration tests

## 🔗 **DEPENDENCIES**

### **External Services**
- OpenAI API for GPT models
- Anthropic API for Claude models
- SMTP server for emails
- S3-compatible storage
- Git hosting platforms

### **Internal Dependencies**
- `app.models.*` - Database models
- `app.schemas.*` - Data validation
- `app.core.config` - Configuration
- `app.core.logging` - Logging utilities

## 🧪 **TESTING STRATEGY**

### **Unit Tests**
- Test individual service methods
- Mock external API calls
- Test error handling
- Validate data transformations

### **Integration Tests**
- Test service interactions
- Test external API integration
- Test database operations
- Test email delivery

### **Performance Tests**
- Test service response times
- Test concurrent requests
- Test memory usage
- Test error recovery

## 📊 **MONITORING**

### **Metrics to Track**
- Service response times
- Error rates
- API usage quotas
- Cache hit rates
- Email delivery rates

### **Logging**
- Request/response logging
- Error logging with context
- Performance metrics
- External API calls

## 🔒 **SECURITY**

### **API Security**
- Secure API key storage
- Rate limiting
- Request validation
- Error message sanitization

### **Data Security**
- Encrypt sensitive data
- Secure file storage
- Access control
- Audit logging

## 📚 **RESOURCES**

- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Anthropic API Documentation](https://docs.anthropic.com/)
- [Python SMTP Documentation](https://docs.python.org/3/library/smtplib.html)
- [boto3 Documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/index.html)
- [GitPython Documentation](https://gitpython.readthedocs.io/)
