# AI Code Review Assistant - Frontend

A modern, responsive Next.js 14 frontend for the AI-powered code review and refactoring assistant. Built with TypeScript, Tailwind CSS, and React 18.

## 🚀 Features

- **Modern UI/UX**: Clean, developer-focused interface with dark/light mode support
- **Real-time Updates**: WebSocket integration for live analysis progress
- **Code Visualization**: Syntax highlighting, diff views, and inline annotations
- **Responsive Design**: Mobile-first approach with touch-friendly interfaces
- **Accessibility**: WCAG 2.1 AA compliant with semantic HTML and ARIA attributes
- **Performance**: Optimized with Next.js 14 App Router and React 18 features
- **Type Safety**: Full TypeScript coverage with comprehensive type definitions

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript 5.0+
- **Styling**: Tailwind CSS 3.3+ with custom design system
- **UI Components**: Radix UI primitives with custom styling
- **State Management**: Zustand + React Query (TanStack Query)
- **Forms**: React Hook Form with Zod validation
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Code Editing**: React CodeMirror
- **Real-time**: WebSocket client
- **HTTP Client**: Axios with interceptors

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn package manager
- Backend API running (see backend README)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-powered-code-review-assistant/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Configuration

### Environment Variables

Key configuration options in `.env.local`:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME="AI Code Review Assistant"
```

### Development Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors
npm run type-check   # Run TypeScript type checking
npm run format       # Format code with Prettier
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
```

## 📁 Project Structure

```
frontend/
├── app/                    # Next.js 14 App Router
│   ├── (auth)/            # Authentication routes
│   ├── (dashboard)/       # Dashboard routes
│   ├── api/               # API routes
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # Reusable components
│   ├── ui/               # Base UI components
│   ├── forms/            # Form components
│   ├── layout/           # Layout components
│   └── providers.tsx     # Context providers
├── contexts/             # React contexts
│   ├── auth-context.tsx  # Authentication context
│   ├── websocket-context.tsx # WebSocket context
│   └── analysis-context.tsx  # Analysis context
├── hooks/                # Custom React hooks
├── lib/                  # Utility libraries
│   ├── api.ts           # API client
│   ├── types.ts         # TypeScript types
│   └── utils.ts         # Utility functions
├── styles/              # Additional styles
└── public/              # Static assets
```

## 🎨 Design System

The application uses a comprehensive design system built with Tailwind CSS and CSS custom properties:

### Colors
- **Primary**: Blue-based color scheme
- **Success**: Green for positive actions
- **Warning**: Orange for warnings
- **Error**: Red for errors
- **Info**: Blue for informational content

### Components
- **Buttons**: Multiple variants (primary, secondary, outline, ghost)
- **Cards**: Flexible card components with headers and content
- **Forms**: Accessible form components with validation
- **Modals**: Dialog and modal components
- **Navigation**: Responsive navigation with mobile support

### Typography
- **Fonts**: Inter for UI, JetBrains Mono for code
- **Scales**: Consistent typography scale
- **Weights**: Multiple font weights for hierarchy

## 🔐 Authentication

The application uses JWT-based authentication with:

- **Login/Register**: Email and password authentication
- **Token Management**: Automatic token refresh
- **Protected Routes**: Route protection with middleware
- **User Context**: Global user state management

## 📊 Real-time Features

WebSocket integration provides real-time updates for:

- **Analysis Progress**: Live progress indicators
- **Status Updates**: Real-time status changes
- **Findings**: Instant notification of new findings
- **Error Handling**: Connection error management

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- components/Button.test.tsx
```

## 📦 Deployment

### Vercel (Recommended)

1. **Connect your repository to Vercel**
2. **Configure environment variables**
3. **Deploy automatically on push**

### Manual Deployment

```bash
# Build the application
npm run build

# Start the production server
npm run start
```

## 🔒 Security

- **CORS Configuration**: Proper CORS setup
- **Input Validation**: Client-side validation with Zod
- **XSS Protection**: Content Security Policy
- **CSRF Protection**: Built-in CSRF protection
- **Secure Headers**: Security headers configuration

## 📈 Performance

- **Code Splitting**: Automatic code splitting with Next.js
- **Image Optimization**: Next.js Image component
- **Bundle Analysis**: Bundle size monitoring
- **Lighthouse Score**: 95+ performance score target

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
- Check the documentation
- Review the API documentation

## 🔮 Roadmap

- [ ] IDE plugin integration
- [ ] Advanced code visualization
- [ ] Team collaboration features
- [ ] Custom rule engine UI
- [ ] Advanced analytics dashboard
- [ ] Mobile app companion
- [ ] Offline support
