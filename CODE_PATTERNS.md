# Code Patterns and Architecture Guide

## Overview

The Musician Growth App is a React/TypeScript application built with enterprise-grade patterns and practices. This document explains the core architectural patterns, code organization, and how components connect across the codebase.

## Core Architecture Patterns

### 1. **Centralized State Management with Context + Reducer**
- **Location**: `src/context/AppContext.tsx`
- **Pattern**: Single source of truth using React Context API with useReducer
- **Benefits**: Type-safe state management, predictable state updates, no external dependencies

```typescript
// State shape defined in types.ts
interface AppState {
  currentPage: PageState;
  musicianProfile: MusicianProfile | null;
  recommendations: Recommendation[];
  isLoading: boolean;
}

// Actions are type-safe and predictable
type AppAction = 
  | { type: 'SET_PAGE'; payload: PageState }
  | { type: 'SET_PROFILE'; payload: MusicianProfile }
  // ... other actions
```

### 2. **Custom Hook Pattern for State Access**
- **Location**: `src/context/AppContext.tsx:49-105`
- **Pattern**: Custom hooks abstract state logic and provide convenient APIs
- **Benefits**: Encapsulation, reusability, error handling

```typescript
// Core hook
export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

// Convenience hooks for specific actions
export function useSetPage() {
  const { dispatch } = useApp();
  return (page: PageState) => dispatch({ type: 'SET_PAGE', payload: page });
}

// Business logic hooks
export function useSubmitProfile() {
  const { dispatch } = useApp();
  return useCallback(async (profile: MusicianProfile) => {
    // Complex async logic handled here
  }, [dispatch]);
}
```

### 3. **Component-Level State Management with useReducer**
- **Location**: `src/components/MusicianForm/MusicianForm.tsx:14-78`
- **Pattern**: Local state management for complex forms
- **Benefits**: Predictable state updates, easier testing, better performance

```typescript
// Local form state separate from global app state
interface FormState {
  currentStep: number;
  formData: Partial<MusicianProfile>;
  customInstrument: {
    isOther: boolean;
    value: string;
  };
}

// Type-safe actions for form state
type FormAction = 
  | { type: 'NEXT_STEP' }
  | { type: 'SET_INSTRUMENT', payload: string }
  // ... other form actions
```

### 4. **Rule-Based Business Logic Pattern**
- **Location**: `src/core/recommendationEngine.ts`
- **Pattern**: Declarative rule system with condition functions
- **Benefits**: Maintainable, testable, extensible business logic

```typescript
interface Rule {
  id: string;
  title: string;
  description: string;
  category: Recommendation['category'];
  priority: Recommendation['priority'];
  condition: (profile: MusicianProfile) => boolean;
}

// Rules are data-driven and composable
const rules: Rule[] = [
  {
    id: 'MKT_01',
    title: 'Build Your Online Presence',
    condition: (p) => (p.marketingEfforts.length === 0 || p.marketingEfforts.includes('none')) && getCrowdSizeNumber(p.crowdSize) < 50,
    // ... other properties
  },
  // ... more rules
];
```

### 5. **Constants-Driven Configuration**
- **Location**: `src/core/constants.ts`
- **Pattern**: All magic numbers, strings, and configuration in one place
- **Benefits**: Single source of truth, easy to maintain, prevents magic numbers

```typescript
export const FORM_STEPS = {
  TOTAL: 5,
  INSTRUMENT: 1,
  PERFORMANCE_FREQUENCY: 2,
  // ... other steps
} as const;

export const RECOMMENDATION_CONFIG = {
  MIN_RECOMMENDATIONS: 3,
  MAX_RECOMMENDATIONS: 5,
  LOADING_DELAY_MS: 2000,
} as const;
```

## Component Architecture

### 1. **Page-Level Components**
- **Pattern**: Top-level components that handle routing and major UI states
- **Examples**: `LandingPage`, `MusicianForm`, `RecommendationsList`
- **Responsibilities**: Layout, navigation, state coordination

### 2. **Step Components**
- **Location**: `src/components/MusicianForm/steps/`
- **Pattern**: Composable form steps with consistent interfaces
- **Benefits**: Reusable, testable, single responsibility

```typescript
// Consistent prop interfaces across all steps
interface StepProps {
  value: SomeType;
  onValueChange: (value: SomeType) => void;
}
```

### 3. **Common/Shared Components**
- **Location**: `src/components/common/`
- **Pattern**: Reusable UI components with consistent APIs
- **Examples**: `Button`, `LoadingSpinner`, `ProgressBar`, `ErrorBoundary`

### 4. **Error Boundary Pattern**
- **Location**: `src/components/common/ErrorBoundary.tsx`
- **Pattern**: React error boundaries for graceful error handling
- **Benefits**: Prevents app crashes, better user experience

## Data Flow Patterns

### 1. **Unidirectional Data Flow**
```
User Input → Form State → Global State → UI Update
     ↓
User Action → Dispatch Action → Reducer → New State → Re-render
```

### 2. **Async Operation Pattern**
```typescript
// Pattern used in useSubmitProfile
export function useSubmitProfile() {
  return useCallback(async (profile: MusicianProfile) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      // Business logic
      const recommendations = generateRecommendations(profile);
      dispatch({ type: 'SET_RECOMMENDATIONS', payload: recommendations });
      // Navigation
      dispatch({ type: 'SET_PAGE', payload: 'results' });
    } catch (error) {
      console.error('Profile submission error:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [dispatch]);
}
```

### 3. **Component Communication**
- **Parent → Child**: Props
- **Child → Parent**: Callback functions
- **Sibling ↔ Sibling**: Global state via Context
- **Cross-cutting concerns**: Custom hooks

## Type Safety Patterns

### 1. **Strict TypeScript Configuration**
- **Location**: `tsconfig.json`
- **Pattern**: Strict mode enabled, no implicit any
- **Benefits**: Compile-time error detection, better IDE support

### 2. **Interface-First Design**
- **Location**: `src/core/types.ts`
- **Pattern**: All data structures defined as interfaces first
- **Benefits**: Contract-driven development, easier refactoring

### 3. **Const Assertions**
```typescript
export const FORM_STEPS = {
  TOTAL: 5,
  INSTRUMENT: 1,
  // ...
} as const; // Ensures literal types, not just number
```

## Performance Patterns

### 1. **Memoization**
- **React.memo**: Used for expensive components
- **useCallback**: Used for stable function references
- **useMemo**: Used for expensive calculations

### 2. **Lazy Loading**
- Components are loaded on-demand based on current page state
- No unnecessary renders of inactive components

### 3. **Form Optimization**
- Local state for form data to avoid global state pollution
- Validation only when needed
- Debounced inputs where appropriate

## Testing Patterns

### 1. **Test Structure**
- **Unit Tests**: Business logic (`recommendationEngine.test.ts`)
- **Component Tests**: React components with React Testing Library
- **Integration Tests**: Complete user flows

### 2. **Test Organization**
- Tests co-located with components (`.test.tsx` files)
- Shared test utilities in `src/test-utils.tsx`
- Consistent test patterns across the codebase

## File Organization

```
src/
├── components/           # UI Components
│   ├── common/          # Reusable UI components
│   ├── LandingPage/     # Landing page component
│   ├── MusicianForm/    # Form components
│   │   └── steps/       # Individual form steps
│   └── Recommendation/  # Recommendation display components
├── context/             # Global state management
├── core/                # Business logic and types
│   ├── constants.ts     # Configuration constants
│   ├── recommendationEngine.ts  # Business logic
│   └── types.ts         # TypeScript interfaces
├── hooks/               # Custom React hooks (future use)
├── styles/              # Global styles
└── test-utils.tsx       # Testing utilities
```

## Key Design Principles

1. **Single Responsibility**: Each component/function has one clear purpose
2. **Composition over Inheritance**: Components are composed rather than extended
3. **Dependency Injection**: Dependencies are injected via props/hooks
4. **Immutability**: State is never mutated directly
5. **Type Safety**: Everything is typed, no `any` types
6. **Separation of Concerns**: Business logic separate from UI logic
7. **Testability**: All components and functions are easily testable

## Connection Points

### 1. **App.tsx** - Central Router
- Connects global state to page-level components
- Handles page navigation based on state
- Wraps everything in ErrorBoundary

### 2. **AppContext.tsx** - State Hub
- Connects all components to global state
- Provides business logic through custom hooks
- Manages async operations

### 3. **MusicianForm.tsx** - Form Orchestrator
- Connects form steps to form state
- Handles form validation and submission
- Bridges local form state to global state

### 4. **RecommendationEngine.ts** - Business Logic Core
- Processes user input into recommendations
- Implements rule-based logic
- Pure functions for easy testing

This architecture provides a scalable, maintainable, and testable foundation for the Musician Growth App, with clear separation of concerns and type-safe interfaces throughout.