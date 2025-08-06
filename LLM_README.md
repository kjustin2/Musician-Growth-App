# LLM Codebase Guide: Svelte + Dexie.js Application

## Project Overview

This is a **Svelte + TypeScript + Dexie.js** application with strict type safety, comprehensive validation, and a layered architecture. The project demonstrates enterprise-level code organization with advanced TypeScript patterns, reactive state management, and robust error handling.

## Technology Stack

### Core Technologies

- **Frontend**: Svelte 4.2.19 with TypeScript
- **Database**: Dexie.js 3.2.7 (IndexedDB wrapper)
- **Build Tool**: Vite 5.4.10
- **Package Manager**: npm with ES modules (`"type": "module"`)

### Development Tools

- **TypeScript**: 5.2.2 with strict configuration
- **ESLint**: 8.57.0 with TypeScript plugin and advanced rules
- **Prettier**: 3.2.5 with Svelte plugin
- **tsx**: 4.7.1 for TypeScript script execution

## Architecture Patterns

### 1. Layered Architecture

```
src/
├── backend/           # Data layer and business logic
│   ├── database/      # Database entities and operations
│   └── logger.ts      # Centralized logging
├── frontend/          # Presentation layer
│   ├── components/    # Svelte components
│   ├── logic/         # Business logic and state management
│   └── css/           # Modular CSS organization
└── scripts/           # Build and validation scripts
```

### 2. Entity-Based Database Architecture

- **BaseOperations**: Core CRUD operations with logging
- **BaseEntity**: Validation, reactive stores, and entity lifecycle
- **Schema-First**: Single source of truth for field definitions
- **Type Generation**: Automatic TypeScript types from schemas

### 3. Reactive State Management

- **Svelte Stores**: Centralized reactive state
- **Logic Separation**: Business logic separated from components
- **Singleton Entities**: Single instances with shared stores

## TypeScript Standards (STRICT MODE)

### Compiler Configuration

```typescript
// tsconfig.json - Ultra-strict settings
{
  "strict": true,
  "noUnusedLocals": true,
  "noUnusedParameters": true,
  "exactOptionalPropertyTypes": true,
  "noImplicitReturns": true,
  "noUncheckedIndexedAccess": true,
  "noImplicitOverride": true,
  "allowUnusedLabels": false,
  "allowUnreachableCode": false
}
```

### Type Safety Patterns

1. **No `any` types** - Use `unknown` for uncertain types
2. **Explicit return types** - All functions must declare return types
3. **Proper error handling** - `unknown` errors with type guards
4. **Null safety** - No non-null assertions (`!`)
5. **Template literals** - Prefer over string concatenation
6. **Nullish coalescing** - Use `??` and `??=` operators

### Error Handling Pattern

```typescript
// Standard error handling in catch blocks
catch (error) {
  // error is 'unknown' in strict mode
  logger.errorLog('Module', 'Operation failed', error);
  throw error; // Re-throw for caller handling
}

// Logger handles unknown -> Error conversion internally
const toError = (error: unknown): Error => {
  if (error instanceof Error) return error;
  if (typeof error === 'string') return new Error(error);
  return new Error('Unknown error occurred');
};
```

## ESLint Rules (COMPREHENSIVE)

### TypeScript-Specific Rules

- `@typescript-eslint/no-explicit-any`: Error - No any types
- `@typescript-eslint/explicit-function-return-type`: Warn - Explicit returns
- `@typescript-eslint/no-non-null-assertion`: Error - No ! assertions
- `@typescript-eslint/prefer-nullish-coalescing`: Error - Use ?? operator
- `@typescript-eslint/no-floating-promises`: Error - Handle all promises
- `@typescript-eslint/no-unsafe-*`: Error - Prevent unsafe operations

### Code Quality Rules

- `prefer-template`: Error - Use template literals
- `object-shorthand`: Error - Use ES6 shorthand
- `eqeqeq`: Error - Always use strict equality
- `curly`: Error - Always use braces
- `no-duplicate-imports`: Error - Consolidate imports

### File-Specific Overrides

- **Scripts**: Console allowed, no explicit returns required
- **Logger**: Console statements allowed
- **Type definitions**: Triple-slash references allowed

## Database Architecture

### Entity Pattern

```typescript
// 1. Schema Definition (Single Source of Truth)
export const ItemFields = BaseSchema.createFieldDefinitions({
  name: {
    type: 'string',
    indexed: true,
    required: true,
    validate: validators.nonEmptyString('Name'),
  },
  description: {
    type: 'string',
    required: false,
    validate: validators.string('Description'),
  },
});

// 2. Type Generation
export type Item = IBaseEntity & ExtractFieldsFromDefinitions<typeof ItemFields>;

// 3. Entity Class (Singleton Pattern)
export class ItemEntity extends BaseEntity<Item> {
  private static _instance: ItemEntity | null = null;

  static getInstance(): ItemEntity {
    this._instance ??= new ItemEntity();
    return this._instance;
  }
}

// 4. Exports for Frontend
export const getItemEntity = BaseEntity.createGetter(ItemEntity);
export const items = BaseEntity.createStore(ItemEntity);
```

### Validation System

- **Schema-based validation**: Centralized validation rules
- **Type-safe validators**: Reusable validation functions
- **Automatic trimming**: String fields auto-trimmed
- **Error aggregation**: Multiple validation errors collected

### Database Operations

- **Automatic logging**: All operations logged with context
- **Reactive updates**: Store automatically updated after operations
- **Bulk operations**: Optimized bulk add/update/delete
- **Transaction safety**: Operations wrapped in try-catch

## Svelte Patterns

### Component Architecture

```svelte
<!-- Prop-based communication -->
<script>
  export let newItemName; // Svelte store
  export let items; // Svelte store
  export let addItem; // Function
  export let deleteItem; // Function
</script>

<!-- Reactive bindings -->
<input bind:value={$newItemName} />
<button on:click={() => deleteItem(item.id)}>Delete</button>

<!-- Reactive rendering -->
{#if $items.length === 0}
  <p>No items yet</p>
{:else}
  {#each $items as item (item.id)}
    <div>{item.name}</div>
  {/each}
{/if}
```

### Logic Separation Pattern

```typescript
// Logic functions return typed objects
export function createItemLogic(): {
  newItemName: Writable<string>;
  items: Writable<Item[]>;
  addItem: () => Promise<void>;
  deleteItem: (id: number) => Promise<void>;
} {
  // Implementation with explicit return type
}

// App logic composes multiple logic modules
export function createAppLogic(): ReturnType<typeof createItemLogic> & { loading: boolean } {
  const itemLogic = createItemLogic();
  return { ...itemLogic, loading };
}
```

### Store Usage Patterns

- **Writable stores** for form inputs
- **Derived stores** for computed values
- **Store composition** in logic functions
- **Reactive subscriptions** with `$` syntax

## CSS Organization

### Modular Structure

```
css/
├── app.css              # Main entry point
└── components/          # Component-specific styles
    ├── variables.css    # CSS custom properties
    ├── base.css         # Base styles and resets
    ├── layout.css       # Layout utilities
    ├── forms.css        # Form components
    ├── buttons.css      # Button variants
    ├── cards.css        # Card components
    └── utilities.css    # Utility classes
```

### CSS Standards

- **Component-scoped**: Each component type has its own CSS file
- **CSS Custom Properties**: Centralized design tokens
- **Utility-first**: Common patterns as utility classes
- **Responsive**: Mobile-first responsive design

## Development Workflow

### Validation Pipeline

```bash
npm run validate  # Automated validation with auto-fixes
```

**Pipeline Steps:**

1. **Auto-fix phase**: ESLint auto-fix + Prettier format
2. **Validation phase**: TypeScript + Svelte + ESLint + Prettier checks
3. **Colored output**: Clear success/failure indicators
4. **Developer-friendly**: Fixes what it can, reports what needs attention

### Available Scripts

- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run build:gh-pages` - Production build for GitHub Pages deployment
- `npm run validate` - Full validation pipeline
- `npm run lint:fix` - Auto-fix linting issues
- `npm run format` - Format all files
- `npm run type-check` - TypeScript validation only

### Pre-commit Workflow

Always run `npm run validate` before committing. This ensures:

- All TypeScript types are correct
- All ESLint rules pass
- All files are properly formatted
- Svelte components are valid

## Deployment

### GitHub Pages Deployment

The application is configured for automatic deployment to GitHub Pages using GitHub Actions.

#### Deployment Configuration

**Vite Configuration:**

- Dynamic base path: Uses `/svelte-dexie-app/` for production, `/` for development
- Production builds include proper asset paths for GitHub Pages
- `.nojekyll` file ensures Vite assets are served correctly

**GitHub Actions Workflow (`.github/workflows/deploy.yml`):**

- Triggers on push to main branch
- Runs full validation pipeline before deployment
- Uses Node.js 18 with npm caching
- Deploys to GitHub Pages environment with proper permissions

#### Deployment Process

1. **Automated**: Push to main branch triggers deployment
2. **Validation**: Runs `npm run validate` to ensure code quality
3. **Build**: Executes `npm run build:gh-pages` with production environment
4. **Deploy**: Uploads build artifacts and deploys to GitHub Pages

#### Common Deployment Issues & Solutions

**Platform-Specific Dependencies:**

- Issue: `@rollup/rollup-win32-x64-msvc` fails on Linux GitHub Actions
- Solution: Remove platform-specific Rollup dependencies; Vite handles platform detection automatically
- Lesson: Avoid explicit platform-specific dependencies in package.json

**Incorrect Base Path Configuration:**

- Issue: Assets return 404 errors due to wrong base path
- Solution: Ensure `base` in vite.config.ts matches exact repository name
- Example: `/Musician-Growth-App/` not `/svelte-dexie-app/`
- Verification: Check generated `dist/index.html` for correct asset paths

**Cross-Platform Build Scripts:**

- Issue: `NODE_ENV=production` syntax fails on Windows CMD
- Solution: Use `cross-env` package for environment variable compatibility
- Implementation: `cross-env NODE_ENV=production vite build`

**Missing Static Files:**

- Issue: `.nojekyll` file not copied to build output
- Solution: Configure `publicDir: '../../public'` in Vite config
- Importance: GitHub Pages needs `.nojekyll` to serve Vite-built assets correctly

#### Manual Deployment

```bash
# Build for GitHub Pages
npm run build:gh-pages

# The dist/ directory contains the deployable assets
```

#### Setup Requirements

1. **Repository Settings**: Enable GitHub Pages with "GitHub Actions" as source
2. **Repository Name**: Update base path in `vite.config.ts` to match repository name
3. **Permissions**: Workflow has required permissions for Pages deployment

#### Deployment Troubleshooting

**Debugging Failed Deployments:**

1. **Check GitHub Actions Logs**: Review build output for specific errors
2. **Verify Asset Paths**: Inspect `dist/index.html` for correct base path references
3. **Test Local Build**: Run `npm run build:gh-pages` locally to catch issues early
4. **Browser Console**: Check for 404 errors indicating path mismatches

**Key Configuration Files:**

```typescript
// vite.config.ts - Critical settings
export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/Musician-Growth-App/' : '/',
  publicDir: '../../public', // Ensures .nojekyll is copied
  build: {
    outDir: '../../dist',
    emptyOutDir: true, // Clean builds
  },
});
```

**Dependencies for Deployment:**

- `cross-env`: Cross-platform environment variables
- `@sveltejs/vite-plugin-svelte`: Svelte compilation
- No platform-specific Rollup dependencies needed

#### Live Application

Once deployed, the application is available at:
`https://[username].github.io/[repository-name]/`

**Deployment Verification:**

- Assets load without 404 errors
- Application renders correctly (no blank white screen)
- Browser console shows no critical errors
- IndexedDB functionality works in production environment

## Code Standards to Follow

### 1. Function Signatures

```typescript
// ✅ CORRECT: Explicit return type
export function createLogic(): LogicReturnType {
  return {
    /* ... */
  };
}

// ❌ INCORRECT: Missing return type
export function createLogic() {
  return {
    /* ... */
  };
}
```

### 2. Error Handling

```typescript
// ✅ CORRECT: Handle unknown errors
try {
  await operation();
} catch (error) {
  logger.errorLog('Module', 'Operation failed', error);
  throw error;
}

// ❌ INCORRECT: Assume error is Error type
catch (error: Error) { /* TypeScript error in strict mode */ }
```

### 3. Type Safety

```typescript
// ✅ CORRECT: Proper type guards
if ('name' in entity) {
  const name = (entity as { name: string }).name;
}

// ❌ INCORRECT: Any types or non-null assertions
const name = (entity as any).name;
const name = entity.name!;
```

### 4. Store Usage

```typescript
// ✅ CORRECT: Explicit store types
const store: Writable<string> = writable('');

// ✅ CORRECT: Get store values safely
const value = get(store);

// ❌ INCORRECT: Implicit types
const store = writable('');
```

### 5. Import Organization

```typescript
// ✅ CORRECT: Consolidated imports
import { writable, get, type Writable } from 'svelte/store';

// ❌ INCORRECT: Duplicate imports
import { writable } from 'svelte/store';
import type { Writable } from 'svelte/store';
```

## Entity Creation Guidelines

When adding new entities, follow this pattern:

1. **Create schema** in `src/backend/database/types/[entity]/[entity]Schema.ts`
2. **Define field definitions** with validation
3. **Generate TypeScript types** from schema
4. **Create entity class** extending BaseEntity
5. **Export getter and store** using BaseEntity helpers
6. **Add to database** in `src/backend/database/db.ts`
7. **Create frontend logic** in `src/frontend/logic/types/[entity]Logic.ts`

## Performance Considerations

- **Singleton entities**: Prevent multiple instances
- **Reactive stores**: Automatic UI updates
- **Bulk operations**: Optimized database operations
- **Lazy loading**: Load data on mount
- **Transaction batching**: Group related operations
- **Production builds**: Optimized Vite builds with tree-shaking and minification
- **Asset optimization**: Proper base paths for CDN-like serving on GitHub Pages

## Security Practices

- **Input validation**: All user input validated
- **Type safety**: Prevent runtime type errors
- **Error boundaries**: Graceful error handling
- **Logging**: Comprehensive operation logging
- **No eval**: Strict CSP-compatible code
- **Secure deployment**: GitHub Actions with minimal required permissions
- **Static hosting**: Client-side only application with no server-side vulnerabilities

## Production Deployment

### Build Process

The production build process includes:

1. **Environment Detection**: `cross-env NODE_ENV=production` sets proper base paths (cross-platform)
2. **Asset Optimization**: Vite optimizes bundles, images, and CSS with correct base paths
3. **Type Safety**: Full TypeScript compilation with strict settings
4. **Code Quality**: Complete validation pipeline before deployment
5. **Static Generation**: Pure client-side application suitable for CDN hosting
6. **Asset Path Resolution**: Dynamic base path ensures assets load correctly on GitHub Pages
7. **Static File Copying**: Public directory assets (including .nojekyll) copied to build output

### Build Troubleshooting

**Common Build Issues:**

1. **Platform Compatibility**: Use `cross-env` for environment variables across Windows/Linux
2. **Asset Path Errors**: Verify base path matches repository name exactly
3. **Missing Static Files**: Ensure `publicDir` is configured correctly in Vite config
4. **Dependency Conflicts**: Avoid platform-specific dependencies that fail in CI/CD

**Build Verification Steps:**

```bash
npm run build:gh-pages          # Build for production
ls dist/                        # Verify .nojekyll exists
cat dist/index.html            # Check asset paths include base path
```

### Deployment Architecture

- **Static Hosting**: GitHub Pages serves pre-built static assets
- **Client-Side Routing**: Svelte handles navigation without server requirements
- **IndexedDB Storage**: All data stored locally in browser
- **Progressive Enhancement**: Works offline after initial load
- **Cross-Browser Compatibility**: Modern browser support with polyfills

## Deployment Lessons Learned

### Critical Configuration Requirements

1. **Exact Repository Name Matching**: Base path must match GitHub repository name precisely
2. **Cross-Platform Compatibility**: Use `cross-env` for environment variables in npm scripts
3. **Static File Management**: Configure `publicDir` to ensure all public assets are copied
4. **Platform-Agnostic Dependencies**: Avoid explicit platform-specific packages in package.json

### Production Deployment Best Practices

- **Local Testing**: Always test production builds locally before deployment
- **Asset Path Verification**: Inspect generated HTML for correct asset references
- **GitHub Actions Debugging**: Use workflow logs to identify platform-specific issues
- **Browser Console Monitoring**: Check for 404 errors indicating configuration problems

### Deployment Architecture Insights

- **Static Hosting Optimization**: GitHub Pages serves pre-built assets with proper MIME types
- **Client-Side Routing**: Svelte handles navigation without server-side configuration
- **IndexedDB Persistence**: Database works identically in production and development
- **Build Reproducibility**: Consistent builds across development and CI/CD environments

This codebase represents enterprise-level TypeScript/Svelte development with maximum type safety, comprehensive validation, maintainable architecture patterns, production-ready deployment automation, and battle-tested deployment troubleshooting knowledge.
