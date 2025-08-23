# Shared UI Package - Instructions

## Purpose
This package contains reusable UI components, design tokens, and styling utilities used across the frontend application.

## Structure
- `src/tokens.ts` - Design tokens (colors, spacing, typography)
- `src/components/` - Reusable React components
- `src/utils/` - Utility functions for styling and theming

## Development Guidelines

### Adding New Components
1. Create the component in `src/components/`
2. Use design tokens from `src/tokens.ts`
3. Export from `src/index.ts`
4. Add proper TypeScript types and documentation
5. Include accessibility features (ARIA labels, keyboard navigation)

### Design System
- Use tokens from `src/tokens.ts` instead of hardcoded values
- Follow the established component patterns
- Ensure components are accessible (WCAG 2.1 AA)
- Support both light and dark themes

### Styling
- Use Tailwind CSS for styling
- Leverage the `cn` utility for conditional classes
- Follow the established color palette and spacing scale
- Use CSS custom properties for theme switching

## Usage
```typescript
// Import components
import { Button, Card, Badge } from '@ai-code-review/ui';

// Import design tokens
import { colors, spacing, typography } from '@ai-code-review/ui';
```

## TODO
- [ ] Add more base components (Modal, Dropdown, etc.)
- [ ] Create theme switching utilities
- [ ] Add animation utilities
- [ ] Create component documentation with examples
- [ ] Add unit tests for components
