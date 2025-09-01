# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ChordLine is a SvelteKit-based musician growth tracking application that helps musicians track practice sessions, gigs, goals, and band activities. The app uses IndexedDB via Dexie.js for local data storage with offline support.

## Architecture

### Tech Stack

- **Frontend**: SvelteKit 2 with Svelte 4, TypeScript
- **Database**: IndexedDB via Dexie.js (browser-based, offline-first)
- **Styling**: Component-scoped CSS
- **Build**: Vite
- **Deployment**: GitHub Pages via GitHub Actions

### Code Structure

The application follows a unique architecture with backend logic running in the browser:

- `src/frontend/` - SvelteKit application
  - `routes/` - File-based routing
  - `lib/components/` - Reusable Svelte components (auth, dashboard, shared)
  - `lib/logic/` - Frontend business logic
  - `lib/styles/` - CSS styles
- `src/backend/` - Browser-based backend logic (runs client-side)
  - `database/` - Dexie database schemas and validation
  - `services/auth/` - Authentication service with password hashing
  - `logger.ts` - Logging utilities

### Key Architecture Patterns

1. **Service Layer Pattern**: Generic `EntityService` base class in `db.ts` provides CRUD operations with reactive Svelte stores
2. **Reactive Stores**: All database entities exposed as Svelte stores for reactive UI updates
3. **Client-Side Auth**: Authentication handled entirely in browser using crypto API for password hashing
4. **Type Safety**: Strict TypeScript with comprehensive type checking and validation

## Essential Commands

```bash
# Development
npm run dev                 # Start dev server on http://localhost:5173

# Validation (always run before committing)
npm run validate           # Auto-fix and validate all code

# Manual validation commands
npm run type-check         # TypeScript type checking
npm run check              # Svelte component checking
npm run lint               # ESLint checking
npm run format             # Prettier formatting

# Build
npm run build              # Standard build
npm run build:gh-pages     # Build for GitHub Pages deployment

# Preview
npm run preview            # Preview production build
```

## Development Workflow

### Before Committing

Always run validation to auto-fix issues and ensure code quality:

```bash
npm run validate
```

This command:

1. Auto-fixes linting issues
2. Formats code with Prettier
3. Validates TypeScript types
4. Checks Svelte components
5. Reports clear success/failure status

### Database Operations

The app uses a generic service pattern. To work with database entities:

1. Define types in `src/backend/database/types.ts`
2. Add validation in `src/backend/database/validation.ts`
3. Create service extending `EntityService` in `src/backend/database/db.ts`
4. Access reactive stores in Svelte components

Example pattern:

```typescript
// Service provides CRUD + reactive store
export class YourService extends EntityService<Type, CreateType, UpdateType> {
  constructor() {
    super(db.yourTable, 'YourEntity', validateFunction);
  }
}
```

### Authentication Flow

Authentication is handled client-side:

1. `AuthService` in backend manages user state
2. `authLogic.ts` provides frontend stores and actions
3. Password hashing uses Web Crypto API
4. User state persists in memory (lost on refresh)

### SvelteKit Conventions

- Import from lib using `$lib` alias
- Use `+page.svelte` for pages, `+layout.svelte` for layouts
- Static adapter configured for GitHub Pages deployment
- Custom file structure: `src/frontend/` instead of default `src/`

## Important Configuration

### TypeScript Strictness

The project enforces strict TypeScript with additional checks:

- `noUnusedLocals`: true
- `noUnusedParameters`: true
- `noUncheckedIndexedAccess`: true
- `noImplicitReturns`: true

### ESLint Rules

Key enforced rules:

- No `any` types allowed
- Explicit function return types (warning)
- Prefer nullish coalescing (`??`) and optional chaining (`?.`)
- All promises must be handled
- Switch statements must be exhaustive

### Path Configuration

Custom SvelteKit paths in `svelte.config.js`:

- Routes: `src/frontend/routes`
- Lib: `src/frontend/lib`
- App template: `src/frontend/app.html`

### GitHub Pages Deployment

- Base path automatically set to `/Musician-Growth-App` in production
- Deployment triggered on push to main branch
- Full validation runs before deployment

## Current Implementation Status

### Implemented

- User registration and login
- Generic database service layer with reactive stores
- Authentication service with password hashing
- Dashboard layout structure
- Validation and code quality tooling

### In Progress (Modified files)

- Authentication forms and logic
- Dashboard component
- Database schema extensions

### Requirements to Implement

Based on requirements.md, the following features need implementation:

- Onboarding flow (instruments, genres, bands)
- Band management and switching
- Set list creation and management
- Song tracking (status, genre, recordings)
- Gig and practice logging
- Venue management with autocomplete
- Goals system with progress tracking
- Achievements and badges
- User profile and settings management
