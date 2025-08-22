# Frontend App Instructions

## Purpose
This directory contains the Next.js 14 App Router pages and layouts for the AI Code Review Assistant frontend.

## Files Overview

### ✅ **COMPLETED FILES**
- `layout.tsx` - Root layout with providers and metadata
- `page.tsx` - Landing page with hero section and features
- `globals.css` - Global styles and theme definitions

### ❌ **MISSING PAGES** (Required by 8-Step Plan)

#### **Authentication Pages**
- `auth/login/page.tsx` - User login form
- `auth/register/page.tsx` - User registration form
- `auth/forgot-password/page.tsx` - Password reset request
- `auth/reset-password/page.tsx` - Password reset form

#### **Dashboard Pages**
- `dashboard/page.tsx` - Main dashboard with analysis overview
- `dashboard/analyses/page.tsx` - Analysis history and management
- `dashboard/profile/page.tsx` - User profile management
- `dashboard/settings/page.tsx` - User settings and preferences

#### **Analysis Pages**
- `analysis/new/page.tsx` - New analysis creation form
- `analysis/[id]/page.tsx` - Analysis details and results
- `analysis/[id]/findings/page.tsx` - Analysis findings list
- `analysis/[id]/report/page.tsx` - Analysis report view

#### **Demo Pages**
- `demo/page.tsx` - Interactive demo of the application
- `demo/analysis/page.tsx` - Demo analysis workflow

#### **About Pages**
- `about/page.tsx` - About the application and team
- `pricing/page.tsx` - Pricing plans and features
- `docs/page.tsx` - Documentation and guides

## 🚀 **NEXT STEPS FOR CLAUDE**

### **Priority 1: Authentication Flow**
1. **Create authentication pages**
   - Login form with email/password
   - Registration form with validation
   - Password reset flow
   - Error handling and success messages

2. **Implement authentication context**
   - User state management
   - Token storage and refresh
   - Protected route handling
   - Logout functionality

### **Priority 2: Dashboard Implementation**
1. **Create main dashboard**
   - Analysis overview cards
   - Recent activity feed
   - Quick action buttons
   - Statistics and metrics

2. **Add analysis management**
   - Analysis history table
   - Filtering and search
   - Status indicators
   - Action buttons (view, delete, rerun)

### **Priority 3: Analysis Workflow**
1. **New analysis creation**
   - Repository URL input
   - Language selection
   - Analysis type selection
   - File upload interface

2. **Analysis results display**
   - Progress tracking
   - Findings list with severity
   - Code snippet highlighting
   - Auto-fix suggestions

### **Priority 4: User Experience**
1. **Profile management**
   - User profile editing
   - Notification preferences
   - Account settings
   - API key management

2. **Demo and onboarding**
   - Interactive demo
   - Feature walkthrough
   - Sample analysis results
   - Getting started guide

## 📋 **CODING GUIDELINES**

### **Component Structure**
- Use functional components with hooks
- Implement proper TypeScript types
- Follow React best practices
- Use proper error boundaries

### **Styling**
- Use Tailwind CSS for styling
- Follow design system tokens
- Ensure responsive design
- Maintain accessibility standards

### **State Management**
- Use React Context for global state
- Use local state for component-specific data
- Implement proper loading states
- Handle error states gracefully

### **API Integration**
- Use the API client from `lib/api.ts`
- Implement proper error handling
- Add loading indicators
- Handle authentication errors

### **Performance**
- Use Next.js Image component
- Implement proper code splitting
- Optimize bundle size
- Add proper caching strategies

## 🎨 **UI/UX REQUIREMENTS**

### **Design System**
- Follow the established color palette
- Use consistent spacing and typography
- Implement proper component variants
- Maintain visual hierarchy

### **User Experience**
- Provide clear feedback for all actions
- Implement proper loading states
- Add helpful error messages
- Ensure intuitive navigation

### **Accessibility**
- Follow WCAG 2.1 AA guidelines
- Use proper ARIA labels
- Ensure keyboard navigation
- Maintain color contrast ratios

### **Responsive Design**
- Mobile-first approach
- Tablet and desktop optimization
- Touch-friendly interactions
- Proper viewport handling

## 🔗 **DEPENDENCIES**

### **Required Components**
- `@/components/ui/*` - Base UI components
- `@/components/providers` - Context providers
- `@/contexts/*` - React contexts
- `@/hooks/*` - Custom hooks
- `@/lib/*` - Utility functions

### **External Dependencies**
- Next.js 14 App Router
- React 18 with hooks
- TypeScript for type safety
- Tailwind CSS for styling
- Lucide React for icons

## 🧪 **TESTING**

### **Component Testing**
- Test individual components
- Mock API calls
- Test user interactions
- Validate accessibility

### **Page Testing**
- Test complete page workflows
- Test navigation flows
- Test form submissions
- Test error scenarios

### **Integration Testing**
- Test API integration
- Test authentication flows
- Test real-time features
- Test responsive behavior

## 📱 **PAGE STRUCTURE**

```
app/
├── layout.tsx                 # Root layout
├── page.tsx                   # Landing page
├── globals.css               # Global styles
├── auth/                     # Authentication pages
│   ├── login/
│   ├── register/
│   ├── forgot-password/
│   └── reset-password/
├── dashboard/                # Dashboard pages
│   ├── page.tsx
│   ├── analyses/
│   ├── profile/
│   └── settings/
├── analysis/                 # Analysis pages
│   ├── new/
│   └── [id]/
├── demo/                     # Demo pages
│   └── page.tsx
├── about/                    # About pages
│   ├── page.tsx
│   ├── pricing/
│   └── docs/
└── loading.tsx              # Loading component
```

## 🚨 **IMPORTANT NOTES**

### **File Naming**
- Use kebab-case for directories
- Use PascalCase for components
- Use camelCase for functions and variables
- Use descriptive names

### **Routing**
- Follow Next.js 14 App Router conventions
- Use dynamic routes for IDs
- Implement proper loading states
- Handle 404 errors gracefully

### **Performance**
- Use proper image optimization
- Implement code splitting
- Add proper caching headers
- Optimize bundle size

### **Security**
- Validate all user inputs
- Sanitize data before display
- Implement proper CSRF protection
- Handle sensitive data securely
