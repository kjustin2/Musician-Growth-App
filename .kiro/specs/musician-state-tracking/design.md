# Design Document

## Overview

This design transforms the existing musician recommendation app from a simple form-based system into a comprehensive musician growth tracking platform. The system will maintain the current React/TypeScript architecture while adding persistent local storage, activity tracking, goal management, and evolving recommendations. The design leverages the existing component structure and recommendation engine while extending them to support stateful, long-term musician profiles.

## Architecture

### High-Level Architecture

The application will maintain its current single-page application (SPA) architecture with React and TypeScript, but will be enhanced with:

- **Persistent Storage Layer**: Browser-based local storage using IndexedDB for complex data structures
- **Enhanced State Management**: Extended React Context with persistent state synchronization
- **Activity Tracking System**: New data models and services for tracking shows, practice sessions, and goals
- **Evolved Recommendation Engine**: Enhanced engine that considers historical data and progress trends
- **Dashboard Interface**: New primary interface replacing the simple form-to-results flow

### Current vs. New Architecture

**Current Flow**: Landing → Form → Results  
**New Flow**: Landing → Profile Selection → Dashboard ↔ Activity Entry/Goal Management ↔ Updated Recommendations

## Components and Interfaces

### Core Data Models

```typescript
// Enhanced musician profile with persistent tracking
interface MusicianProfile {
  id: string;
  name: string;
  createdAt: Date;
  lastUpdated: Date;
  
  // Basic info (existing)
  instrument: string;
  genres: string[];
  yearsOfExperience: number;
  
  // New persistent data
  shows: PerformanceRecord[];
  practiceLog: PracticeSession[];
  goals: Goal[];
  achievements: Achievement[];
  preferences: UserPreferences;
}

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

interface PracticeSession {
  id: string;
  date: Date;
  duration: number; // minutes
  focusAreas: string[];
  notes?: string;
  skillsWorkedOn: string[];
}

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

interface Achievement {
  id: string;
  title: string;
  description: string;
  unlockedAt: Date;
  category: 'performance' | 'practice' | 'goal' | 'milestone';
}
```

### Storage Layer

```typescript
interface StorageService {
  // Profile management
  saveProfile(profile: MusicianProfile): Promise<void>;
  loadProfile(profileId: string): Promise<MusicianProfile | null>;
  getAllProfiles(): Promise<MusicianProfile[]>;
  deleteProfile(profileId: string): Promise<void>;
  
  // Activity tracking
  addPerformance(profileId: string, performance: PerformanceRecord): Promise<void>;
  addPracticeSession(profileId: string, session: PracticeSession): Promise<void>;
  bulkAddActivities(profileId: string, activities: (PerformanceRecord | PracticeSession)[]): Promise<void>;
  
  // Goal management
  saveGoal(profileId: string, goal: Goal): Promise<void>;
  updateGoalProgress(profileId: string, goalId: string, progress: number): Promise<void>;
}
```

### Enhanced Recommendation Engine

```typescript
interface EnhancedRecommendationEngine {
  generateRecommendations(profile: MusicianProfile): Recommendation[];
  
  // New methods for stateful recommendations
  getProgressBasedRecommendations(profile: MusicianProfile): Recommendation[];
  getPracticeRecommendations(profile: MusicianProfile): Recommendation[];
  getGoalBasedRecommendations(profile: MusicianProfile): Recommendation[];
  
  // Analytics for recommendations
  analyzePerformanceTrends(shows: PerformanceRecord[]): PerformanceTrends;
  analyzePracticeHabits(sessions: PracticeSession[]): PracticeAnalysis;
}

interface PerformanceTrends {
  averageAudienceSize: number;
  totalEarnings: number;
  showFrequency: 'increasing' | 'decreasing' | 'stable';
  venueProgression: 'improving' | 'declining' | 'stable';
}

interface PracticeAnalysis {
  weeklyAverage: number;
  consistency: 'excellent' | 'good' | 'needs_improvement';
  recommendedAdjustment: 'increase' | 'decrease' | 'maintain';
  suggestProfessionalLessons: boolean;
}
```

### New UI Components

```typescript
// Main dashboard component
interface DashboardProps {
  profile: MusicianProfile;
  onAddActivity: () => void;
  onViewGoals: () => void;
  onViewRecommendations: () => void;
}

// Activity entry components
interface ActivityEntryProps {
  type: 'performance' | 'practice';
  onSave: (activity: PerformanceRecord | PracticeSession) => void;
  onCancel: () => void;
}

interface BulkEntryProps {
  activityType: 'performance' | 'practice';
  onSave: (activities: (PerformanceRecord | PracticeSession)[]) => void;
  onCancel: () => void;
}

// Goal management components
interface GoalManagerProps {
  goals: Goal[];
  onCreateGoal: (goal: Omit<Goal, 'id' | 'createdAt'>) => void;
  onUpdateGoal: (goalId: string, updates: Partial<Goal>) => void;
  onDeleteGoal: (goalId: string) => void;
}
```

## Data Models

### Local Storage Schema

The application will use IndexedDB with the following object stores:

1. **profiles**: Stores MusicianProfile objects
2. **performances**: Stores PerformanceRecord objects with profileId index
3. **practice_sessions**: Stores PracticeSession objects with profileId index
4. **goals**: Stores Goal objects with profileId index
5. **achievements**: Stores Achievement objects with profileId index

### Data Relationships

- One MusicianProfile can have many PerformanceRecords, PracticeSessions, Goals, and Achievements
- Goals can be automatically updated based on PerformanceRecords and PracticeSessions
- Achievements are triggered by reaching milestones in any category

## Error Handling

### Storage Error Handling

```typescript
interface StorageError extends Error {
  type: 'quota_exceeded' | 'data_corruption' | 'browser_unsupported' | 'unknown';
  recoverable: boolean;
}

// Error recovery strategies
class StorageErrorHandler {
  handleQuotaExceeded(): void; // Suggest data cleanup or export
  handleDataCorruption(): void; // Attempt recovery or reset
  handleBrowserUnsupported(): void; // Fallback to localStorage with limitations
}
```

### User Experience Error Handling

- **Graceful Degradation**: If IndexedDB is unavailable, fall back to localStorage with reduced functionality
- **Data Validation**: Validate all user inputs before storage with clear error messages
- **Offline Resilience**: All functionality works without internet connectivity
- **Recovery Options**: Provide clear paths to recover from data loss scenarios

## Testing Strategy

### Unit Testing

- **Storage Service**: Test all CRUD operations with mock IndexedDB
- **Recommendation Engine**: Test enhanced logic with various profile states
- **Data Models**: Test validation and transformation logic
- **Utility Functions**: Test date calculations, statistics, and data analysis

### Integration Testing

- **Profile Lifecycle**: Test complete profile creation, update, and deletion flows
- **Activity Tracking**: Test adding activities and their impact on recommendations
- **Goal Management**: Test goal creation, progress tracking, and completion
- **Bulk Entry**: Test bulk data entry with validation and error handling

### Component Testing

- **Dashboard**: Test rendering with various profile states and data
- **Activity Forms**: Test form validation and submission
- **Goal Components**: Test goal creation, editing, and progress display
- **Recommendation Updates**: Test recommendation changes based on new data

### End-to-End Testing

- **New User Flow**: Complete profile creation and first activity entry
- **Returning User Flow**: Profile loading and dashboard interaction
- **Data Persistence**: Verify data survives browser refresh and restart
- **Bulk Entry Workflow**: Test backfilling multiple activities efficiently

### Performance Testing

- **Large Dataset Handling**: Test with profiles containing hundreds of activities
- **Storage Performance**: Measure IndexedDB operation times
- **Recommendation Generation**: Test performance with complex profile histories
- **UI Responsiveness**: Ensure smooth interactions with large datasets

## Migration Strategy

### Existing User Transition

Since the current app doesn't store user data, the migration will focus on:

1. **Onboarding Flow**: Guide existing users through profile creation
2. **Data Import**: Allow users to bulk-enter historical data if desired
3. **Feature Introduction**: Progressive disclosure of new features
4. **Backward Compatibility**: Maintain the simple form flow as an option for quick recommendations

### Deployment Considerations

- **Local Storage Migration**: Handle browser storage upgrades gracefully
- **Feature Flags**: Allow gradual rollout of complex features
- **Performance Monitoring**: Track storage usage and performance metrics
- **User Feedback**: Collect feedback on new workflow complexity vs. value