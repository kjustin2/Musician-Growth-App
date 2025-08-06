# Svelte + Dexie.js Application

A TypeScript-based Svelte application with IndexedDB storage, featuring strict type safety and automated deployment to GitHub Pages.

## 🚀 Live Demo

The application is automatically deployed to GitHub Pages: [View Live App](https://yourusername.github.io/svelte-dexie-app/)

## 📦 Deployment

This app automatically deploys to GitHub Pages when you push to the main branch. The deployment process:

1. Runs full validation (TypeScript, ESLint, Prettier, Svelte checks)
2. Builds the production version with proper base path
3. Deploys to GitHub Pages

### Manual Deployment

To deploy manually:

```bash
npm run build:gh-pages  # Build for GitHub Pages
```

### Setting Up GitHub Pages

1. Go to your repository settings
2. Navigate to "Pages" section
3. Set source to "GitHub Actions"
4. Push to main branch to trigger deployment

## Development Guidelines

### Code Quality Standards

This project enforces strict TypeScript standards and code quality through automated tooling.

### Tools Used

- **TypeScript**: Strict type checking with additional compiler options
- **ESLint**: Code linting with TypeScript and Svelte support
- **Prettier**: Code formatting
- **Svelte Check**: Svelte-specific type checking
- **tsx**: TypeScript execution for build scripts

### Available Scripts

```bash
# Development
npm run dev                 # Start development server
npm run build              # Build for production

# Code Quality
npm run validate           # Auto-fix + validate all (recommended workflow)
npm run validate:manual    # Run all checks manually (fallback)
npm run type-check         # TypeScript type checking
npm run check              # Svelte type checking
npm run check:watch        # Svelte type checking in watch mode
npm run lint               # Run ESLint (check only)
npm run lint:fix           # Run ESLint with auto-fix
npm run format             # Format code with Prettier
npm run format:check       # Check if code is formatted
```

### Pre-Commit Workflow

Before committing code, always run:

```bash
npm run validate
```

This enhanced validation script will:

1. **Auto-fix issues**: Runs `lint:fix` and `format` to automatically resolve fixable problems
2. **Run checks**: Validates TypeScript types, Svelte components, remaining lint issues, and formatting
3. **Report results**: Shows clear success/failure status with colored output

The validation process is designed to be developer-friendly by fixing what it can automatically before reporting any remaining issues that need manual attention.

### TypeScript Configuration

The project uses strict TypeScript settings including:

- `strict: true` - All strict type checking options
- `noUnusedLocals: true` - Error on unused local variables
- `noUnusedParameters: true` - Error on unused parameters
- `exactOptionalPropertyTypes: true` - Strict optional property types
- `noImplicitReturns: true` - Error when not all code paths return a value
- `noUncheckedIndexedAccess: true` - Add undefined to index signature results

### ESLint Rules

**TypeScript-Specific Rules:**

- `@typescript-eslint/no-explicit-any`: No `any` types allowed
- `@typescript-eslint/explicit-function-return-type`: Explicit function return types required (warning)
- `@typescript-eslint/no-unused-vars`: No unused variables (except those prefixed with `_`)
- `@typescript-eslint/prefer-nullish-coalescing`: Prefer `??` over `||`
- `@typescript-eslint/prefer-optional-chain`: Prefer `?.` over manual checks
- `@typescript-eslint/no-floating-promises`: All promises must be handled
- `@typescript-eslint/no-unsafe-*`: Prevent unsafe operations on `any` types
- `@typescript-eslint/no-non-null-assertion`: Forbid `!` non-null assertions
- `@typescript-eslint/switch-exhaustiveness-check`: Ensure switch statements are exhaustive
- `@typescript-eslint/prefer-readonly`: Prefer readonly for class properties

**Code Quality Rules:**

- `prefer-template`: Use template literals instead of string concatenation
- `object-shorthand`: Use ES6 object shorthand
- `eqeqeq`: Always use strict equality (`===`)
- `curly`: Always use braces for control statements
- `no-implicit-coercion`: Prevent implicit type coercion
- `prefer-arrow-callback`: Prefer arrow functions for callbacks
- `no-duplicate-imports`: Prevent duplicate imports

### IDE Setup

For VS Code users:

1. Install recommended extensions (see `.vscode/extensions.json`)
2. Settings are pre-configured for format-on-save and lint-on-save
3. TypeScript strict mode is enabled

### Troubleshooting

**ESLint errors about missing parser:**

```bash
npm install
```

**TypeScript errors in Svelte files:**
Make sure you have the Svelte VS Code extension installed.

**Prettier conflicts with ESLint:**
The configuration is set up to avoid conflicts. Run `npm run lint:fix` followed by `npm run format`.

**Fixing Common ESLint Errors:**

1. **`@typescript-eslint/no-explicit-any`**: Replace `any` with proper types

   ```typescript
   // Bad
   function process(data: any): any {}

   // Good
   function process(data: UserData): ProcessedData {}
   ```

2. **`@typescript-eslint/explicit-function-return-type`**: Add return types

   ```typescript
   // Bad
   function getName() {
     return 'John';
   }

   // Good
   function getName(): string {
     return 'John';
   }
   ```

3. **`@typescript-eslint/no-floating-promises`**: Handle promises

   ```typescript
   // Bad
   fetchData();

   // Good
   void fetchData(); // or await fetchData(); or fetchData().catch(handleError);
   ```

4. **`@typescript-eslint/no-non-null-assertion`**: Use proper null checks

   ```typescript
   // Bad
   const element = document.getElementById('app')!;

   // Good
   const element = document.getElementById('app');
   if (!element) throw new Error('Element not found');
   ```

### Best Practices

1. **Type Everything**: Avoid `any`, use proper types
2. **Handle Errors**: Always handle promises and potential errors
3. **Use Stores**: For reactive state in Svelte components
4. **Consistent Naming**: Use camelCase for variables, PascalCase for components
5. **Small Functions**: Keep functions focused and testable
6. **Comments**: Document complex logic and business rules

### Adding New Dependencies

When adding new packages:

1. Install the package: `npm install package-name`
2. If it's a dev dependency: `npm install -D package-name`
3. Update types if needed: `npm install -D @types/package-name`
4. Run validation: `npm run validate`

### File Organization

```
src/
├── frontend/
│   ├── components/     # Svelte components
│   ├── logic/         # Business logic (TypeScript)
│   └── App.svelte     # Root component
├── backend/
│   └── database/      # Database logic
└── shared/            # Shared utilities
scripts/
└── validate.ts        # TypeScript validation script
```

Keep business logic separate from UI components for better testability and maintainability.

### Validation Script

The project includes a TypeScript validation script (`scripts/validate.ts`) that runs all quality checks with colored output and proper error handling. This script is executed via `npm run validate` and provides a better developer experience than running individual commands manually.
