# PROMPT DECLARATION - AI Code Review Assistant

## 🎯 Project Overview

You are working on the **AI-Powered Code Review and Refactoring Assistant**, a comprehensive tool that provides intelligent code analysis, automated refactoring suggestions, security vulnerability detection, and performance optimization recommendations.

**Tech Stack:**
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Radix UI
- **Backend**: FastAPI, Python 3.11+, SQLAlchemy 2.0, PostgreSQL
- **AI Services**: OpenAI GPT-4, Anthropic Claude
- **Real-time**: WebSocket, Redis
- **Deployment**: Docker, Docker Compose

## 🏗️ Architecture Boundaries

### **Frontend Responsibilities**
- User interface components and pages
- State management with React Context
- API integration and error handling
- Real-time WebSocket communication
- Form validation and user input handling
- Responsive design and accessibility

### **Backend Responsibilities**
- REST API endpoints and business logic
- Database operations and data validation
- AI service integration and analysis
- Authentication and authorization
- File processing and storage
- Webhook handling and Git integration

### **Shared Responsibilities**
- Type definitions and interfaces
- Data validation schemas
- Error handling patterns
- Security best practices

## 📋 Implementation Guidelines

### **Code Quality Standards**
- **Python**: Type hints required, async/await patterns, comprehensive error handling
- **TypeScript**: Strict mode, proper interfaces, React hooks, error boundaries
- **Documentation**: Docstrings for all functions, inline comments for complex logic
- **Testing**: Unit tests for business logic, integration tests for APIs

### **Security Requirements**
- **Authentication**: JWT with refresh token rotation
- **Authorization**: Role-based access control
- **Input Validation**: Pydantic schemas, client-side validation
- **File Upload**: Type validation, size limits, virus scanning
- **API Security**: Rate limiting, CORS, input sanitization

### **Performance Targets**
- **API Response Time**: < 200ms for simple operations
- **Analysis Processing**: < 5 minutes for typical repositories
- **Frontend Load Time**: < 3 seconds for initial page load
- **Database Queries**: Optimized with proper indexing

### **User Experience Requirements**
- **Responsive Design**: Mobile-first, tablet and desktop optimization
- **Accessibility**: WCAG 2.1 AA compliance
- **Loading States**: Clear feedback for all async operations
- **Error Handling**: User-friendly error messages and recovery options
- **Real-time Updates**: WebSocket integration for live progress

## 🔧 Development Workflow

### **File Organization**
- **Frontend**: Follow Next.js 14 App Router conventions
- **Backend**: Modular API structure with clear separation of concerns
- **Documentation**: Keep docs/ folder updated with implementation changes
- **Configuration**: Environment-specific settings in .env files

### **Git Workflow**
1. Create feature branch from `main`
2. Implement changes with descriptive commits
3. Run tests and linting locally
4. Create pull request with detailed description
5. Code review and merge to main

### **Testing Strategy**
- **Unit Tests**: Individual functions and components
- **Integration Tests**: API endpoints and database operations
- **End-to-End Tests**: Complete user workflows
- **Performance Tests**: Load testing and optimization validation

## 🎨 Design System

### **Color Palette**
- **Primary**: Blue (#3B82F6) for main actions and branding
- **Secondary**: Gray (#6B7280) for supporting elements
- **Success**: Green (#10B981) for positive feedback
- **Warning**: Yellow (#F59E0B) for caution states
- **Error**: Red (#EF4444) for errors and destructive actions

### **Typography**
- **Headings**: Inter font family, bold weights
- **Body Text**: Inter font family, regular weight
- **Code**: JetBrains Mono for code snippets and technical content

### **Component Patterns**
- **Cards**: Consistent padding, rounded corners, subtle shadows
- **Buttons**: Clear hierarchy with primary, secondary, and ghost variants
- **Forms**: Proper labels, validation states, error messages
- **Navigation**: Breadcrumbs, clear active states, responsive menu

## 🔗 Integration Requirements

### **AI Service Integration**
- **OpenAI GPT-4**: Primary model for code analysis
- **Anthropic Claude**: Secondary model for complex reasoning
- **Fallback Strategy**: Graceful degradation if AI services unavailable
- **Rate Limiting**: Respect API quotas and implement backoff strategies

### **Git Platform Integration**
- **GitHub**: Webhook support, repository access, pull request integration
- **GitLab**: Webhook support, repository access, merge request integration
- **Bitbucket**: Future support planned
- **Authentication**: OAuth flow for repository access

### **Storage Integration**
- **S3-Compatible**: File upload and storage
- **Database**: PostgreSQL with pgvector for embeddings
- **Cache**: Redis for session storage and caching
- **Backup**: Automated database and file backups

## 🚀 Deployment Strategy

### **Environment Configuration**
- **Development**: Local Docker setup with hot reload
- **Staging**: Production-like environment for testing
- **Production**: Scalable deployment with monitoring

### **CI/CD Pipeline**
- **Code Quality**: Linting, formatting, type checking
- **Testing**: Automated test suite execution
- **Security**: Dependency scanning, code analysis
- **Deployment**: Automated deployment to staging and production

### **Monitoring and Observability**
- **Application Metrics**: Response times, error rates, throughput
- **Infrastructure Metrics**: CPU, memory, disk usage
- **Business Metrics**: User activity, analysis completion rates
- **Alerting**: Proactive notification of issues

## 📊 Success Criteria

### **Functional Requirements**
- ✅ User registration and authentication
- ✅ Code analysis with AI-powered insights
- ✅ File upload and processing
- ✅ Real-time progress updates
- ✅ Git platform integration
- ✅ Email notifications
- ✅ User profile management

### **Non-Functional Requirements**
- ✅ Response time under 200ms for API calls
- ✅ 99.9% uptime for production environment
- ✅ Support for 1000+ concurrent users
- ✅ Secure handling of sensitive data
- ✅ Comprehensive error handling and recovery

### **User Experience Goals**
- ✅ Intuitive and responsive interface
- ✅ Clear feedback for all user actions
- ✅ Accessible design for all users
- ✅ Fast and reliable performance
- ✅ Helpful error messages and guidance

## 🔒 Security and Compliance

### **Data Protection**
- **Encryption**: All sensitive data encrypted at rest and in transit
- **Access Control**: Role-based permissions and audit logging
- **Data Retention**: Configurable retention policies
- **Privacy**: GDPR compliance for user data handling

### **API Security**
- **Authentication**: JWT tokens with secure storage
- **Authorization**: Fine-grained permission system
- **Rate Limiting**: Per-user and per-endpoint limits
- **Input Validation**: Comprehensive validation and sanitization

### **Infrastructure Security**
- **Network Security**: VPC, firewall rules, DDoS protection
- **Container Security**: Image scanning, runtime protection
- **Secrets Management**: Secure storage of API keys and credentials
- **Monitoring**: Security event logging and alerting

## 📚 Context and Domain Knowledge

### **Code Analysis Domain**
- **Supported Languages**: Python, JavaScript, TypeScript, Java, C#, Go, Rust, PHP, Ruby, Swift, Kotlin, Scala
- **Analysis Types**: Security, performance, code style, documentation, refactoring
- **Finding Severity**: Critical, high, medium, low
- **Auto-fix Capability**: Automatic code improvements where possible

### **User Personas**
- **Developers**: Primary users seeking code quality improvements
- **Code Reviewers**: Users managing review processes
- **DevOps Engineers**: Users integrating with CI/CD pipelines
- **Security Engineers**: Users focused on vulnerability detection

### **Business Rules**
- **Analysis Limits**: Tiered limits based on user plan
- **File Size Limits**: 10MB for repository analysis, 5MB for direct upload
- **Rate Limits**: 100 requests/minute global, 10 analyses/hour per user
- **Retention**: Analysis results kept for 30 days by default

## 🆘 When You Need Help

### **Ask for Clarification When**
- Requirements are ambiguous or conflicting
- Multiple approaches are equally valid
- Performance vs. simplicity trade-offs
- Security implications are unclear
- Integration requirements are complex

### **Provide Context When**
- Suggesting architectural changes
- Implementing complex business logic
- Adding new dependencies
- Modifying existing patterns
- Proposing new features

### **Examples of Good Questions**
- "Should this be a separate service or part of the existing one?"
- "What's the expected user flow for this feature?"
- "Are there any performance constraints I should consider?"
- "How should we handle the error case where the AI service is unavailable?"
- "What's the preferred approach for handling large file uploads?"

---

**Remember**: This is a production application that will be used by real developers. Every decision should prioritize security, performance, and user experience. When in doubt, ask for clarification rather than making assumptions.
