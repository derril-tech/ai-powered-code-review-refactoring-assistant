# CLAUDE.md - AI Collaboration Guidelines

## 🎯 Project Overview

**RefactorIQ™ - AI Code Review & Refactoring Autopilot** is an intelligent, automated tool designed to revolutionize the software development lifecycle. By leveraging advanced AI and machine learning, it provides developers with confidence-scored auto-fixes, test patches, and one-click apply capabilities, significantly accelerating the code review process and enhancing overall code quality.

### **Product Vision**
- **Meta-leverage**: Every suggestion improves many future diffs
- **Context-aware**: Understands intent, patterns, and project standards (not just lint rules)
- **Safe by design**: Confidence-scored fixes, tests-first patches, and gated rollouts
- **Seamless fit**: PR comments, status checks, and one-click apply via bot or IDE

### **Demo Flow (90 seconds)**
1. Push a branch → GitHub webhook triggers /analyses job
2. Streaming WebSocket shows progress (parsing → embeddings → LLM eval → proposals)
3. PR gets a findings summary comment + inline suggestions
4. Click "Create Fix PR" to open bot PR with atomic commits + tests
5. Merge → dashboards update Code Health, MTTR, and Hotspots metrics

### **Tech Stack**
- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Radix UI, Zustand + TanStack Query, Framer Motion
- **Backend**: FastAPI (async), SQLAlchemy 2.0 (async), Alembic, JWT w/ refresh rotation, Redis rate-limiting and cache, WebSockets, Arq workers
- **Database**: PostgreSQL 15 + pgvector (1536d) for embeddings, S3-compatible storage via presigned URLs
- **AI Services**: LangChain with GPT-4 (general, refactor planning) + Claude 3 (long-context reasoning, standards alignment), OpenAI embeddings for semantic search
- **Integrations**: GitHub/GitLab webhooks (HMAC verified), Bitbucket optional
- **Deployment**: Docker images, health checks, Vercel (FE), Render (BE), auto migrations, JSON logging

### **Target Users**
- Development teams using GitHub/GitLab for PR-based workflows
- Code reviewers seeking automated assistance with confidence-scored suggestions
- DevOps teams requiring CI/CD integration with status checks and A/B testing
- Enterprise organizations with security compliance needs (OWASP/ASVS, SAST patterns)
- Open source maintainers with high PR volume and quality standards

### **Core Goals**
1. Provide confidence-scored auto-fixes with test patches and architectural integrity analysis
2. Integrate with GitHub/GitLab for PR-based analysis with webhook processing
3. Enable one-click apply via bot or IDE with atomic commits and tests
4. Deliver advanced AI analysis (security, performance, code smells, dead code, complexity)
5. Support CI/CD integration with status checks, required gates, and A/B compare vs baseline

### **Core Capabilities**

#### **Intelligent Code Analysis**
- **Multi-language Support**: Python, JS/TS, Go, Java, C#, Rust, PHP, Ruby, Swift, Kotlin, Scala
- **Advanced Detection**: Code smells, bugs, dead code, complexity, duplication, API misuse
- **Architectural Analysis**: Layering, boundaries, cyclic dependencies, cohesion/coupling maps

#### **Security & Secrets**
- **OWASP/ASVS Compliance**: SAST patterns, SSRF/SQLi/XSS detection
- **Secret Detection**: API keys, passwords, tokens, credentials
- **Dependency Analysis**: Security advisories, vulnerability scanning
- **Compliance Reporting**: GDPR, SOC2, security audit trails

#### **Performance Optimization**
- **Algorithm Analysis**: N+1 queries, hot loops, memory allocations
- **I/O Optimization**: Blocking operations, async/await conversions
- **Structural Improvements**: Module split/merge, code organization
- **Performance Metrics**: Response time analysis, resource usage

#### **Auto-Refactors**
- **Confidence Scoring**: AI-powered confidence assessment for each suggestion
- **Test-First Patches**: Generate test cases before applying fixes
- **Atomic Commits**: Structured, reviewable changes with clear descriptions
- **Refactoring Types**: Extract method, inline variable, simplify conditionals, async conversions

#### **Repository Integration**
- **GitHub App**: Seamless integration with GitHub repositories and PRs
- **GitLab Support**: Full GitLab integration with merge requests
- **Webhook Processing**: Real-time analysis triggers on code changes
- **Branch Analysis**: Support for feature branches, PR comparisons

#### **Enterprise Features**
- **CI/CD Integration**: Status checks, required gates, A/B testing
- **Bot Integration**: Automated PR creation, comments, and labeling
- **Analytics Dashboard**: Code health scores, MTTR, PR cycle time metrics
- **Team Management**: Organization settings, role-based access control

#### **Developer Experience**
- **IDE Extensions**: VS Code/JetBrains plugins for inline previews
- **CLI Tools**: `riq scan`, `riq diff`, `riq apply --proposal <id>`
- **Configuration**: `.refactoriq.yml` for org rules, severity mapping
- **Real-time Updates**: WebSocket streaming for analysis progress

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
1. **Analysis Types**: full, security, performance, style, documentation, architectural
2. **Finding Severity**: critical, high, medium, low, info
3. **Supported Languages**: Python, JavaScript, TypeScript, Java, C#, Go, Rust, PHP, Ruby, Swift, Kotlin, Scala
4. **User Roles**: Regular users, Premium users, Administrators, Organization owners
5. **Confidence Levels**: high (90%+), medium (70-89%), low (50-69%), experimental (<50%)
6. **Repository Providers**: GitHub, GitLab, Bitbucket
7. **Proposal Categories**: security, performance, refactoring, style, documentation, architectural

### **Data Model (High Level)**
- **users** (id UUID, email unique, org_id, role, soft_delete)
- **repos** (id, provider, external_id, default_branch, settings_json)
- **analyses** (id, repo_id, pr_number/null, status, language_set, started_at/finished_at)
- **files** (id, repo_id, path, hash, content_ref)
- **chunks** (id, file_id, span, embedding vector(1536))
- **findings** (id, analysis_id, file_id, severity, rule_id, message, span, confidence)
- **proposals** (id, finding_id, patch_diff, test_patch_diff, confidence, category)
- **events** (id, analysis_id, type, payload_json, created_at)
- **tokens** (access/refresh tracking for rotation + revoke)
- **audit_logs** (who did what, when, where)

### **API Surface (REST)**
- `POST /v1/auth/login` → JWT (15m) & refresh (7d)
- `POST /v1/repos` → connect repo (GitHub app handshake)
- `POST /v1/analyses` → start analysis {repo_id, ref\|pr}
- `GET /v1/analyses/{id}` → status + aggregates (paginated findings)
- `GET /v1/findings?analysis_id=…&page=1&size=50` (max 100)
- `POST /v1/proposals/{id}/apply` → enqueue bot PR or patch
- `WS /v1/analyses/{id}/stream` → phases: queued→parsing→embedding→llm_eval→proposing→done

### **Business Logic**
- **Authentication**: JWT with refresh token rotation (15m access, 7d refresh)
- **Repository Integration**: GitHub App authentication, webhook signature verification
- **AI Analysis**: Async processing with confidence scoring and test patch generation
- **Proposal System**: Auto-fix generation with confidence-based gating
- **Bot Integration**: Automated PR creation with atomic commits and tests
- **CI/CD Integration**: Status checks, required gates, A/B testing
- **Analytics**: Code health scoring, MTTR tracking, PR cycle time metrics
- **Rate Limiting**: Global 100/min, login 5/min, analysis 10/hour
- **Security**: Secrets redaction, AES-256 encryption, GDPR compliance

### **Security Considerations**
- **Input Validation**: All user inputs must be validated with Pydantic v2
- **SQL Injection**: Use SQLAlchemy async with parameterized queries only
- **XSS Protection**: Sanitize all user-generated content
- **Webhook Security**: HMAC signature verification for GitHub/GitLab webhooks
- **Secrets Management**: Redaction at ingest, AES-256 at rest, TLS in transit
- **Repository Access**: Principle of least privilege with scoped repo tokens
- **GDPR Compliance**: Data retention policies, right-to-erasure, soft delete + purge
- **API Security**: Rate limiting, CORS allow-list, JWT with device/session revoke
- **File Upload**: Validate file types, scan for malware, S3-compatible storage

### **Performance Requirements**
- **API Response Time**: p95 < 200ms for simple operations
- **Database Queries**: Complex queries < 50ms with proper indexing
- **WebSocket Performance**: First finding < 5s on medium PRs (~1k LOC changed)
- **Worker Throughput**: 100 concurrent analyses / node (autoscale)
- **Uptime**: 99.9% with health/readiness probes and circuit breakers
- **Caching Strategy**: Sessions (7d TTL), hot analysis aggregates (1h TTL), embeddings index cached map
- **Rate Limiting**: Redis sliding window implementation
- **Frontend Load Time**: < 3 seconds for initial page load

### **Brand & UI Kit**
- **Product Name**: RefactorIQ™
- **Taglines**: "Make every PR your best PR", "From code smell to ship-ready in minutes"
- **Colors**: Primary blue (#3b82f6), Success green (#22c55e), Warning orange (#f59e0b), Error red (#ef4444)
- **Typography**: UI — Inter; Code — JetBrains Mono
- **Layouts**: Dashboard layout with header, sidebar, main content; Analysis layout with upload, progress, results
- **Badges**: Severity-based styling (critical, high, medium, low, info)
- **Accessibility**: WCAG 2.1 AA compliance, focus rings, keyboard navigation, screen reader support

### **Analytics & KPIs**
- **Code Health Score**: Complexity, duplication, churn metrics
- **MTTR**: Mean time to resolution for code issues
- **Auto-fix Metrics**: Percentage of auto-fixes merged, regression rate
- **PR Performance**: Cycle time reduction, reviewer load saved, hotspot mapping
- **Quality Metrics**: Finding acceptance rate by category, false-positive trend analysis

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
- [ ] Tests written for new functionality (unit + integration)
- [ ] Documentation updated
- [ ] Follows project coding conventions
- [ ] Confidence scoring system implemented
- [ ] Auto-fix generation with test patches
- [ ] Repository integration (GitHub App, webhooks)
- [ ] CI/CD integration with status checks

### **User Experience**
- [ ] Intuitive and responsive UI with RefactorIQ™ branding
- [ ] Clear error messages and confidence indicators
- [ ] Loading states and real-time progress updates
- [ ] Accessibility guidelines followed (WCAG 2.1 AA)
- [ ] Mobile-friendly design
- [ ] PR-based workflow integration
- [ ] One-click apply functionality
- [ ] Real-time WebSocket updates
- [ ] Diff viewer with inline suggestions

### **Performance**
- [ ] API responses under 200ms (p95)
- [ ] Database queries optimized (< 50ms for complex queries)
- [ ] Frontend bundle size reasonable
- [ ] Caching implemented where appropriate
- [ ] WebSocket first finding < 5s on medium PRs
- [ ] Worker throughput: 100 concurrent analyses / node
- [ ] 99.9% uptime with health checks
- [ ] Rate limiting with Redis sliding window

### **Security**
- [ ] Input validation implemented with Pydantic v2
- [ ] Authentication required where needed (JWT with refresh rotation)
- [ ] SQL injection prevented (SQLAlchemy async)
- [ ] XSS protection in place
- [ ] Webhook signature verification (HMAC)
- [ ] Secrets redaction and encryption (AES-256)
- [ ] GDPR compliance (data retention, right-to-erasure)
- [ ] Repository access with least privilege
- [ ] Rate limiting and CORS protection

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

## 🔧 Patch Protocol

### **Response Format**
When making code changes, always use this format:

```diff
// Example: Adding a new API endpoint
+ from fastapi import APIRouter, Depends, HTTPException
+ from app.schemas.analysis import AnalysisCreate, AnalysisResponse
+ from app.services.analysis import AnalysisService
+ 
+ router = APIRouter()
+ 
+ @router.post("/analyses", response_model=AnalysisResponse)
+ async def create_analysis(
+     analysis: AnalysisCreate,
+     service: AnalysisService = Depends()
+ ):
+     """Create a new code analysis."""
+     return await service.create_analysis(analysis)
```

### **Commit Message Format**
Use conventional commit messages:
```
feat: add user profile update endpoint
fix: resolve authentication token refresh issue
docs: update API documentation
test: add unit tests for analysis service
refactor: improve error handling in upload service
```

### **File Creation**
When creating new files, specify the complete path and content:

```typescript
// apps/frontend/components/ui/input.tsx
import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
```

## 🚨 Failure-Mode Playbook

### **Common Issues and Solutions**

#### **1. Database Connection Issues**
**Symptoms**: Connection timeout, connection pool exhausted
**Solutions**:
- Check database URL and credentials
- Verify database is running: `docker-compose ps`
- Check connection pool settings
- Restart database: `docker-compose restart postgres`

#### **2. AI Service Unavailable**
**Symptoms**: Analysis fails, API errors
**Solutions**:
- Check API keys are valid and have quota
- Implement fallback to alternative AI service
- Add retry logic with exponential backoff
- Cache previous analysis results

#### **3. Frontend Build Failures**
**Symptoms**: TypeScript errors, missing dependencies
**Solutions**:
- Run `pnpm install` to update dependencies
- Check TypeScript configuration
- Verify all imports are correct
- Clear build cache: `pnpm clean`

#### **4. WebSocket Connection Issues**
**Symptoms**: Real-time updates not working
**Solutions**:
- Check WebSocket URL configuration
- Verify CORS settings
- Check network connectivity
- Implement reconnection logic

#### **5. File Upload Failures**
**Symptoms**: Upload timeout, file size errors
**Solutions**:
- Check file size limits
- Verify storage service credentials
- Check network connectivity
- Implement chunked upload for large files

#### **6. Authentication Issues**
**Symptoms**: Login failures, token expiration
**Solutions**:
- Check JWT secret configuration
- Verify token expiration settings
- Check refresh token logic
- Clear browser cache and cookies

### **Debugging Steps**
1. Check application logs: `docker-compose logs -f [service]`
2. Verify environment variables are set correctly
3. Check database migrations: `alembic current`
4. Test API endpoints: `curl -X GET http://localhost:8000/api/v1/health`
5. Check frontend console for JavaScript errors

### **Emergency Procedures**
1. **Service Down**: Restart with `docker-compose restart`
2. **Database Issues**: Restore from backup or run migrations
3. **Security Breach**: Rotate all API keys and secrets
4. **Performance Issues**: Scale up resources or enable caching

---

*This document is maintained by the development team and should be updated as the project evolves. Always refer to this guide when working on the AI Code Review Assistant project.*
