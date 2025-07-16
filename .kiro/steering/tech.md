# Technology Stack & Build System

## Core Technologies

### Frontend Framework
- **React 18** with TypeScript for type safety and modern development
- **Vite** as build tool and development server for fast builds and HMR
- **Bootstrap 5** with React Bootstrap for responsive UI components

### State Management & Data
- **React Context API** for global state management
- **IndexedDB** for client-side data persistence (no backend required)
- Custom services for storage, analytics, and achievements

### Development Tools
- **TypeScript** with strict configuration for type safety
- **ESLint** with TypeScript and React plugins for code quality
- **Vitest** with React Testing Library for testing
- **JSDOM** for test environment

## Build Commands

### Development
```bash
npm run dev          # Start development server (localhost:5173)
npm run preview      # Preview production build locally
```

### Production
```bash
npm run build        # TypeScript compilation + Vite build
npm run deploy       # Build and deploy to GitHub Pages
```

### Testing & Quality
```bash
npm run test         # Run test suite with Vitest
npm run test:run     # Run tests once (CI mode)
npm run lint         # Run ESLint code quality checks
```

## Configuration Standards

### TypeScript
- Strict mode enabled with `noUncheckedIndexedAccess`
- Path aliases: `@/*` maps to `src/*`
- Target ES2020 with modern browser support

### Build Optimization
- Manual chunk splitting for vendor libraries (React, Bootstrap)
- Bundle analyzer with rollup-plugin-visualizer
- Base path configured for GitHub Pages deployment

### Code Quality Rules
- No unused variables/parameters (with `_` prefix exception)
- Prefer const over let
- Console warnings allowed, errors discouraged
- React Hooks rules enforced