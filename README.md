# AI-Powered Code Review & Refactoring Assistant

An intelligent, automated tool designed to revolutionize the software development lifecycle by leveraging advanced AI and machine learning to provide instant, actionable feedback on code quality, security, and performance.

## 🚀 Features

- **Intelligent Code Analysis**: AI-powered detection of code smells, anti-patterns, and potential bugs
- **Automated Refactoring**: Context-aware refactoring suggestions with automatic application
- **Security Vulnerability Detection**: Proactive scanning for security weaknesses
- **Performance Optimization**: Identification and resolution of performance bottlenecks
- **Multi-Language Support**: Python, JavaScript, TypeScript, Java, C#, Go, Rust, PHP, Ruby, Swift, Kotlin, Scala
- **Real-time Progress**: WebSocket-based live updates during analysis
- **Git Integration**: Seamless integration with GitHub and GitLab
- **Vector Search**: Semantic similarity search for finding related code issues

## 🏗️ Architecture

### Backend Stack
- **Framework**: FastAPI + Python 3.10+
- **Database**: PostgreSQL + pgvector (for embeddings)
- **Cache & Queue**: Redis + Arq (async job processing)
- **AI Services**: OpenAI GPT-4 + Anthropic Claude + LangChain
- **Authentication**: JWT with refresh tokens
- **File Storage**: S3-compatible storage
- **Real-time**: WebSocket connections

### Frontend Stack
- **Framework**: Next.js 14 + React 18 + TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context + Custom Hooks
- **Real-time**: WebSocket client

## 📋 Prerequisites

- Python 3.10+
- PostgreSQL 15+ with pgvector extension
- Redis 7+
- Node.js 18+ (for frontend)
- Docker & Docker Compose (optional)

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
