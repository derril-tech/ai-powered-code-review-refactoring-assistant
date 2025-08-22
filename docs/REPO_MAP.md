# AI Code Review Assistant - Complete Repository Map

## 📋 Project Overview

This repository contains a complete AI-powered code review and refactoring assistant with a modern Next.js 14 frontend and FastAPI backend. The application provides intelligent code analysis, automated refactoring suggestions, security vulnerability detection, and performance optimization recommendations.

## 🏗️ Architecture Overview

```
ai-powered-code-review-assistant/
├── frontend/                 # Next.js 14 Frontend Application
├── app/                      # FastAPI Backend Application
├── docs/                     # Project Documentation
├── docker-compose.yml        # Development environment setup
├── README.md                 # Main project documentation
└── requirements.txt          # Python dependencies
```

---

## 🎨 Frontend Structure (`frontend/`)

### 📁 Core Application Files

```
frontend/
├── app/                      # Next.js 14 App Router
│   ├── globals.css          # Global styles and theme definitions
│   ├── layout.tsx           # Root layout with providers and metadata
│   └── page.tsx             # Landing page with hero section and features
├── components/              # Reusable React components
│   ├── ui/                  # Base UI components (Radix UI primitives)
│   │   ├── button.tsx       # Button component with variants and loading states
│   │   ├── card.tsx         # Card components for structured layouts
│   │   ├── badge.tsx        # Badge component for status indicators
│   │   ├── toast.tsx        # Toast notification system
│   │   ├── toaster.tsx      # Toast container component
│   │   └── index.ts         # Centralized UI component exports
│   └── providers.tsx        # Context providers wrapper
├── contexts/                # React Context providers
│   ├── auth-context.tsx     # Authentication state management
│   ├── websocket-context.tsx # WebSocket real-time communication
│   └── analysis-context.tsx # Analysis data and operations
├── hooks/                   # Custom React hooks
│   └── use-toast.ts         # Toast notification hook with state management
├── lib/                     # Utility libraries and configurations
│   ├── api.ts              # Axios-based API client with JWT refresh
│   ├── types.ts            # TypeScript interfaces and enums
│   ├── utils.ts            # Utility functions (dates, files, validation)
│   └── constants.ts        # Application constants and configuration
├── public/                  # Static assets
├── styles/                  # Additional stylesheets
└── types/                   # Additional TypeScript type definitions
```

### 📁 Configuration Files

```
frontend/
├── package.json             # Dependencies and scripts
├── next.config.js          # Next.js configuration
├── tailwind.config.ts      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
├── .eslintrc.json          # ESLint rules and configuration
├── .prettierrc             # Prettier code formatting
├── postcss.config.js       # PostCSS configuration
├── jest.config.js          # Jest testing configuration
├── jest.setup.js           # Jest setup with mocks
├── next-env.d.ts           # Next.js TypeScript definitions
├── .gitignore              # Git ignore rules
├── env.example             # Environment variables template
└── README.md               # Frontend-specific documentation
```

### 🔧 Key Frontend Features

#### **Authentication System**
- JWT-based authentication with automatic token refresh
- Protected routes and user session management
- Login/register forms with validation
- Password reset functionality

#### **Real-time Features**
- WebSocket integration for live analysis progress
- Real-time finding notifications
- Connection error handling and reconnection
- Live status updates

#### **Code Analysis Interface**
- File upload with drag-and-drop support
- Multi-language code detection
- Analysis type selection (full, security, performance, code style)
- Progress indicators and status tracking

#### **Results Visualization**
- Finding severity indicators (critical, high, medium, low)
- Code snippet highlighting
- Auto-fix suggestion display
- Diff viewer for code changes

---

## 🔧 Backend Structure (`app/`)

### 📁 Core Application Files

```
app/
├── main.py                 # FastAPI application entry point
├── core/                   # Core configuration and utilities
│   ├── config.py          # Application configuration and settings
│   ├── security.py        # JWT authentication and password hashing
│   └── logging.py         # Logging configuration
├── api/                    # API routes and endpoints
│   ├── deps.py            # Dependency injection utilities
│   └── v1/                # API version 1 routes
│       ├── __init__.py    # API v1 initialization
│       ├── auth.py        # Authentication endpoints
│       ├── health.py      # Health check endpoints
│       ├── users.py       # User management endpoints
│       ├── analyses.py    # Code analysis endpoints
│       ├── uploads.py     # File upload endpoints
│       ├── webhooks.py    # Webhook endpoints
│       └── ws.py          # WebSocket endpoints
├── models/                 # SQLAlchemy database models
│   ├── __init__.py        # Model initialization
│   ├── user.py            # User model
│   └── analysis.py        # Analysis model
├── schemas/                # Pydantic schemas for API
│   ├── __init__.py        # Schema initialization
│   ├── user.py            # User schemas
│   ├── analysis.py        # Analysis schemas
│   └── common.py          # Common schemas
├── services/               # Business logic services
│   ├── __init__.py        # Service initialization
│   ├── ai_service.py      # AI analysis service
│   └── email_service.py   # Email notification service
└── db/                     # Database configuration
    ├── base.py            # Database base configuration
    ├── session.py         # Database session management
    └── migrations/        # Database migrations
        └── env.py         # Alembic environment
```

### 🔧 Key Backend Features

#### **Authentication & Authorization**
- JWT-based authentication with refresh tokens
- Role-based access control
- Password hashing with bcrypt
- Session management

#### **Code Analysis Engine**
- Multi-language code parsing
- AI-powered analysis using OpenAI/Claude APIs
- Security vulnerability detection
- Performance optimization suggestions
- Code style and best practices checking

#### **File Management**
- Secure file upload handling
- Multi-format support (Python, JavaScript, TypeScript, Java, etc.)
- File validation and sanitization
- Temporary file storage

#### **Real-time Communication**
- WebSocket support for live updates
- Progress tracking for long-running analyses
- Real-time notifications

---

## 📚 Documentation Structure (`docs/`)

```
docs/
├── REPO_MAP.md             # This file - complete repository structure
├── API_SPEC.md             # API specification and endpoints
├── UI_UX_SPECIFICATIONS.md # UI/UX design specifications
├── CLAUDE.md               # AI collaboration guidelines
└── PROMPT_DECLARATION.md   # Project prompt for AI assistance
```

---

## 🚀 Development Setup

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 14+
- Docker (optional)

### Quick Start
1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-powered-code-review-assistant
   ```

2. **Backend Setup**
   ```bash
   cd app
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   cp env.example .env
   # Edit .env with your configuration
   uvicorn main:app --reload
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   cp env.example .env.local
   # Edit .env.local with your configuration
   npm run dev
   ```

4. **Database Setup**
   ```bash
   # Using Docker
   docker-compose up -d postgres
   
   # Or install PostgreSQL locally and run:
   psql -U postgres -f init.sql
   ```

### Environment Variables

#### Backend (.env)
```env
DATABASE_URL=postgresql://user:password@localhost:5432/code_review_db
SECRET_KEY=your-secret-key-here
OPENAI_API_KEY=your-openai-api-key
CLAUDE_API_KEY=your-claude-api-key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
```

---

## 🧪 Testing

### Backend Testing
```bash
cd app
pytest
```

### Frontend Testing
```bash
cd frontend
npm test
```

### End-to-End Testing
```bash
npm run test:e2e
```

---

## 📦 Deployment

### Docker Deployment
```bash
docker-compose up -d
```

### Manual Deployment
1. Build frontend: `cd frontend && npm run build`
2. Start backend: `cd app && uvicorn main:app --host 0.0.0.0 --port 8000`
3. Serve frontend: `cd frontend && npm start`

---

## 🔧 Development Guidelines

### Code Style
- **Backend**: Follow PEP 8 with Black formatting
- **Frontend**: Use Prettier and ESLint
- **TypeScript**: Strict mode enabled
- **Python**: Type hints required

### Git Workflow
1. Create feature branch from `main`
2. Make changes with descriptive commits
3. Run tests locally
4. Create pull request
5. Code review and merge

### API Development
- Use FastAPI for backend APIs
- Follow RESTful conventions
- Include comprehensive error handling
- Document all endpoints with OpenAPI

### Frontend Development
- Use Next.js 14 App Router
- Implement responsive design
- Follow accessibility guidelines
- Use TypeScript for type safety

---

## 🚨 Security Considerations

### Authentication
- JWT tokens with short expiration
- Refresh token rotation
- Secure password hashing
- Rate limiting on auth endpoints

### File Uploads
- File type validation
- Size limits enforcement
- Virus scanning (optional)
- Secure temporary storage

### API Security
- CORS configuration
- Input validation and sanitization
- SQL injection prevention
- XSS protection

---

## 📊 Monitoring & Logging

### Backend Logging
- Structured logging with Loguru
- Request/response logging
- Error tracking and alerting
- Performance metrics

### Frontend Monitoring
- Error boundary implementation
- Performance monitoring
- User analytics (optional)
- Real-time error reporting

---

## 🔄 CI/CD Pipeline

### GitHub Actions
1. **Code Quality**: Linting, formatting, type checking
2. **Testing**: Unit tests, integration tests
3. **Security**: Dependency scanning, code analysis
4. **Deployment**: Staging and production deployment

### Deployment Stages
1. **Development**: Local development environment
2. **Staging**: Pre-production testing
3. **Production**: Live application deployment

---

## 📈 Performance Optimization

### Backend Optimization
- Database query optimization
- Caching strategies
- Async processing for long-running tasks
- Connection pooling

### Frontend Optimization
- Code splitting and lazy loading
- Image optimization
- Bundle size optimization
- CDN integration

---

## 🆘 Troubleshooting

### Common Issues
1. **Database Connection**: Check DATABASE_URL and PostgreSQL service
2. **API Errors**: Verify environment variables and service status
3. **Frontend Build**: Clear cache and reinstall dependencies
4. **WebSocket Issues**: Check CORS and proxy configuration

### Debug Mode
```bash
# Backend
uvicorn main:app --reload --log-level debug

# Frontend
npm run dev -- --debug
```

---

## 📞 Support

For issues and questions:
1. Check the documentation in `docs/`
2. Review existing issues
3. Create a new issue with detailed information
4. Contact the development team

---

*This repository map is maintained by the development team and should be updated as the project evolves.*
