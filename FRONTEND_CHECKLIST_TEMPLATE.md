# 🚀 Frontend Pre-Flight Checklist Template

Copy and paste this checklist for any Next.js frontend project to avoid common runtime errors.

---

## 📦 **1. Dependencies & Package Management**

### Package.json Verification
- [ ] Verify all dependencies are compatible with React 18+
- [ ] Check for deprecated or non-existent packages
- [ ] Ensure all `@radix-ui` packages use correct names and versions
- [ ] Verify `tailwind-merge`, `clsx`, and other utility packages are installed
- [ ] Check that `next-themes` is installed if using theme switching

### Package Installation
- [ ] Run `npm install` or `yarn install` 
- [ ] Resolve any peer dependency conflicts
- [ ] Check for security vulnerabilities with `npm audit`

### Avoid These Problematic Packages
- [ ] ❌ Remove `react-diff-viewer` (use `react-diff-view` instead)
- [ ] ❌ Remove `@radix-ui/react-button` (doesn't exist)
- [ ] ❌ Remove `@radix-ui/react-card` (doesn't exist)
- [ ] ❌ Remove wrong `react-codemirror` (use `@uiw/react-codemirror`)

---

## 🎯 **2. Component Structure & Imports**

### UI Components
- [ ] All UI components exist in `components/ui/`
- [ ] `components/ui/index.ts` exports all components
- [ ] Required components: button, card, badge, input, label, select, alert, skeleton, progress, toast, toaster
- [ ] All components properly implement Radix UI primitives

### Import Statements
- [ ] All `@/components/ui/*` imports resolve correctly
- [ ] API client imported as default: `import apiClient from '@/lib/api'`
- [ ] All icon imports work correctly
- [ ] `useRouter`, `useSearchParams` imported from `'next/navigation'`

### Context Providers
- [ ] All context files exist and are properly implemented
- [ ] Providers properly wrapped in main providers file
- [ ] React Query setup correctly configured (if used)

---

## 🔧 **3. Component Implementation**

### Next.js Specific Issues
- [ ] Components using `useSearchParams` are wrapped in `<Suspense>`
- [ ] All page components have `'use client'` directive when needed
- [ ] Dynamic routes `[id]` have proper parameter handling

### Radix UI Select Components (CRITICAL)
- [ ] **NO** `SelectItem` components have empty string values (`value=""`)
- [ ] All `SelectItem` components have non-empty `value` props
- [ ] Use placeholder values like `"auto"`, `"none"`, or `"default"` instead of `""`

### Button Functionality
- [ ] All `<Button>` components have either:
  - [ ] `onClick` handler, OR
  - [ ] `asChild` prop with `<Link>` child, OR
  - [ ] `disabled` prop (for placeholder buttons)
- [ ] No buttons without functionality

### Link Components
- [ ] All `<Link>` components have valid `href` attributes
- [ ] All linked routes exist as pages
- [ ] Internal links use relative paths

---

## 📁 **4. File Structure & Routes**

### Required Pages (adjust for your project)
- [ ] `app/page.tsx` (home page)
- [ ] `app/dashboard/page.tsx`
- [ ] Main feature pages exist
- [ ] Auth pages exist (if needed)
- [ ] Dynamic routes implemented correctly

### Required Components
- [ ] Navigation component exists
- [ ] Providers component exists
- [ ] All UI components in `components/ui/`

### Required Libraries
- [ ] `lib/api.ts` (API client)
- [ ] `lib/types.ts` (TypeScript types)
- [ ] `lib/utils.ts` (utility functions)
- [ ] Other required lib files

---

## ⚙️ **5. Configuration Files**

### Environment Variables
- [ ] Create `.env.local` file (copy from `env.example`)
- [ ] Set all required API URLs
- [ ] Set all required app configuration
- [ ] Verify no missing environment variables

### Configuration Files
- [ ] `next.config.js` properly configured
- [ ] `tailwind.config.js` includes all necessary paths
- [ ] `tsconfig.json` has correct path mappings
- [ ] `package.json` scripts are correct

---

## 🔍 **6. Code Quality Checks**

### TypeScript
- [ ] Run `npm run type-check` (if available)
- [ ] Resolve all TypeScript errors
- [ ] Check for missing type imports

### Linting
- [ ] Run `npm run lint`
- [ ] Fix all linting errors
- [ ] Ensure consistent code formatting

### Common Runtime Errors Prevention
- [ ] No `React.Children.only` errors (check Radix UI components)
- [ ] No missing `onClick` handlers on interactive buttons
- [ ] No broken import paths
- [ ] No missing environment variables in client-side code

---

## 🧪 **7. Pre-Launch Testing**

### Build Test
- [ ] Run `npm run build` successfully
- [ ] No build errors or warnings
- [ ] All imports resolve correctly

### Development Server
- [ ] Navigate to correct directory
- [ ] Run `npm run dev` from correct location
- [ ] Server starts without errors
- [ ] No console errors in browser

### Navigation Testing
- [ ] All navigation menu items work
- [ ] All buttons have proper functionality
- [ ] All forms submit correctly
- [ ] All links navigate to correct pages

---

## 📋 **Quick Pre-Flight Commands**

```bash
# 1. Navigate to frontend directory
cd [your-frontend-directory]

# 2. Install dependencies
npm install

# 3. Check for issues
npm run lint
npm run type-check  # if available
npm run build

# 4. Start development server
npm run dev
```

---

## ✅ **Ready to Launch Checklist**

- [ ] All above checklist items completed
- [ ] `npm run build` succeeds
- [ ] `npm run dev` starts without errors
- [ ] Browser console shows no errors
- [ ] All navigation works
- [ ] All buttons are functional
- [ ] All forms work correctly
- [ ] All API calls configured properly

---

## 🚨 **Emergency Quick Fixes**

If errors occur:
- [ ] **Radix UI Select Error**: Check for `value=""` in SelectItem components
- [ ] **Import Errors**: Verify all file paths and component exports
- [ ] **useSearchParams Error**: Wrap component in Suspense boundary
- [ ] **Button Not Working**: Add onClick handler or asChild prop
- [ ] **Build Errors**: Check TypeScript types and imports

---

**Project:** ___________________  
**Date:** ___________________  
**Completed by:** ___________________

