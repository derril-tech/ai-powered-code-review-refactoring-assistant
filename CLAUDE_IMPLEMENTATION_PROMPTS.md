# Claude Implementation Prompts for RefactorIQ™

## 🎯 **5 Prompts to Complete Infrastructure & Make Deployment-Ready**

### **PROMPT 1: GitHub App Integration & Repository System**
```
You are implementing the core repository integration system for RefactorIQ™. The infrastructure is 80% complete with models, API structure, and basic functionality in place.

**TASK**: Implement complete GitHub App integration and repository management system.

**REQUIREMENTS**:
- Create GitHub App registration configuration and OAuth flow
- Implement `/api/v1/repos` endpoints for repository connection and management
- Build webhook processing with HMAC signature verification
- Add repository authentication and token management with encryption
- Create repository file tracking and content management
- Implement branch analysis and PR comparison capabilities

**FILES TO CREATE/MODIFY**:
- `apps/backend/services/github_service.py` - GitHub API integration
- `apps/backend/services/webhook_service.py` - Webhook processing
- `apps/backend/api/v1/repos.py` - Repository API endpoints
- `apps/backend/schemas/repository.py` - Repository schemas
- `apps/backend/core/security.py` - Token encryption/decryption
- `apps/frontend/app/repos/page.tsx` - Repository management UI
- `apps/frontend/app/repos/[id]/page.tsx` - Repository detail view

**SPECIFICATIONS**:
- Support GitHub App installation flow
- Handle repository permissions and access tokens
- Process push, pull_request, and issue_comment webhooks
- Implement secure token storage with AES-256 encryption
- Add repository status tracking and error handling
- Create repository connection wizard in frontend

**SUCCESS CRITERIA**:
- Users can connect GitHub repositories via OAuth
- Webhooks are properly verified and processed
- Repository data is securely stored and managed
- Frontend provides intuitive repository management interface
- All API endpoints follow REST conventions with proper error handling
```

### **PROMPT 2: Advanced AI Analysis & Confidence Scoring System**
```
You are implementing the core AI analysis engine with confidence scoring for RefactorIQ™. The basic AI service exists but needs enhancement.

**TASK**: Build advanced AI analysis capabilities with confidence scoring and auto-fix generation.

**REQUIREMENTS**:
- Implement confidence scoring system (high, medium, low, experimental)
- Add comprehensive code analysis (security, performance, architectural)
- Create auto-fix generation with test patch creation
- Build proposal system with confidence-based gating
- Implement multi-language support (Python, JS/TS, Go, Java, C#, Rust, PHP, Ruby, Swift, Kotlin, Scala)
- Add architectural integrity analysis and dependency mapping

**FILES TO CREATE/MODIFY**:
- `apps/backend/services/ai_analysis_service.py` - Enhanced AI analysis
- `apps/backend/services/confidence_scorer.py` - Confidence scoring system
- `apps/backend/services/auto_fix_generator.py` - Auto-fix generation
- `apps/backend/models/proposal.py` - Proposal and auto-fix models
- `apps/backend/schemas/proposal.py` - Proposal schemas
- `apps/backend/api/v1/proposals.py` - Proposal API endpoints
- `apps/frontend/components/AnalysisResults.tsx` - Analysis display
- `apps/frontend/components/ProposalCard.tsx` - Proposal interface

**SPECIFICATIONS**:
- Confidence levels: high (90%+), medium (70-89%), low (50-69%), experimental (<50%)
- Analysis types: security (OWASP/ASVS), performance (N+1, hot loops), architectural (dependencies, layering)
- Auto-fix categories: security, performance, refactoring, style, documentation, architectural
- Test patch generation for each auto-fix
- Multi-language parsing and analysis
- Architectural dependency mapping and cycle detection

**SUCCESS CRITERIA**:
- AI analysis provides confidence-scored findings
- Auto-fixes are generated with test patches
- Proposals are properly categorized and confidence-gated
- Multi-language analysis works correctly
- Architectural analysis identifies dependency issues
- Frontend displays analysis results with confidence indicators
```

### **PROMPT 3: Real-Time Analysis & WebSocket Streaming**
```
You are implementing the real-time analysis system with WebSocket streaming for RefactorIQ™. Basic WebSocket infrastructure exists.

**TASK**: Build comprehensive real-time analysis streaming with progress tracking and live updates.

**REQUIREMENTS**:
- Implement real-time analysis progress streaming
- Add live findings and proposal updates
- Create analysis phase tracking (queued→parsing→embedding→llm_eval→proposing→done)
- Build WebSocket connection management and authentication
- Add real-time collaboration features
- Implement analysis status persistence and recovery

**FILES TO CREATE/MODIFY**:
- `apps/backend/services/analysis_streamer.py` - Real-time streaming service
- `apps/backend/services/analysis_orchestrator.py` - Analysis workflow management
- `apps/backend/api/v1/ws.py` - Enhanced WebSocket endpoints
- `apps/backend/models/analysis_event.py` - Analysis event tracking
- `apps/frontend/hooks/useAnalysisStream.ts` - WebSocket hook
- `apps/frontend/components/AnalysisProgress.tsx` - Progress display
- `apps/frontend/components/LiveFindings.tsx` - Live findings display
- `apps/frontend/contexts/AnalysisContext.tsx` - Analysis state management

**SPECIFICATIONS**:
- Analysis phases: queued, parsing, embedding, llm_eval, proposing, done
- Real-time progress updates with percentage and status
- Live findings display as they're discovered
- WebSocket authentication with JWT tokens
- Connection recovery and reconnection logic
- Analysis event logging and persistence

**SUCCESS CRITERIA**:
- Users see real-time analysis progress
- Findings appear live as they're discovered
- WebSocket connections are stable and authenticated
- Analysis phases are clearly tracked and displayed
- Connection recovery works seamlessly
- Frontend provides smooth real-time experience
```

### **PROMPT 4: PR Analysis Interface & One-Click Apply**
```
You are implementing the PR analysis interface and one-click apply functionality for RefactorIQ™. Basic frontend structure exists.

**TASK**: Build comprehensive PR analysis interface with one-click apply capabilities.

**REQUIREMENTS**:
- Create PR analysis interface with diff viewer
- Implement one-click apply for auto-fixes
- Add inline suggestion display and confidence indicators
- Build proposal review and approval workflow
- Create bot PR generation with atomic commits
- Add diff viewer with inline apply functionality

**FILES TO CREATE/MODIFY**:
- `apps/backend/services/bot_service.py` - Bot PR creation service
- `apps/backend/api/v1/bot.py` - Bot API endpoints
- `apps/frontend/app/analysis/[id]/page.tsx` - Analysis detail page
- `apps/frontend/components/DiffViewer.tsx` - Diff viewer component
- `apps/frontend/components/InlineSuggestions.tsx` - Inline suggestions
- `apps/frontend/components/ProposalReview.tsx` - Proposal review interface
- `apps/frontend/components/OneClickApply.tsx` - One-click apply component
- `apps/frontend/hooks/useProposal.ts` - Proposal management hook

**SPECIFICATIONS**:
- PR diff viewer with syntax highlighting
- Inline suggestions with confidence badges
- One-click apply with confirmation dialog
- Bot PR creation with atomic commits and tests
- Proposal review workflow with approval/rejection
- Real-time collaboration on analysis results

**SUCCESS CRITERIA**:
- Users can view PR diffs with inline suggestions
- One-click apply works seamlessly
- Bot creates proper PRs with atomic commits
- Proposal review workflow is intuitive
- Confidence indicators are clearly displayed
- Frontend provides excellent user experience
```

### **PROMPT 5: Deployment & Production Readiness**
```
You are making RefactorIQ™ production-ready for deployment. The application is functionally complete but needs production hardening.

**TASK**: Implement production deployment configuration and production readiness features.

**REQUIREMENTS**:
- Create production Docker configurations
- Implement health checks and monitoring
- Add comprehensive logging and error tracking
- Build CI/CD pipeline configuration
- Implement rate limiting and security hardening
- Add production environment configuration
- Create deployment documentation

**FILES TO CREATE/MODIFY**:
- `docker-compose.prod.yml` - Production Docker configuration
- `apps/backend/core/monitoring.py` - Health checks and monitoring
- `apps/backend/core/logging.py` - Production logging
- `apps/backend/middleware/rate_limit.py` - Rate limiting middleware
- `.github/workflows/deploy.yml` - CI/CD deployment pipeline
- `apps/backend/core/config.py` - Production configuration
- `deployment/` - Deployment scripts and documentation
- `monitoring/` - Monitoring and alerting configuration

**SPECIFICATIONS**:
- Production Docker images with multi-stage builds
- Health checks for all services
- Structured JSON logging with correlation IDs
- Rate limiting: global 100/min, login 5/min, analysis 10/hour
- Security headers and CORS configuration
- Environment-specific configuration management
- Automated deployment pipeline

**SUCCESS CRITERIA**:
- Application deploys successfully to production
- Health checks pass and monitoring works
- Logging provides comprehensive observability
- Rate limiting prevents abuse
- Security is properly configured
- CI/CD pipeline automates deployment
- Documentation enables easy deployment

---

## 🎯 **Implementation Order**
1. **Prompt 1** - GitHub App Integration (Foundation)
2. **Prompt 2** - AI Analysis & Confidence Scoring (Core Features)
3. **Prompt 3** - Real-Time Streaming (User Experience)
4. **Prompt 4** - PR Interface & One-Click Apply (Value Proposition)
5. **Prompt 5** - Production Deployment (Go-Live Ready)

## 📋 **Success Metrics**
- ✅ Repository integration working
- ✅ AI analysis with confidence scoring functional
- ✅ Real-time updates streaming properly
- ✅ One-click apply working end-to-end
- ✅ Application deployed and production-ready

**Each prompt builds upon the previous one to create a complete, deployment-ready RefactorIQ™ application.**
