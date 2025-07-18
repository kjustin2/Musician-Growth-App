# Data Models and Type System

This document provides comprehensive documentation for the Musician Growth App's data models and TypeScript type system.

## Core Data Models

### MusicianProfile

The central data structure representing a musician's complete profile and activity history.

```typescript
interface MusicianProfile {
  id: string;
  name: string;
  createdAt: Date;
  lastUpdated: Date;
  
  // Basic Profile Information
  instrument: string;
  performanceFrequency: 'never' | 'yearly' | 'monthly' | 'weekly' | 'multiple';
  crowdSize: '1-10' | '10-50' | '50-100' | '100-500' | '500+';
  yearsOfExperience: number;
  marketingEfforts: string[];
  
  // Activity Data
  genres: string[];
  shows: PerformanceRecord[];
  practiceLog: PracticeSession[];
  goals: Goal[];
  achievements: Achievement[];
  preferences: UserPreferences;
}
```

**Key Features:**
- Unique identifier for each profile
- Timestamps for creation and updates
- Comprehensive activity tracking
- User preferences and settings
- Achievement system integration

### PerformanceRecord

Detailed tracking of live performances and shows.

```typescript
interface PerformanceRecord {
  id: string;
  date: Date;
  venueName: string;
  venueType: 'bar' | 'restaurant' | 'concert_hall' | 'festival' | 'private_event' | 'other';
  audienceSize: number;
  duration: number; // minutes
  payment: number;
  notes?: string;
  setlist?: string[];
}
```

**Analytics Capabilities:**
- Performance frequency tracking
- Venue progression analysis
- Earnings calculations
- Audience growth metrics

### PracticeSession

Structured practice session logging for skill development tracking.

```typescript
interface PracticeSession {
  id: string;
  date: Date;
  duration: number; // minutes
  focusAreas: string[];
  notes?: string;
  skillsWorkedOn: string[];
}
```

**Features:**
- Time-based practice tracking
- Skill-focused practice organization
- Progress notes and observations
- Consistency analysis support

### Goal

Comprehensive goal management system with progress tracking.

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

**Goal Types:**
- **Performance**: Show-related goals (number of performances, venue types)
- **Skill**: Practice and technique goals
- **Financial**: Earnings and income targets
- **Recording**: Studio work and release goals
- **Custom**: User-defined objectives

## Achievement System

### Achievement

Individual achievement definitions with progress tracking.

```typescript
interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'performance' | 'practice' | 'goal' | 'milestone';
  type: 'bronze' | 'silver' | 'gold' | 'platinum';
  icon: string;
  unlockedAt?: Date;
  progress?: number;
  requirement: number;
  isUnlocked: boolean;
}
```

**Achievement Categories:**
- **Performance**: Show and venue-based achievements
- **Practice**: Time and consistency-based achievements
- **Goal**: Goal completion achievements
- **Milestone**: Special milestone achievements

### Notification System

```typescript
interface Notification {
  id: string;
  type: 'achievement' | 'goal_completed' | 'milestone' | 'reminder';
  title: string;
  message: string;
  achievementId?: string;
  createdAt: Date;
  isRead: boolean;
  icon?: string;
}
```

## Analytics and Insights

### PerformanceTrends

Automated analysis of performance data trends.

```typescript
interface PerformanceTrends {
  averageAudienceSize: number;
  totalEarnings: number;
  showFrequency: 'increasing' | 'decreasing' | 'stable';
  venueProgression: 'improving' | 'declining' | 'stable';
}
```

### PracticeAnalysis

Practice session analysis and recommendations.

```typescript
interface PracticeAnalysis {
  weeklyAverage: number;
  consistency: 'excellent' | 'good' | 'needs_improvement';
  recommendedAdjustment: 'increase' | 'decrease' | 'maintain';
  suggestProfessionalLessons: boolean;
}
```

## User Preferences

### UserPreferences

Comprehensive user settings and preferences.

```typescript
interface UserPreferences {
  practiceReminders: boolean;
  goalDeadlineAlerts: boolean;
  performanceMetrics: boolean;
  notifications: boolean;
  dataSharing: boolean;
  themes: 'light' | 'dark';
  language: string;
  defaultVenueType: PerformanceRecord['venueType'];
}
```

## State Management

### AppState

Global application state structure with navigation context tracking.

```typescript
interface AppState {
  currentPage: PageState;
  musicianProfile: MusicianProfile | null;
  availableProfiles: MusicianProfile[];
  recommendations: Recommendation[];
  isLoading: boolean;
  error: string | null;
  navigationContext: 'onboarding' | 'dashboard' | null;
}
```

**Navigation Context Features:**
- **Onboarding Flow**: Tracks users coming from initial profile creation or quick recommendations
- **Dashboard Flow**: Tracks users navigating from the main dashboard
- **Contextual UI**: Enables different navigation options based on user journey
- **State Persistence**: Maintains context throughout the recommendation viewing experience

### AppAction

Redux-style action types for state management.

```typescript
type AppAction =
  | { type: 'SET_PAGE'; payload: PageState }
  | { type: 'SET_PROFILE'; payload: MusicianProfile }
  | { type: 'SET_AVAILABLE_PROFILES'; payload: MusicianProfile[] }
  | { type: 'SET_RECOMMENDATIONS'; payload: Recommendation[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_NAVIGATION_CONTEXT'; payload: 'onboarding' | 'dashboard' | null }
  | { type: 'ADD_PERFORMANCE'; payload: PerformanceRecord }
  | { type: 'ADD_PRACTICE_SESSION'; payload: PracticeSession }
  | { type: 'ADD_GOAL'; payload: Goal }
  | { type: 'UPDATE_GOAL'; payload: { id: string; updates: Partial<Goal> } }
  | { type: 'ADD_ACHIEVEMENT'; payload: Achievement }
  | { type: 'RESET' };
```

## Error Handling

### StorageError

Specialized error handling for IndexedDB operations.

```typescript
interface StorageError extends Error {
  type: 'quota_exceeded' | 'data_corruption' | 'browser_unsupported' | 'unknown';
  recoverable: boolean;
}
```

**Error Types:**
- **quota_exceeded**: Storage quota limitations
- **data_corruption**: Data integrity issues
- **browser_unsupported**: IndexedDB not available
- **unknown**: Unexpected storage errors

## Recommendation System

### Recommendation

AI-driven recommendations for musician growth.

```typescript
interface Recommendation {
  id: string;
  title: string;
  description: string;
  category: 'marketing' | 'performance' | 'networking' | 'skill';
  priority: 'high' | 'medium' | 'low';
}
```

**Recommendation Categories:**
- **Marketing**: Social media, promotion strategies
- **Performance**: Venue suggestions, booking advice
- **Networking**: Industry connections, collaboration opportunities
- **Skill**: Practice recommendations, learning resources

## Data Persistence

The application uses IndexedDB for local data persistence with the following characteristics:

- **No Backend Required**: All data stored locally
- **Offline Capability**: Full functionality without internet
- **Data Integrity**: Comprehensive validation and error handling
- **Performance Optimized**: Efficient queries and indexing
- **Privacy Focused**: Data never leaves the user's device

## Accessibility System

### ColorContrastResult

Result interface for WCAG 2.1 color contrast validation.

```typescript
interface ColorContrastResult {
  ratio: number;
  level: 'AA' | 'AAA' | 'fail';
  isValid: boolean;
}
```

**Features:**
- WCAG 2.1 compliant contrast ratio calculation
- Automatic compliance level determination (AA/AAA/fail)
- Boolean validation for quick checks
- Precise ratio calculations with proper gamma correction

### AccessibilityValidationResult

Comprehensive accessibility validation result structure.

```typescript
interface AccessibilityValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}
```

**Validation Categories:**
- **Errors**: Critical accessibility issues that must be fixed
- **Warnings**: Recommendations for improved accessibility
- **Overall Status**: Boolean indicating if element passes validation

### Accessibility Testing Functions

The application includes comprehensive accessibility validation utilities:

- **calculateContrastRatio()**: WCAG 2.1 color contrast validation
- **validateElementAccessibility()**: DOM element accessibility checking
- **validateKeyboardNavigation()**: Keyboard accessibility validation
- **validateResponsiveAccessibility()**: Mobile and responsive accessibility
- **validateTabAccessibility()**: Tab interface accessibility validation
- **validateAccessibility()**: Comprehensive validation combining all checks

### WCAG-Compliant Color System

Pre-validated color palette ensuring WCAG 2.1 AA compliance:

```typescript
const ACCESSIBILITY_COLORS = {
  PRIMARY_BLUE: '#0056b3',        // 4.78:1 contrast ratio
  PRIMARY_BLUE_DARK: '#004085',   // 6.26:1 contrast ratio
  TEXT_PRIMARY: '#212529',        // 16.07:1 contrast ratio
  TEXT_SECONDARY: '#495057',      // 9.71:1 contrast ratio
  SUCCESS_GREEN: '#155724',       // WCAG AA compliant
  WARNING_YELLOW: '#856404',      // WCAG AA compliant
  DANGER_RED: '#721c24',          // WCAG AA compliant
  INFO_BLUE: '#0c5460',          // WCAG AA compliant
} as const;
```

## Type Safety Features

- **Strict TypeScript**: All interfaces strictly typed
- **Null Safety**: Proper handling of optional fields
- **Union Types**: Precise enumeration of allowed values
- **Generic Types**: Reusable type patterns
- **Type Guards**: Runtime type validation
- **Accessibility Types**: Comprehensive accessibility validation interfaces

## Migration and Versioning

The type system is designed to support future migrations:

- **Backward Compatibility**: New fields are optional
- **Version Tracking**: Profile versioning for migrations
- **Data Validation**: Runtime validation of stored data
- **Graceful Degradation**: Fallbacks for missing data

This comprehensive type system ensures data integrity, type safety, and provides a solid foundation for the application's growth and evolution.