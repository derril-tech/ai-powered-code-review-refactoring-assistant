# Frontend - AI Code Review Assistant

A modern Next.js application providing an intuitive interface for AI-powered code review and analysis.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm
- Git

### Installation

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp env.example .env.local
# Edit .env.local with your configuration

# Start development server
pnpm dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## 🏗️ Project Structure

```
apps/frontend/
├── app/                    # Next.js 13+ app directory
│   ├── about/             # About page
│   ├── dashboard/         # User dashboard
│   ├── demo/              # Interactive demo
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Homepage
├── components/            # Reusable components
│   ├── ui/               # Base UI components
│   └── providers.tsx     # Context providers
├── contexts/             # React contexts
├── hooks/                # Custom React hooks
├── lib/                  # Utility libraries
└── types/                # TypeScript type definitions
```

## 🎨 UI Components

The application uses a custom design system built with:

- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Lucide React** - Beautiful icons
- **Class Variance Authority** - Component variant management

### Available Components

- `Button` - Various button styles and states
- `Card` - Content containers with headers
- `Badge` - Status indicators and labels
- `Toast` - Notification system

## 🔧 Development

### Available Scripts

```bash
# Development
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # Run ESLint
pnpm type-check       # Run TypeScript checks

# Testing
pnpm test             # Run tests
pnpm test:watch       # Run tests in watch mode
pnpm test:coverage    # Generate coverage report

# Code Quality
pnpm format           # Format code with Prettier
pnpm lint:fix         # Fix ESLint issues
```

### Environment Variables

Create a `.env.local` file with the following variables:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws

# Authentication
NEXT_PUBLIC_AUTH_DOMAIN=your-auth-domain
NEXT_PUBLIC_AUTH_CLIENT_ID=your-client-id

# Analytics (optional)
NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id
```

## 🧪 Testing

The project uses Jest and React Testing Library for testing:

```bash
# Run all tests
pnpm test

# Run tests for specific file
pnpm test components/Button.test.tsx

# Run tests with coverage
pnpm test:coverage
```

### Test Structure

- `__tests__/` - Test files
- `jest.config.js` - Jest configuration
- `jest.setup.js` - Test setup and mocks

## 📦 Building for Production

```bash
# Build the application
pnpm build

# Start production server
pnpm start

# Export static files (if needed)
pnpm export
```

## 🐳 Docker

```bash
# Build Docker image
docker build -t ai-code-review-frontend .

# Run container
docker run -p 3000:3000 ai-code-review-frontend
```

## 🔗 API Integration

The frontend communicates with the backend API through:

- **REST API** - For CRUD operations
- **WebSocket** - For real-time updates
- **File Upload** - For code analysis

### API Endpoints

- `POST /api/v1/analyses` - Create new analysis
- `GET /api/v1/analyses/:id` - Get analysis results
- `GET /api/v1/analyses` - List user analyses
- `POST /api/v1/upload` - Upload code files
- `WS /ws` - WebSocket connection for real-time updates

## 🎯 Features

### Core Features

- **Interactive Dashboard** - Monitor analysis activities
- **Real-time Analysis** - Live code review with WebSocket updates
- **Multi-language Support** - Analyze code in various programming languages
- **Security Scanning** - Detect vulnerabilities and security issues
- **Performance Analysis** - Identify performance bottlenecks
- **Code Quality Checks** - Enforce coding standards and best practices

### User Experience

- **Responsive Design** - Works on desktop, tablet, and mobile
- **Dark/Light Mode** - Theme switching capability
- **Accessibility** - WCAG 2.1 AA compliant
- **Keyboard Navigation** - Full keyboard support
- **Screen Reader Support** - ARIA labels and semantic HTML

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms

The application can be deployed to any platform that supports Next.js:

- **Netlify** - Static site hosting
- **AWS Amplify** - Full-stack hosting
- **Google Cloud Run** - Container hosting
- **Docker** - Container deployment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Use TypeScript for all new code
- Follow ESLint and Prettier configurations
- Write tests for new components and features
- Use conventional commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

## 🆘 Support

For support and questions:

- 📧 Email: support@aicode-review.com
- 💬 Discord: [Join our community](https://discord.gg/aicode-review)
- 📖 Documentation: [docs.aicode-review.com](https://docs.aicode-review.com)
- 🐛 Issues: [GitHub Issues](https://github.com/your-org/ai-code-review/issues)
