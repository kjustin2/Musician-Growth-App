# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

The Musician Growth App is a comprehensive musician growth tracking platform that helps musicians track their performances, practice sessions, goals, and receive personalized recommendations. The application has evolved from a simple MVP to a full-featured tracking system with persistent local storage.

## Development Status

**🚧 MAJOR FEATURE IMPLEMENTATION IN PROGRESS** - *Last updated: 2025-07-15*

The Musician Growth App has been completely redesigned and is being upgraded from a simple form-based MVP to a comprehensive musician tracking platform.

### Current State:
- **✅ Enhanced data models** - Complete type system for profiles, performances, practice, goals
- **✅ IndexedDB storage service** - Full CRUD operations for persistent local storage
- **✅ Analytics service** - Performance trends and practice habit analysis
- **✅ Dashboard components** - Metrics, recent activities, goal progress, quick actions
- **✅ Profile management** - Profile selection, creation, and deletion
- **🚧 Activity tracking** - Performance and practice session logging (in progress)
- **🚧 Goal management** - Goal creation, progress tracking, achievements (in progress)
- **🚧 Enhanced recommendations** - Historical data analysis (in progress)

### Recent Major Changes (2025-07-15):
- **Architecture Transformation**: Migrated from simple form-based to dashboard-centered architecture
- **Data Persistence**: Implemented IndexedDB for local storage with full offline capability
- **Enhanced Type System**: Added comprehensive interfaces for all data types
- **Dashboard Interface**: Created modern dashboard with metrics, activities, and quick actions
- **Profile System**: Multi-profile support with profile selection and management

## Commands

```bash
# Install dependencies
npm install

# Start development server (localhost:5173)
npm run dev

# Run tests with Vitest
npm test

# Run linting
npm run lint

# Create production build
npm run build

# Deploy to GitHub Pages
npm run deploy
```

## Architecture

### Technology Stack
- **Frontend**: React with TypeScript
- **Styling**: Bootstrap 5 with custom CSS
- **State Management**: React Context API with enhanced reducers
- **Build Tool**: Vite
- **Testing**: Vitest & React Testing Library
- **Storage**: IndexedDB for persistent local storage
- **Deployment**: GitHub Pages (static site)

### New Project Structure
```
src/
├── components/
│   ├── Dashboard/          # Main dashboard interface
│   ├── ProfileSelection/   # Profile management
│   ├── ActivityTracking/   # Performance & practice logging
│   ├── GoalManagement/     # Goal setting & tracking
│   ├── MusicianForm/       # Legacy form (kept for compatibility)
│   ├── Recommendation/     # Enhanced recommendation display
│   └── common/            # Shared UI components
├── services/
│   ├── storageService.ts   # IndexedDB operations
│   └── analyticsService.ts # Data analysis and trends
├── context/
│   └── AppContext.tsx      # Enhanced state management
├── core/
│   ├── types.ts           # Comprehensive type definitions
│   ├── recommendationEngine.ts # Enhanced recommendation logic
│   └── constants.ts       # Application constants
├── utils/
│   ├── index.ts          # Utility functions
│   └── profileUtils.ts   # Profile management utilities
└── hooks/                 # Custom React hooks
```

### Key Data Models

#### Enhanced MusicianProfile
```typescript
interface MusicianProfile {
  id: string;
  name: string;
  createdAt: Date;
  lastUpdated: Date;
  
  // Basic musician info
  instrument: string;
  genres: string[];
  yearsOfExperience: number;
  
  // Performance data
  performanceFrequency: 'never' | 'yearly' | 'monthly' | 'weekly' | 'multiple';
  crowdSize: '1-10' | '10-50' | '50-100' | '100-500' | '500+';
  marketingEfforts: string[];
  
  // Tracked activities
  shows: PerformanceRecord[];
  practiceLog: PracticeSession[];
  goals: Goal[];
  achievements: Achievement[];
  preferences: UserPreferences;
}
```

#### Activity Tracking
```typescript
interface PerformanceRecord {
  id: string;
  date: Date;
  venueName: string;
  venueType: 'bar' | 'restaurant' | 'concert_hall' | 'festival' | 'private_event' | 'other';
  audienceSize: number;
  duration: number;
  payment: number;
  notes?: string;
  setlist?: string[];
}

interface PracticeSession {
  id: string;
  date: Date;
  duration: number;
  focusAreas: string[];
  notes?: string;
  skillsWorkedOn: string[];
}
```

#### Goal Management
```typescript
interface Goal {
  id: string;
  title: string;
  description: string;
  type: 'performance' | 'skill' | 'financial' | 'recording' | 'custom';
  targetValue?: number;
  currentValue: number;
  deadline?: Date;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  createdAt: Date;
}
```

## New User Flow

**Enhanced Flow**: Landing → Profile Selection → Dashboard ↔ Activity Entry/Goal Management ↔ Enhanced Recommendations

1. **Landing Page**: Introduction to the enhanced platform
2. **Profile Selection**: Choose existing profile or create new one
3. **Dashboard**: Main interface showing metrics, recent activities, and quick actions
4. **Activity Tracking**: Log performances and practice sessions
5. **Goal Management**: Set, track, and achieve musical goals
6. **Enhanced Recommendations**: AI-powered advice based on historical data

## Data Storage

### IndexedDB Implementation
- **Offline-first**: All data stored locally for complete offline functionality
- **Multi-profile support**: Users can maintain multiple musician profiles
- **Data integrity**: Comprehensive validation and error handling
- **Performance optimized**: Efficient queries and bulk operations

### Storage Schema
```
Database: MusicianGrowthApp
├── profiles (id, name, createdAt, lastUpdated, ...)
├── performances (id, profileId, date, venueName, ...)
├── practice_sessions (id, profileId, date, duration, ...)
├── goals (id, profileId, title, type, status, ...)
└── achievements (id, profileId, title, category, ...)
```

## Implementation Progress

### ✅ Completed Features:
1. **Enhanced Data Models** - Complete type system with all required interfaces
2. **Storage Service** - Full IndexedDB implementation with CRUD operations
3. **Analytics Service** - Performance trend analysis and practice habit tracking
4. **Dashboard Interface** - Modern dashboard with metrics and quick actions
5. **Profile Management** - Multi-profile support with selection and deletion
6. **Utility Functions** - Comprehensive helper functions for data manipulation

### 🚧 In Progress:
1. **Activity Tracking Forms** - Performance and practice session entry
2. **Goal Management System** - Goal creation, editing, and progress tracking
3. **Bulk Entry System** - Efficient backfilling of historical data
4. **Enhanced Recommendations** - Historical data analysis for better advice

### 📋 Remaining Tasks:
1. **Application Routing** - Update App.tsx for new dashboard-centered flow
2. **Testing Suite** - Comprehensive tests for all new functionality
3. **Error Handling** - Robust error boundaries and user feedback
4. **Performance Optimization** - Large dataset handling and UI responsiveness

## Testing Strategy

### Current Testing:
- **Unit Tests**: Storage service, analytics service, utility functions
- **Component Tests**: Dashboard components, profile management
- **Integration Tests**: Full user workflows and data persistence

### Required Testing:
- **End-to-End Tests**: Complete user journeys
- **Performance Tests**: Large dataset handling
- **Error Handling Tests**: Storage failures and recovery

## Important Notes

- **Local Storage Only**: No backend, database, or user authentication required
- **Offline Capability**: Full functionality without internet connection
- **Data Migration**: Automatic handling of legacy data from MVP version
- **Browser Support**: Modern browsers with IndexedDB support
- **Privacy First**: All data remains on user's device

## Development Guidelines

- **Type Safety**: Strict TypeScript compliance with comprehensive interfaces
- **Error Handling**: Graceful degradation and user-friendly error messages
- **Performance**: Efficient data operations and responsive UI
- **Accessibility**: WCAG 2.1 AA compliance for all new components
- **Testing**: Comprehensive test coverage for all critical paths