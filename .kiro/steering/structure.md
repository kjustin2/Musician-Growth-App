# Project Structure & Architecture

## Directory Organization

### Source Structure (`src/`)
```
src/
├── components/           # React components (feature-based organization)
│   ├── ActivityTracking/ # Performance and practice session tracking
│   ├── BulkEntry/        # Bulk data entry forms and validation
│   ├── Dashboard/        # Main dashboard with analytics and charts
│   ├── GoalManagement/   # Goal setting, tracking, and progress
│   ├── LandingPage/      # Landing page and onboarding flow
│   ├── MusicianForm/     # Profile creation and editing forms
│   ├── ProfileSelection/ # Profile management and switching
│   ├── Recommendation/   # Recommendation display and algorithms
│   └── common/           # Shared UI components (ErrorBoundary, etc.)
├── context/              # React Context for global state
├── core/                 # Business logic, types, and constants
├── services/             # External services and data operations
├── utils/                # Pure utility functions
├── hooks/                # Custom React hooks (currently empty)
├── styles/               # Global and shared CSS
└── tests/                # Cross-cutting tests (accessibility, responsive)
```

## Architecture Patterns

### State Management
- **Single Context Pattern**: `AppContext` manages all global state
- **Reducer Pattern**: Uses `useReducer` for complex state transitions
- **Page-based Navigation**: State-driven routing without external router

### Component Organization
- **Feature-based Folders**: Components grouped by business functionality
- **Barrel Exports**: Index files for clean imports where appropriate
- **Separation of Concerns**: Business logic in `core/`, UI in `components/`

### Data Layer
- **Service Layer**: Abstracted data operations in `services/`
- **Type Safety**: Comprehensive TypeScript interfaces in `core/types.ts`
- **Constants**: Centralized configuration in `core/constants.ts`

### File Naming Conventions
- **Components**: PascalCase (e.g., `MusicianForm.tsx`)
- **Services**: camelCase with descriptive suffixes (e.g., `storageService.ts`)
- **Types**: Descriptive interfaces in `types.ts`
- **Tests**: `.test.tsx` or `.test.ts` suffix

## Key Architectural Decisions

### No External Router
- Uses state-based page navigation via `currentPage` in AppContext
- Simpler for single-page application with modal-like workflows

### Local-First Data
- IndexedDB for persistence without backend dependency
- Services abstract storage operations from components

### Component Composition
- Error boundaries for fault tolerance
- Shared components in `common/` for reusability
- Bootstrap integration for consistent styling