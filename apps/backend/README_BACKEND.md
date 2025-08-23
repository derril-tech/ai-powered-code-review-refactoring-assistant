# Backend - AI Code Review Assistant

A FastAPI-based backend service providing AI-powered code analysis, review, and refactoring capabilities.

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- PostgreSQL 15+
- Redis 7+
- Git

### Installation

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp ../env.example .env
# Edit .env with your configuration

# Run database migrations
alembic upgrade head

# Start development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at [http://localhost:8000](http://localhost:8000).

## 🏗️ Project Structure

```
apps/backend/
├── app/
│   ├── api/              # API routes and endpoints
│   │   ├── v1/          # API version 1
│   │   ├── deps.py      # Dependency injection
│   │   └── ws.py        # WebSocket handlers
│   ├── core/            # Core configuration
│   │   ├── config.py    # Settings management
│   │   ├── logging.py   # Logging configuration
│   │   └── security.py  # Security utilities
│   ├── db/              # Database configuration
│   │   ├── base.py      # Base models
│   │   ├── session.py   # Database session
│   │   └── migrations/  # Alembic migrations
│   ├── models/          # SQLAlchemy models
│   ├── schemas/         # Pydantic schemas
│   ├── services/        # Business logic
│   └── main.py          # Application entry point
├── requirements.txt     # Python dependencies
├── alembic.ini         # Alembic configuration
└── Dockerfile          # Container configuration
```

## 🔧 Development

### Available Scripts

```bash
# Development
uvicorn app.main:app --reload    # Start development server
python -m pytest                 # Run tests
python -m pytest --cov=app       # Run tests with coverage

# Database
alembic revision --autogenerate  # Generate migration
alembic upgrade head             # Apply migrations
alembic downgrade -1             # Rollback migration

# Code Quality
black app/                       # Format code
isort app/                       # Sort imports
flake8 app/                      # Lint code
mypy app/                        # Type checking
```

### Environment Variables

Create a `.env` file with the following variables:

```env
# Database
DATABASE_URL=postgresql+asyncpg://user:password@localhost/code_review_db
REDIS_URL=redis://localhost:6379
ARQ_REDIS_URL=redis://localhost:6379/1

# Security
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# AI Service
OPENAI_API_KEY=your-openai-api-key
ANTHROPIC_API_KEY=your-anthropic-api-key

# External Services
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Logging
LOG_LEVEL=INFO
LOG_FORMAT=json
```

## 🗄️ Database

### Models

- **User** - User accounts and authentication
- **Analysis** - Code analysis records
- **Repository** - Connected repositories
- **Issue** - Detected code issues
- **Recommendation** - AI-generated recommendations

### Migrations

The project uses Alembic for database migrations:

```bash
# Create new migration
alembic revision --autogenerate -m "Add new table"

# Apply migrations
alembic upgrade head

# Rollback migration
alembic downgrade -1
```

## 🔌 API Endpoints

### Authentication

- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - User logout

### Analyses

- `GET /api/v1/analyses` - List user analyses
- `POST /api/v1/analyses` - Create new analysis
- `GET /api/v1/analyses/{id}` - Get analysis details
- `DELETE /api/v1/analyses/{id}` - Delete analysis
- `POST /api/v1/analyses/{id}/rerun` - Rerun analysis

### Uploads

- `POST /api/v1/upload` - Upload code files
- `POST /api/v1/upload/github` - Connect GitHub repository

### WebSocket

- `WS /ws` - Real-time analysis updates

### Health

- `GET /api/v1/health` - Health check
- `GET /api/v1/health/db` - Database health
- `GET /api/v1/health/redis` - Redis health

## 🤖 AI Services

### Code Analysis

The backend integrates with multiple AI services for comprehensive code analysis:

- **OpenAI GPT-4** - General code review and suggestions
- **Anthropic Claude** - Detailed code analysis and explanations
- **Custom Models** - Specialized security and performance analysis

### Analysis Types

- **Security Analysis** - Vulnerability detection
- **Performance Analysis** - Bottleneck identification
- **Code Quality** - Best practices enforcement
- **Refactoring Suggestions** - Code improvement recommendations

## 🧪 Testing

### Test Structure

```
tests/
├── conftest.py          # Test configuration
├── test_api/           # API endpoint tests
├── test_services/      # Service layer tests
├── test_models/        # Model tests
└── fixtures/           # Test data
```

### Running Tests

```bash
# Run all tests
pytest

# Run specific test file
pytest tests/test_api/test_analyses.py

# Run with coverage
pytest --cov=app --cov-report=html

# Run integration tests
pytest tests/integration/
```

## 📦 Building for Production

### Docker

```bash
# Build image
docker build -t ai-code-review-backend .

# Run container
docker run -p 8000:8000 ai-code-review-backend
```

### Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f backend
```

## 🔒 Security

### Authentication

- JWT-based authentication
- Refresh token rotation
- Password hashing with bcrypt
- Rate limiting on auth endpoints

### Authorization

- Role-based access control (RBAC)
- API key authentication for external services
- OAuth2 integration with GitHub

### Data Protection

- Input validation with Pydantic
- SQL injection prevention with SQLAlchemy
- XSS protection
- CORS configuration

## 📊 Monitoring

### Logging

- Structured JSON logging
- Request/response logging
- Error tracking with Sentry
- Performance metrics

### Health Checks

- Database connectivity
- Redis connectivity
- External API health
- System resource monitoring

## 🚀 Deployment

### Production Checklist

- [ ] Set production environment variables
- [ ] Configure database with proper credentials
- [ ] Set up Redis for caching and job queues
- [ ] Configure logging and monitoring
- [ ] Set up SSL/TLS certificates
- [ ] Configure reverse proxy (nginx)
- [ ] Set up backup strategy
- [ ] Configure CI/CD pipeline

### Deployment Options

- **Docker** - Containerized deployment
- **Kubernetes** - Orchestrated deployment
- **AWS ECS** - Managed container service
- **Google Cloud Run** - Serverless containers
- **Heroku** - Platform as a service

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Follow PEP 8 guidelines
- Use type hints for all functions
- Write docstrings for public APIs
- Use Black for code formatting
- Use isort for import sorting

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

## 🆘 Support

For support and questions:

- 📧 Email: support@aicode-review.com
- 💬 Discord: [Join our community](https://discord.gg/aicode-review)
- 📖 Documentation: [docs.aicode-review.com](https://docs.aicode-review.com)
- 🐛 Issues: [GitHub Issues](https://github.com/your-org/ai-code-review/issues)
