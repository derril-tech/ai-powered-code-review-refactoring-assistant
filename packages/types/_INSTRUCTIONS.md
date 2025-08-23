# Shared Types Package - Instructions

## Purpose
This package contains shared TypeScript types, interfaces, and Zod schemas used across the frontend and backend applications.

## Structure
- `src/index.ts` - Main exports for all types and schemas
- `src/schemas/` - Zod validation schemas
- `src/types/` - TypeScript interfaces and types

## Development Guidelines

### Adding New Types
1. Create the type definition in the appropriate file
2. Export it from `src/index.ts`
3. Add corresponding Zod schema if validation is needed
4. Update this package's version when making breaking changes

### Usage
```typescript
// Frontend usage
import { User, Analysis, ApiResponse } from '@ai-code-review/types';

// Backend usage (Python)
# Import from the generated types
from packages.types import User, Analysis, ApiResponse
```

### Validation
- Use Zod schemas for runtime validation
- Keep schemas in sync with TypeScript types
- Export both the type and schema for each entity

## TODO
- [ ] Add more specific domain types for code analysis
- [ ] Create validation schemas for API requests/responses
- [ ] Add utility types for common patterns
- [ ] Generate Python types from TypeScript definitions
