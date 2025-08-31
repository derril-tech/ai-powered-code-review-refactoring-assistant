# RefactorIQ™ - AI-Powered Code Review & Refactoring Assistant

🎉 **PRODUCTION READY** - Enterprise-grade intelligent code analysis and automated refactoring platform powered by advanced AI models.

RefactorIQ™ revolutionizes the software development lifecycle by providing instant, actionable feedback on code quality, security vulnerabilities, and performance optimizations through cutting-edge AI analysis.

## ✨ Key Features

### 🤖 **AI-Powered Analysis**
- **Multi-Model Intelligence**: OpenAI GPT-4 + Anthropic Claude integration
- **Smart Code Review**: Detects bugs, security vulnerabilities, and performance issues
- **Auto-Fix Proposals**: AI-generated code improvements with confidence scoring
- **Context-Aware Analysis**: Understanding of codebase structure and patterns

### 🛡️ **Security & Compliance**
- **Vulnerability Detection**: SQL injection, XSS, CSRF, and authentication flaws
- **Security Hardening**: Rate limiting, security headers, audit logging
- **Compliance Checks**: Industry standard security practices validation
- **Risk Assessment**: Confidence scoring and impact analysis

### ⚡ **Performance & Scalability**
- **Real-time Analysis**: WebSocket-based live progress updates
- **Horizontal Scaling**: Load-balanced architecture with Docker containers
- **Optimized Database**: PostgreSQL with pgvector for semantic search
- **Background Processing**: Asynchronous job queue with Redis + ARQ

### 🔧 **Developer Experience**
- **Multi-Language Support**: Python, JavaScript/TypeScript, Java, Go, Rust, C++, C#, PHP, Ruby, Swift, Kotlin, Scala
- **Git Integration**: GitHub and GitLab webhook support
- **API-First Design**: RESTful APIs with comprehensive OpenAPI documentation
- **Modern UI**: React/Next.js frontend with real-time updates

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Load Balancer │────│      Nginx       │────│   Frontend      │
│   (External)    │    │  (Reverse Proxy) │    │   (Next.js)     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                       ┌──────────────────┐    ┌─────────────────┐
                       │     Backend      │────│   PostgreSQL    │
                       │    (FastAPI)     │    │   (Database)    │
                       └──────────────────┘    └─────────────────┘
                                │
                       ┌──────────────────┐    ┌─────────────────┐
                       │      Redis       │    │   Monitoring    │
                       │  (Cache + Jobs)  │    │ (Prometheus)    │
                       └──────────────────┘    └─────────────────┘
```

### 🔧 **Technology Stack**

#### **Backend (FastAPI + Python 3.11)**
- **API Framework**: FastAPI with async/await support
- **Database**: PostgreSQL 15+ with pgvector for embeddings
- **Caching**: Redis for sessions, rate limiting, and job queues
- **Authentication**: JWT tokens with secure refresh mechanism
- **Background Jobs**: ARQ (Async Redis Queue) for analysis processing
- **AI Integration**: OpenAI GPT-4 + Anthropic Claude + LangChain
- **File Storage**: AWS S3 compatible storage
- **Monitoring**: Prometheus metrics + structured logging
- **Security**: Rate limiting, security headers, audit logging

#### **Frontend (Next.js 14 + React 18 + TypeScript)**
- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: React Context + custom hooks
- **Real-time**: WebSocket client for live updates
- **Type Safety**: Full TypeScript implementation

#### **Infrastructure & DevOps**
- **Containerization**: Docker + Docker Compose
- **Reverse Proxy**: Nginx with SSL termination and load balancing
- **CI/CD**: GitHub Actions with automated testing and deployment
- **Monitoring**: Prometheus + Grafana + Loki logging stack
- **Backup**: Automated PostgreSQL backups with S3 integration

## 📋 System Requirements

### **Production Environment**
- **CPU**: 4 cores minimum (8 recommended)
- **RAM**: 8GB minimum (16GB recommended)  
- **Storage**: 100GB SSD minimum (500GB recommended)
- **Network**: 1Gbps connection
- **OS**: Ubuntu 20.04+ or CentOS 8+

### **Software Dependencies**
- **Docker**: 24.0+ with Docker Compose 2.0+
- **Git**: 2.30+ for repository operations
- **SSL Certificate**: Let's Encrypt or custom SSL/TLS certificates

## 🛠️ Installation

### Option 1: Docker Compose (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-powered-code-review-assistant
   ```

2. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

3. **Start the services**
   ```bash
   docker-compose up -d
   ```

4. **Run database migrations**
   ```bash
   docker-compose exec app alembic upgrade head
   ```

5. **Access the application**
   - API: http://localhost:8000
   - API Docs: http://localhost:8000/docs
   - Health Check: http://localhost:8000/api/v1/health

### Option 2: Local Development

1. **Set up Python environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

2. **Set up PostgreSQL with pgvector**
   ```bash
   # Install PostgreSQL and pgvector extension
   # Create database: code_review_db
   ```

3. **Set up Redis**
   ```bash
   # Install and start Redis server
   ```

4. **Configure environment**
   ```bash
   cp env.example .env
   # Edit .env with your database and API keys
   ```

5. **Run migrations**
   ```bash
   alembic upgrade head
   ```

6. **Start the application**
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

7. **Start the worker (in another terminal)**
   ```bash
   arq app.workers.arq_worker.WorkerSettings
   ```

## 🔧 Configuration

### Environment Variables

Key configuration options in `.env`:

```bash
# Database
DATABASE_URL=postgresql+asyncpg://user:password@localhost/code_review_db

# Redis
REDIS_URL=redis://localhost:6379

# AI Services
OPENAI_API_KEY=your-openai-api-key
ANTHROPIC_API_KEY=your-anthropic-api-key

# Security
SECRET_KEY=your-secret-key-here

# File Storage
S3_ACCESS_KEY_ID=your-s3-access-key
S3_SECRET_ACCESS_KEY=your-s3-secret-key
S3_BUCKET_NAME=code-review-assistant

# Email
SMTP_HOST=smtp.gmail.com
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/forgot-password` - Password reset request

### Analysis Endpoints
- `POST /api/v1/analyses` - Create new analysis
- `GET /api/v1/analyses` - List analyses
- `GET /api/v1/analyses/{id}` - Get analysis details
- `GET /api/v1/analyses/{id}/findings` - Get analysis findings

### WebSocket Endpoints
- `WS /ws/analyses/{id}` - Real-time analysis progress

## 🧪 Testing

```bash
# Run tests
pytest

# Run with coverage
pytest --cov=app

# Run specific test file
pytest tests/test_auth.py
```

## 📦 Deployment

### Render Deployment

1. **Connect your repository to Render**
2. **Create a new Web Service**
3. **Configure environment variables**
4. **Set build command**: `pip install -r requirements.txt && alembic upgrade head`
5. **Set start command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### Vercel Deployment (Frontend)

1. **Connect your frontend repository to Vercel**
2. **Configure environment variables**
3. **Deploy automatically on push**

## 🔒 Security

- JWT-based authentication with refresh tokens
- Rate limiting on sensitive endpoints
- Input validation and sanitization
- CORS configuration
- Secure password hashing with bcrypt
- Environment variable protection

## 📈 Monitoring

- Structured logging with Loguru
- Health check endpoints
- Request ID tracking
- Error monitoring with Sentry (optional)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the API documentation at `/docs`
- Review the health check at `/api/v1/health`

## 🔮 Roadmap

- [ ] IDE plugin integration
- [ ] Custom rule engine
- [ ] Team collaboration features
- [ ] Advanced analytics dashboard
- [ ] Machine learning model training
- [ ] Multi-repository analysis
- [ ] CI/CD pipeline integration
