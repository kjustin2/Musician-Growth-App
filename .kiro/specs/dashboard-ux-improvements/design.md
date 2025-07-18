# Design Document

## Overview

This design addresses critical UX issues in the musician growth app's dashboard interface, focusing on improving achievement display logic, enhancing spacing and layout, fixing broken functionality, and implementing an enhanced goal creation system with automatic progress tracking and multi-band support. The solution maintains the existing React/TypeScript architecture while introducing targeted improvements to specific components.

## Architecture

### Component Structure

The improvements will be implemented across several existing components with minimal architectural changes:

```
src/components/
├── Dashboard/
│   ├── Dashboard.tsx (header spacing fixes)
│   ├── DashboardTabs.tsx (achievement display logic)
│   ├── OverviewTab.tsx (Create Goal button fix, Record Song button)
│   ├── ActionsTab.tsx (layout improvements, remove "Quick Actions" label)
│   ├── AchievementsTab.tsx (ensure only shows on Achievements tab)
│   ├── GoalProgress.tsx (Create Goal button functionality)
│   └── RecordedSongsCard.tsx (Record Song button integration)
├── GoalManagement/
│   ├── GoalForm.tsx (enhanced with metric linking)
│   ├── GoalMetricSelector.tsx (new component)
│   └── BandSelector.tsx (new component)
├── ActivityTracking/
│   └── PerformanceForm.tsx (band selection integration)
└── common/
    ├── AchievementDisplay.tsx (conditional rendering logic)
    └── BandManagement.tsx (new component)
```

### Data Flow Architecture

The design maintains the existing Context API pattern while extending it to support multi-band functionality:

```
AppContext
├── Band Management State
├── Enhanced Goal Linking
├── Automatic Progress Updates
└── Achievement Display Control
```

## Components and Interfaces

### 1. Achievement Display Logic Fix

**Component**: `AchievementDisplay.tsx`, `DashboardTabs.tsx`

**Changes**:
- Add conditional rendering based on current tab
- Remove achievement displays from non-Achievement tabs
- Consolidate achievement logic into single component

```typescript
interface AchievementDisplayProps {
  profileId: string;
  showProgress?: boolean;
  displayContext: 'achievements-tab' | 'hidden'; // New prop
}
```

### 2. Enhanced Actions Tab Layout

**Component**: `ActionsTab.tsx`

**Changes**:
- Improve CSS Grid layout with better spacing
- Remove "Quick Actions" header text
- Implement responsive spacing system
- Add proper padding and margins

```css
.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px; /* Increased from cramped layout */
  padding: 0; /* Remove extra padding */
}

.action-card {
  padding: 24px; /* Consistent internal padding */
  transition: transform 0.2s ease;
}
```

### 3. Header Spacing Improvements

**Component**: `Dashboard.tsx`

**Changes**:
- Add proper spacing between welcome message and profile controls
- Implement responsive spacing system

```css
.dashboard-header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px; /* Add spacing between sections */
}

.dashboard-header-actions {
  display: flex;
  gap: 12px; /* Spacing between buttons */
  align-items: center;
}
```

### 4. Goal Creation Enhancement

**New Component**: `GoalMetricSelector.tsx`

```typescript
interface GoalMetricSelectorProps {
  goalType: 'performance' | 'recording' | 'practice' | 'financial';
  onMetricSelect: (metric: GoalMetric) => void;
  currentMetrics: MetricSummary;
}

interface GoalMetric {
  id: string;
  name: string;
  description: string;
  currentValue: number;
  unit: string;
  autoUpdate: boolean;
}
```

**Updated Component**: `GoalForm.tsx`

```typescript
interface GoalFormData {
  title: string;
  description: string;
  type: GoalType;
  targetValue: number;
  deadline?: Date;
  linkedMetric: string; // Required - defaults to appropriate metric for goal type
  autoUpdate: boolean; // Defaults to true unless custom goal
  bandSpecific?: boolean;
  selectedBands?: string[];
}
```

### 5. Multi-Band Support

**New Component**: `BandSelector.tsx`

```typescript
interface BandSelectorProps {
  bands: Band[];
  selectedBands: string[];
  onBandSelect: (bandIds: string[]) => void;
  allowMultiple?: boolean;
  required?: boolean;
}

interface Band {
  id: string;
  name: string;
  genre: string;
  memberRole: string;
  isActive: boolean;
}
```

**Enhanced Component**: `PerformanceForm.tsx`

```typescript
interface PerformanceFormData {
  // ... existing fields
  bandId?: string; // New field for band selection
  bandMembers?: string[]; // Associated band members
}
```

### 6. Record Song Button Integration

**Component**: `RecordedSongsCard.tsx`

**Changes**:
- Add Record Song button to empty state and header
- Integrate with navigation system
- Maintain consistent styling

```typescript
interface RecordedSongsCardProps {
  recordings: RecordingSession[];
  onRecordingClick?: (recording: RecordingSession) => void;
  onAddRecording: () => void; // Make required
  isLoading?: boolean;
}
```

## Data Models

### Updated Goal Model

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
  // New required fields
  linkedMetric: string; // Required field - defaults based on goal type
  autoUpdate: boolean; // Defaults to true unless custom goal
  bandSpecific: boolean;
  selectedBands: string[];
  progressHistory: GoalProgressEntry[];
  lastAutoUpdate?: Date;
}

interface GoalProgressEntry {
  date: Date;
  value: number;
  triggeredBy?: string;
  bandId?: string; // For band-specific progress
}
```

### Band Management Model

```typescript
interface Band {
  id: string;
  name: string;
  genre: string;
  profileId: string;
  memberRole: string; // User's role in this band
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface BandPerformance extends PerformanceRecord {
  bandId: string;
  bandName: string;
}
```

### Metric Linking System

```typescript
interface MetricDefinition {
  id: string;
  name: string;
  description: string;
  category: 'performance' | 'practice' | 'recording' | 'financial';
  unit: string;
  calculationMethod: (profile: MusicianProfile, bandId?: string) => number;
}

const AVAILABLE_METRICS: MetricDefinition[] = [
  {
    id: 'show_count',
    name: 'Number of Shows',
    description: 'Total performances logged',
    category: 'performance',
    unit: 'shows',
    calculationMethod: (profile, bandId) => 
      profile.shows.filter(show => !bandId || show.bandId === bandId).length
  },
  {
    id: 'total_earnings',
    name: 'Total Earnings',
    description: 'Sum of all performance payments',
    category: 'financial',
    unit: 'dollars',
    calculationMethod: (profile, bandId) =>
      profile.shows
        .filter(show => !bandId || show.bandId === bandId)
        .reduce((sum, show) => sum + show.payment, 0)
  },
  // ... additional metrics
];
```

## Error Handling

### Goal Linking Error Handling

```typescript
class GoalLinkingService {
  async updateLinkedGoals(
    profileId: string, 
    activityType: 'performance' | 'practice' | 'recording',
    activityData: any
  ): Promise<void> {
    try {
      const goals = await storageService.getGoals(profileId);
      const linkedGoals = goals.filter(goal => 
        goal.autoUpdate && 
        this.isGoalLinkedToActivity(goal, activityType)
      );

      for (const goal of linkedGoals) {
        await this.updateGoalProgress(goal, activityData);
      }
    } catch (error) {
      loggingService.error('Goal linking update failed', error);
      // Continue execution - don't block activity creation
    }
  }
}
```

### Band Selection Validation

```typescript
const validateBandSelection = (
  formData: PerformanceFormData,
  availableBands: Band[]
): ValidationResult => {
  if (formData.bandId && !availableBands.find(b => b.id === formData.bandId)) {
    return {
      isValid: false,
      errors: ['Selected band is not available']
    };
  }
  return { isValid: true, errors: [] };
};
```

## Performance Considerations

### Lazy Loading for Achievements

```typescript
const AchievementsTab = React.lazy(() => import('./AchievementsTab'));

// Only load achievement data when tab is active
const DashboardTabs: React.FC<DashboardTabsProps> = ({ profile }) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  
  return (
    <div className="dashboard-tabs">
      {/* ... tab navigation */}
      <Suspense fallback={<div>Loading...</div>}>
        {activeTab === 'achievements' && <AchievementsTab profile={profile} />}
      </Suspense>
    </div>
  );
};
```

### Optimized Goal Updates

```typescript
class GoalUpdateService {
  private updateQueue: GoalUpdate[] = [];
  private isProcessing = false;

  async queueGoalUpdate(update: GoalUpdate): Promise<void> {
    this.updateQueue.push(update);
    if (!this.isProcessing) {
      await this.processQueue();
    }
  }

  private async processQueue(): Promise<void> {
    this.isProcessing = true;
    while (this.updateQueue.length > 0) {
      const update = this.updateQueue.shift()!;
      await this.processGoalUpdate(update);
    }
    this.isProcessing = false;
  }
}
```

## Accessibility Considerations

### Keyboard Navigation

- All action cards must be keyboard accessible
- Tab order should be logical and intuitive
- Focus indicators must be visible and clear

### Screen Reader Support

```typescript
// Enhanced action cards with proper ARIA labels
<div
  className="action-card"
  role="button"
  tabIndex={0}
  aria-label={`${action.title}: ${action.description}`}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      action.onClick();
    }
  }}
>
```

### Color and Contrast

- Maintain WCAG 2.1 AA compliance for all new UI elements
- Ensure sufficient contrast for goal progress indicators
- Use semantic colors for goal status (success, warning, danger)

## Migration Strategy

**Important**: All phases must maintain passing linting and build status. TypeScript compilation must succeed without errors, and ESLint checks must pass.

### Phase 1: Layout and Spacing Fixes
- Update CSS for Actions tab spacing
- Fix header spacing issues
- Remove "Quick Actions" label
- Ensure all changes pass linting and build

### Phase 2: Achievement Display Logic
- Implement conditional achievement rendering
- Update tab components to control achievement display
- Test achievement isolation to Achievements tab
- Verify TypeScript types and linting compliance

### Phase 3: Goal Enhancement
- Create GoalMetricSelector component
- Update GoalForm with metric linking
- Implement automatic goal updates
- Update type definitions and ensure build passes

### Phase 4: Multi-Band Support
- Create Band management components
- Update performance forms with band selection
- Implement band-specific analytics
- Maintain full TypeScript compliance and linting standards