# CLAUDE.md - AI Collaboration Guidelines

## 🎯 Project Overview

**AI-Powered Code Review and Refactoring Assistant** is an intelligent, automated tool designed to revolutionize the software development lifecycle. By leveraging advanced AI and machine learning, it provides developers with instant, actionable feedback on their code, significantly accelerating the code review process and enhancing overall code quality.

### **Tech Stack**
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Radix UI
- **Backend**: FastAPI, Python 3.11+, SQLAlchemy 2.0, PostgreSQL
- **AI Services**: OpenAI GPT-4, Anthropic Claude
- **Real-time**: WebSocket, Redis
- **Deployment**: Docker, Docker Compose

### **Target Users**
- Software developers and development teams
- Code reviewers and quality assurance engineers
- DevOps engineers and security professionals
- Open source maintainers and contributors

### **Core Goals**
1. Provide intelligent, context-aware code analysis
2. Automate repetitive code review tasks
3. Detect security vulnerabilities and performance issues
4. Suggest and apply automated refactoring
5. Integrate seamlessly with existing development workflows

---

## 📁 Folder & File Structure

### **Editable Files** ✅
- `frontend/app/` - Next.js pages and layouts
- `frontend/components/` - React components
- `frontend/contexts/` - React context providers
- `frontend/hooks/` - Custom React hooks
- `frontend/lib/` - Utility functions and configurations
- `app/api/v1/` - FastAPI route handlers
- `app/models/` - SQLAlchemy database models
- `app/schemas/` - Pydantic validation schemas
- `app/services/` - Business logic services
- `app/core/` - Core configuration and utilities

### **Do Not Touch** ❌
- `docs/` - Documentation files (except when explicitly asked)
- `docker-compose.yml` - Infrastructure configuration
- `Dockerfile` - Container configuration
- `requirements.txt` - Python dependencies
- `package.json` - Node.js dependencies
- Configuration files (`.env.example`, `alembic.ini`, etc.)

### **Conditionally Editable** ⚠️
- `app/main.py` - Only modify route imports and middleware
- `frontend/next.config.js` - Only for build configuration
- `frontend/tailwind.config.js` - Only for styling configuration

---

## 🎨 Coding Conventions

### **Python (Backend)**
```python
# Use type hints for all functions
def analyze_code(code: str, language: str) -> AnalysisResult:
    """Analyze code using AI service.
    
    Args:
        code: Source code to analyze
        language: Programming language
        
    Returns:
        AnalysisResult with findings and suggestions
    """
    pass

# Use async/await for database operations
async def get_user_by_id(user_id: int) -> Optional[User]:
    async with get_db() as db:
        return await db.get(User, user_id)

# Use Pydantic for data validation
class AnalysisRequest(BaseModel):
    repo_url: HttpUrl
    language: SupportedLanguage
    analysis_type: AnalysisType = AnalysisType.FULL
```

### **TypeScript (Frontend)**
```typescript
// Use interfaces for type definitions
interface AnalysisResult {
  id: number;
  status: AnalysisStatus;
  findings: Finding[];
  progress: number;
}

// Use React hooks for state management
const useAnalysis = (analysisId: number) => {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Fetch analysis data
  }, [analysisId]);
  
  return { analysis, loading };
};

// Use proper error handling
const handleAnalysis = async (data: AnalysisRequest) => {
  try {
    const result = await api.analyses.create(data);
    toast.success('Analysis started successfully');
  } catch (error) {
    toast.error('Failed to start analysis');
    console.error(error);
  }
};
```

### **File Naming**
- **Python**: snake_case (`user_service.py`, `auth_router.py`)
- **TypeScript**: camelCase (`useAnalysis.ts`, `authContext.tsx`)
- **Components**: PascalCase (`AnalysisCard.tsx`, `UserProfile.tsx`)

### **Comments and Documentation**
- Write docstrings for all Python functions
- Add JSDoc comments for TypeScript functions
- Include examples in complex logic
- Document API endpoints with clear descriptions

---

## 🤖 AI Collaboration Rules

### **Response Format**
1. **Always start with a summary** of what you're going to do
2. **Use code blocks** with proper syntax highlighting
3. **Include explanations** for complex logic
4. **Provide context** for your decisions
5. **End with next steps** or questions if needed

### **Edit Rules**
- **Full file edits**: When creating new files or completely rewriting
- **Patch edits**: When modifying existing files (use search_replace)
- **Always preserve existing structure** unless explicitly asked to change
- **Maintain backward compatibility** when possible

### **Ambiguity Handling**
- **Ask clarifying questions** when requirements are unclear
- **Suggest alternatives** when multiple approaches exist
- **Explain trade-offs** for different solutions
- **Provide examples** to illustrate your understanding

### **Error Prevention**
- **Validate inputs** before processing
- **Handle edge cases** explicitly
- **Add proper error messages** for debugging
- **Test your assumptions** with examples

---

## 🔧 Dependencies & Setup

### **Backend Dependencies**
```python
# Core Framework
fastapi==0.104.1
uvicorn[standard]==0.24.0

# Database
sqlalchemy==2.0.23
alembic==1.12.1
psycopg2-binary==2.9.9

# Authentication
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4

# AI Services
openai==1.3.7
anthropic==0.7.7

# Utilities
pydantic==2.5.0
python-multipart==0.0.6
loguru==0.7.2
```

### **Frontend Dependencies**
```json
{
  "dependencies": {
    "next": "14.0.4",
    "react": "18.2.0",
    "typescript": "5.3.3",
    "tailwindcss": "3.3.6",
    "@radix-ui/react-*": "latest",
    "axios": "1.6.2",
    "lucide-react": "0.294.0"
  }
}
```

### **Environment Variables**
```bash
# Backend (.env)
DATABASE_URL=postgresql://user:password@localhost:5432/code_review_db
SECRET_KEY=your-secret-key-here
OPENAI_API_KEY=your-openai-api-key
CLAUDE_API_KEY=your-claude-api-key

# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
```

---

## 🚀 Workflow & Tools

### **Local Development**
```bash
# Backend
cd app
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload

# Frontend
cd frontend
npm install
npm run dev
```

### **Database Setup**
```bash
# Using Docker
docker-compose up -d postgres

# Manual setup
psql -U postgres -f init.sql
alembic upgrade head
```

### **Testing**
```bash
# Backend tests
cd app
pytest

# Frontend tests
cd frontend
npm test
```

### **Frontend/Backend Boundary**
- **Frontend**: UI components, state management, API calls
- **Backend**: Business logic, database operations, AI integration
- **Shared**: Type definitions, validation schemas
- **Communication**: REST API + WebSocket for real-time updates

---

## 🧠 Contextual Knowledge

### **Domain Rules**
1. **Analysis Types**: full, security, performance, style, documentation
2. **Finding Severity**: critical, high, medium, low
3. **Supported Languages**: Python, JavaScript, TypeScript, Java, C#, Go, Rust, PHP, Ruby, Swift, Kotlin, Scala
4. **User Roles**: Regular users, Premium users, Administrators

### **Business Logic**
- **Authentication**: JWT with refresh token rotation
- **File Processing**: Secure upload with virus scanning
- **AI Analysis**: Async processing with progress tracking
- **Notifications**: Email and webhook notifications
- **Rate Limiting**: Per-endpoint and per-user limits

### **Security Considerations**
- **Input Validation**: All user inputs must be validated
- **SQL Injection**: Use parameterized queries only
- **XSS Protection**: Sanitize all user-generated content
- **File Upload**: Validate file types and scan for malware
- **API Security**: Rate limiting, CORS, authentication

### **Performance Requirements**
- **API Response Time**: < 200ms for simple operations
- **Analysis Processing**: < 5 minutes for typical repositories
- **Frontend Load Time**: < 3 seconds for initial page load
- **Database Queries**: Optimized with proper indexing

---

## 📝 Examples

### **Good AI Answer** ✅
```
I'll help you implement the user profile update endpoint. This will allow users to modify their profile information while maintaining data integrity.

Here's the implementation:

**1. Update the user schema:**
```python
# app/schemas/user.py
class UserUpdateRequest(BaseModel):
    full_name: Optional[str] = None
    bio: Optional[str] = None
    preferred_language: Optional[SupportedLanguage] = None
    notification_email: Optional[bool] = None
    notification_webhook: Optional[bool] = None
```

**2. Add the endpoint:**
```python
# app/api/v1/users.py
@router.put("/me", response_model=UserResponse)
async def update_current_user(
    user_update: UserUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update current user profile."""
    # Update only provided fields
    for field, value in user_update.dict(exclude_unset=True).items():
        setattr(current_user, field, value)
    
    await db.commit()
    await db.refresh(current_user)
    
    return current_user
```

**3. Add validation:**
- Full name must be 2-100 characters
- Bio must be < 500 characters
- Language must be from supported list

This implementation follows our patterns for:
- Type safety with Pydantic schemas
- Proper error handling
- Database transaction management
- User authentication

Next steps: Add tests and update the frontend to use this endpoint.
```

### **Bad AI Answer** ❌
```
Here's the code:

```python
@router.put("/me")
def update_user(data):
    user = get_user()
    user.name = data.name
    user.bio = data.bio
    save_user(user)
    return user
```

This is bad because:
- No type hints or validation
- No error handling
- No authentication check
- No database transaction management
- No documentation
- Inconsistent with project patterns
```

---

## 🎯 Success Criteria

### **Code Quality**
- [ ] All functions have type hints
- [ ] Proper error handling implemented
- [ ] Tests written for new functionality
- [ ] Documentation updated
- [ ] Follows project coding conventions

### **User Experience**
- [ ] Intuitive and responsive UI
- [ ] Clear error messages
- [ ] Loading states implemented
- [ ] Accessibility guidelines followed
- [ ] Mobile-friendly design

### **Performance**
- [ ] API responses under 200ms
- [ ] Database queries optimized
- [ ] Frontend bundle size reasonable
- [ ] Caching implemented where appropriate

### **Security**
- [ ] Input validation implemented
- [ ] Authentication required where needed
- [ ] SQL injection prevented
- [ ] XSS protection in place

---

## 🆘 When You Need Help

### **Ask for Clarification When**
- Requirements are ambiguous
- Multiple approaches are equally valid
- Performance vs. simplicity trade-offs
- Security implications are unclear

### **Provide Context When**
- Suggesting architectural changes
- Implementing complex business logic
- Adding new dependencies
- Modifying existing patterns

### **Examples of Good Questions**
- "Should this be a separate service or part of the existing one?"
- "What's the expected user flow for this feature?"
- "Are there any performance constraints I should consider?"
- "How should we handle the error case where the AI service is unavailable?"

---

*This document is maintained by the development team and should be updated as the project evolves. Always refer to this guide when working on the AI Code Review Assistant project.*
