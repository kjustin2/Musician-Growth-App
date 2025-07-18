# Technology Stack & Build System

## Core Technologies

### Frontend Framework
- **React 18.3.1** with TypeScript for type safety and modern development
- **Vite 4.4.0** as build tool and development server for fast builds and HMR
- **Bootstrap 5.3.7** with React Bootstrap 2.10.10 for responsive UI components

### State Management & Data
- **React Context API** with useReducer pattern for global state management
- **IndexedDB** for client-side data persistence (no backend required)
- Custom services layer for storage, analytics, achievements, and business logic
- Comprehensive logging service for debugging and monitoring

### Development Tools
- **TypeScript 5.6.2** with strict configuration for type safety
- **ESLint 9.30.0** with TypeScript and React plugins for code quality
- **Node.js types** for build tooling and utilities
- **Rollup Plugin Visualizer** for bundle analysis

## Build Commands

### Development
```bash
npm run dev          # Start development server (localhost:5173)
npm run preview      # Preview production build locally
```

### Production
```bash
npm run build        # TypeScript compilation + Vite build
npm run predeploy    # Pre-deployment build step
npm run deploy       # Build and deploy to GitHub Pages using gh-pages
```

### Code Quality
```bash
npm run lint         # Run ESLint code quality checks
```

## Configuration Standards

### TypeScript Configuration
- **Strict mode enabled** with comprehensive type checking
- **noUncheckedIndexedAccess**: Prevents unsafe array/object access
- **Path aliases**: `@/*` maps to `src/*` for clean imports
- **Target ES2020** with DOM and DOM.Iterable libraries
- **Module resolution**: Bundler mode for Vite compatibility
- **JSX**: react-jsx transform for modern React

### Vite Build Configuration
- **Base path**: `/Musician-Growth-App/` for GitHub Pages deployment
- **Manual chunk splitting**: 
  - `vendor`: React and React-DOM
  - `bootstrap`: Bootstrap and React-Bootstrap
- **Bundle analyzer**: Generates `dist/stats.html` with gzip/brotli analysis
- **Path resolution**: Alias support for `@/` imports

### ESLint Rules
- **TypeScript ESLint**: Recommended rules with strict type checking
- **React Hooks**: Enforced rules for proper hook usage
- **React Refresh**: Hot reload compatibility warnings
- **Unused variables**: Error with `_` prefix exception for intentionally unused
- **No explicit any**: Warning to encourage proper typing
- **Prefer const**: Error to enforce immutability where possible
- **Console restrictions**: Warnings allowed, errors discouraged

### Dependencies
#### Production Dependencies
- `react`: ^18.3.1
- `react-dom`: ^18.3.1  
- `bootstrap`: ^5.3.7
- `react-bootstrap`: ^2.10.10

#### Development Dependencies
- `@types/node`: ^22.15.34 (Node.js type definitions)
- `@types/react`: ^18.3.23
- `@types/react-dom`: ^18.3.7
- `@vitejs/plugin-react`: ^4.6.0
- `gh-pages`: ^6.3.0 (GitHub Pages deployment)
- `globals`: ^15.15.0 (Global variable definitions)
- `rollup-plugin-visualizer`: ^6.0.3 (Bundle analysis)
- `typescript-eslint`: ^8.35.0 (TypeScript ESLint integration)

## Browser Support & Requirements
- **Modern browsers**: Chrome, Firefox, Safari, Edge (latest 2 versions)
- **IndexedDB support**: Required for data persistence
- **ES2020 features**: Modern JavaScript support required
- **Local Storage**: Used for preferences and onboarding state