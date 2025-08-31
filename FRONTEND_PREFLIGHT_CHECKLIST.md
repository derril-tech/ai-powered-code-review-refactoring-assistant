# 🚀 Frontend Pre-Flight Checklist

## Overview
This checklist ensures your Next.js 14 frontend application runs smoothly without common runtime errors. Complete all items before running `npm run dev`.

---

## 📦 **1. Dependencies & Package Management**

### ✅ Package.json Verification
- [ ] Verify all dependencies are compatible with React 18+
- [ ] Check for deprecated or non-existent packages
- [ ] Ensure all `@radix-ui` packages use correct names and versions
- [ ] Verify `tailwind-merge`, `clsx`, and other utility packages are installed
- [ ] Check that `next-themes` is installed if using theme switching

### ✅ Package Installation
- [ ] Run `npm install` or `yarn install` (avoid `pnpm` if not configured)
- [ ] Resolve any peer dependency conflicts
- [ ] Check for security vulnerabilities with `npm audit`

### ✅ Common Package Issues to Avoid
- [ ] ❌ `react-diff-viewer` (incompatible with React 18)
- [ ] ❌ `@radix-ui/react-button` (doesn't exist)
- [ ] ❌ `@radix-ui/react-card` (doesn't exist)
- [ ] ❌ `react-codemirror` (wrong package name)
- [ ] ✅ Use `@uiw/react-codemirror` instead
- [ ] ✅ Use `react-diff-view` instead of `react-diff-viewer`

---

## 🎯 **2. Component Structure & Imports**

### ✅ UI Components
- [ ] All UI components exist in `components/ui/`
- [ ] `components/ui/index.ts` exports all components
- [ ] Required components: `button`, `card`, `badge`, `input`, `label`, `select`, `alert`, `skeleton`, `progress`, `toast`, `toaster`
- [ ] All components properly implement Radix UI primitives

### ✅ Import Statements
- [ ] All `@/components/ui/*` imports resolve correctly
- [ ] API client imported as default: `import apiClient from '@/lib/api'` (not `{ apiClient }`)
- [ ] All Lucide React icons are imported correctly
- [ ] `useRouter`, `useSearchParams` imported from `'next/navigation'`

### ✅ Context Providers
- [ ] All context files exist: `auth-context.tsx`, `websocket-context.tsx`, `analysis-context.tsx`
- [ ] Providers properly wrapped in `providers.tsx`
- [ ] React Query setup correctly configured

---

## 🔧 **3. Component Implementation**

### ✅ Next.js 14 Specific Issues
- [ ] Components using `useSearchParams` are wrapped in `<Suspense>`
- [ ] All page components have `'use client'` directive when needed
- [ ] Dynamic routes `[id]` have proper parameter handling

### ✅ Radix UI Select Components
- [ ] **CRITICAL**: No `SelectItem` components have empty string values (`value=""`)
- [ ] All `SelectItem` components have non-empty `value` props
- [ ] Use placeholder values like `"auto"`, `"none"`, or `"default"` instead of `""`

### ✅ Button Functionality
- [ ] All `<Button>` components have either:
  - `onClick` handler, OR
  - `asChild` prop with `<Link>` child, OR
  - `disabled` prop (for placeholder buttons)
- [ ] No buttons without functionality

### ✅ Link Components
- [ ] All `<Link>` components have valid `href` attributes
- [ ] All linked routes exist as pages
- [ ] Internal links use relative paths (`/dashboard`, not full URLs)

---

## 📁 **4. File Structure & Routes**

### ✅ Required Pages
- [ ] `app/page.tsx` (home page)
- [ ] `app/dashboard/page.tsx`
- [ ] `app/analysis/new/page.tsx`
- [ ] `app/analysis/[id]/page.tsx` (dynamic route)
- [ ] `app/repositories/page.tsx`
- [ ] `app/proposals/page.tsx`
- [ ] `app/settings/page.tsx`
- [ ] `app/auth/login/page.tsx`
- [ ] `app/auth/register/page.tsx`
- [ ] `app/demo/page.tsx`
- [ ] `app/about/page.tsx`

### ✅ Required Components
- [ ] `components/navigation.tsx`
- [ ] `components/providers.tsx`
- [ ] All UI components in `components/ui/`

### ✅ Required Libraries
- [ ] `lib/api.ts` (API client)
- [ ] `lib/types.ts` (TypeScript types)
- [ ] `lib/utils.ts` (utility functions)
- [ ] `lib/constants.ts` (if referenced)

---

## ⚙️ **5. Configuration Files**

### ✅ Environment Variables
- [ ] Create `.env.local` file (copy from `env.example`)
- [ ] Set `NEXT_PUBLIC_API_URL=http://localhost:8000`
- [ ] Set `NEXT_PUBLIC_WS_URL=ws://localhost:8000`
- [ ] Set `NEXT_PUBLIC_APP_URL=http://localhost:3000`

### ✅ Configuration Files
- [ ] `next.config.js` properly configured
- [ ] `tailwind.config.js` includes all necessary paths
- [ ] `tsconfig.json` has correct path mappings
- [ ] `package.json` scripts are correct

---

## 🔍 **6. Code Quality Checks**

### ✅ TypeScript
- [ ] Run `npm run type-check` (if available)
- [ ] Resolve all TypeScript errors
- [ ] Check for missing type imports

### ✅ Linting
- [ ] Run `npm run lint` 
- [ ] Fix all linting errors
- [ ] Ensure consistent code formatting

### ✅ Common Runtime Errors to Prevent
- [ ] No `React.Children.only` errors (check Radix UI components)
- [ ] No missing `onClick` handlers on interactive buttons
- [ ] No broken import paths
- [ ] No missing environment variables in client-side code

---

## 🧪 **7. Pre-Launch Testing**

### ✅ Build Test
- [ ] Run `npm run build` successfully
- [ ] No build errors or warnings
- [ ] All imports resolve correctly

### ✅ Development Server
- [ ] Navigate to correct directory: `cd apps/frontend`
- [ ] Run `npm run dev` (not from root directory)
- [ ] Server starts without errors
- [ ] No console errors in browser

### ✅ Navigation Testing
- [ ] All navigation menu items work
- [ ] All buttons have proper functionality
- [ ] All forms submit correctly
- [ ] All links navigate to correct pages

---

## 🚨 **8. Common Pitfalls to Avoid**

### ❌ **DON'T:**
- Use `pnpm` commands if pnpm is not installed
- Run `npm run dev` from root directory (use `apps/frontend`)
- Leave buttons without `onClick` handlers
- Use empty string values in Radix UI Select components
- Import API client as named import `{ apiClient }`
- Use deprecated React packages
- Forget `'use client'` directive on interactive components

### ✅ **DO:**
- Run commands from correct directory
- Use proper import statements
- Wrap `useSearchParams` in Suspense
- Test all interactive elements
- Check console for errors
- Verify all routes exist

---

## 📋 **Quick Pre-Flight Command Sequence**

```bash
# 1. Navigate to frontend directory
cd apps/frontend

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

## 🎯 **Success Criteria**

✅ **Ready to Launch When:**
- [ ] All checklist items completed
- [ ] `npm run build` succeeds
- [ ] `npm run dev` starts without errors
- [ ] Browser console shows no errors
- [ ] All navigation works
- [ ] All buttons are functional

---

## 📞 **Emergency Fixes**

If you encounter errors after following this checklist:

1. **Radix UI Select Error**: Check for `value=""` in SelectItem components
2. **Import Errors**: Verify all file paths and component exports
3. **useSearchParams Error**: Wrap component in Suspense boundary
4. **Button Not Working**: Add onClick handler or asChild prop
5. **Build Errors**: Check TypeScript types and imports

---

*Last Updated: Based on RefactorIQ™ Frontend Development Experience*
*Next.js 14 + React 18 + Radix UI + Tailwind CSS*
