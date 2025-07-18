# Project Structure & Architecture

## Directory Organization

### Source Structure (`src/`)
```
src/
├── components/              # React components (feature-based organization)
│   ├── ActivityTracking/    # Performance and practice session tracking
│   ├── BandManagement/      # Band member management and collaboration
│   ├── BulkEntry/          # Bulk data entry forms and validation
│   ├── Dashboard/          # Main dashboard with analytics and charts
│   ├── GoalManagement/     # Goal setting, tracking, and progress
│   ├── LandingPage/        # Landing page and onboarding flow
│   ├── MusicianForm/       # Profile creation and editing forms
│   ├── ProfileSelection/   # Profile management and switching
│   ├── Recommendation/     # Recommendation display and algorithms
│   ├── RecordingManagement/ # Recording session tracking and management
│   ├── SetListManagement/  # Set list creation and organization
│   ├── Settings/           # Application settings and preferences
│   └── common/             # Shared UI components (ErrorBoundary, etc.)
├── context/                # React Context for global state
│   └── AppContext.tsx      # Main application context with reducer pattern
├── core/                   # Business logic, types, and constants
│   ├── types.ts            # Comprehensive TypeScript type definitions
│   ├── constants.ts        # Application constants and configuration
│   ├── achievementTypes.ts # Achievement system types and definitions
│   └── recommendationEngine.ts # Recommendation algorithms and logic
├── services/               # External services and data operations
│   ├── storageService.ts   # IndexedDB storage operations
│   ├── analyticsService.ts # Data analysis and performance metrics
│   ├── achievementService.ts # Achievement management and progress tracking
│   ├── bandMemberService.ts # Band member data operations
│   ├── financialTrackingService.ts # Financial data and earnings tracking
│   ├── goalLinkingService.ts # Goal-activity relationship management
│   ├── initializationService.ts # App initialization and setup
│   ├── loggingService.ts   # Comprehensive logging and debugging
│   ├── recordingService.ts # Recording session data management
│   └── setListService.ts   # Set list data operations
├── utils/                  # Pure utility functions
│   ├── index.ts            # Common utility functions
│   ├── accessibility.ts    # WCAG compliance and accessibility validation
│   ├── dataValidation.ts   # Form and data validation utilities
│   ├── goalLinkingUtils.ts # Goal-activity linking logic
│   ├── profileUtils.ts     # Profile management utilities
│   ├── safeAccess.ts       # Safe object property access
│   └── typeGuards.ts       # TypeScript type guard functions
├── hooks/                  # Custom React hooks (available for future use)
├── styles/                 # Global and shared CSS
│   └── forms.css           # Form-specific styling
├── assets/                 # Static assets (currently empty)
├── App.tsx                 # Main application component
├── App.css                 # Application-level styles
├── main.tsx                # Application entry point
└── index.css               # Global styles and CSS variables
```

## Architecture Patterns

### State Management
- **Single Context Pattern**: `AppContext` manages all global state with comprehensive logging
- **Reducer Pattern**: Uses `useReducer` for complex state transitions with action logging
- **Page-based Navigation**: State-driven routing without external router
- **Navigation Context**: Smart navigation that adapts based on user journey (onboarding vs dashboard flows)

### Component Organization
- **Feature-based Folders**: Components grouped by business functionality
- **Domain-Driven Design**: Clear separation between music-specific features (BandManagement, SetListManagement, RecordingManagement)
- **Shared Components**: Common UI elements in `common/` for reusability
- **Separation of Concerns**: Business logic in `core/`, UI in `components/`, data operations in `services/`

### Data Layer Architecture
- **Service Layer Pattern**: Abstracted data operations with consistent interfaces
- **Repository Pattern**: Storage service acts as data repository for IndexedDB
- **Domain Services**: Specialized services for different business domains (achievements, analytics, etc.)
- **Type Safety**: Comprehensive TypeScript interfaces with strict null checking
- **Constants Management**: Centralized configuration and magic numbers

### Advanced Features
- **Achievement System**: Gamified progress tracking with multiple tiers (Bronze to Platinum)
- **Analytics Engine**: Automated trend analysis and performance insights
- **Recommendation Engine**: AI-driven suggestions based on user activity patterns
- **Logging Service**: Comprehensive debugging and monitoring with context-aware logging
- **Goal Linking**: Automatic relationship management between goals and activities

## File Naming Conventions

### Components
- **React Components**: PascalCase (e.g., `MusicianForm.tsx`, `BandManagement.tsx`)
- **Component Folders**: PascalCase matching the main component name
- **Style Files**: camelCase with `.css` extension (e.g., `forms.css`)

### Services & Utilities
- **Services**: camelCase with descriptive suffixes (e.g., `storageService.ts`, `achievementService.ts`)
- **Utilities**: camelCase with descriptive names (e.g., `dataValidation.ts`, `goalLinkingUtils.ts`)
- **Type Guards**: Descriptive names ending in type checking purpose (e.g., `typeGuards.ts`)

### Core Files
- **Types**: Descriptive interfaces and types in `types.ts`
- **Constants**: ALL_CAPS for constants, camelCase for configuration objects
- **Business Logic**: Descriptive names reflecting domain purpose

## Key Architectural Decisions

### No External Router
- **State-based Navigation**: Uses `currentPage` in AppContext for navigation
- **Context-Aware Routing**: Navigation adapts based on user state (new user vs returning)
- **Modal-like Workflows**: Simplified navigation for single-page application patterns

### Local-First Architecture
- **IndexedDB Persistence**: All data stored locally without backend dependency
- **Offline-First**: Application works completely offline
- **Service Abstraction**: Storage operations abstracted through service layer
- **Data Migration**: Built-in support for schema evolution and data migration

### Component Composition Patterns
- **Error Boundaries**: Fault tolerance with graceful error handling
- **Higher-Order Components**: Shared functionality through composition
- **Bootstrap Integration**: Consistent styling with React Bootstrap components
- **Accessibility First**: WCAG 2.1 AA compliance built into component design

### Performance Optimizations
- **Lazy Loading**: Components loaded on demand where appropriate
- **Memoization**: Strategic use of React.memo and useMemo for expensive operations
- **Bundle Splitting**: Vendor and framework code separated for optimal caching
- **IndexedDB Optimization**: Efficient querying and data retrieval patterns

### Type Safety & Validation
- **Strict TypeScript**: Comprehensive type checking with `noUncheckedIndexedAccess`
- **Runtime Validation**: Data validation utilities for form inputs and API boundaries
- **Type Guards**: Runtime type checking for dynamic data
- **Safe Access Patterns**: Utilities for safe object property access