# Design Document

## Overview

ChordLine MVP is a comprehensive musician progress tracking application built using Svelte frontend with TypeScript and Dexie.js for local data storage. The application follows a modular architecture with clear separation between frontend presentation, business logic, and data persistence layers. The design leverages the existing codebase's patterns including BaseEntity architecture, field-based schema definitions, and reactive stores.

The application supports both solo musicians and band members with multi-context data management, allowing users to switch between different bands while maintaining separate data contexts for each musical endeavor.

## Architecture

### High-Level Architecture

```mermaid
graph TB
    subgraph "Frontend Layer"
        UI[Svelte Components]
        Logic[Business Logic]
        Stores[Reactive Stores]
    end

    subgraph "Data Layer"
        Entities[Entity Classes]
        Schema[Schema Definitions]
        DB[Dexie Database]
    end

    subgraph "Core Services"
        Auth[Authentication Service]
        Context[Band Context Service]
        Progress[Progress Tracking Service]
        Achievement[Achievement Service]
    end

    UI --> Logic
    Logic --> Stores
    Logic --> Core Services
    Stores --> Entities
    Entities --> Schema
    Schema --> DB
    Core Services --> Entities
```

### Technology Stack

- **Frontend**: Svelte 4 with TypeScript
- **Database**: Dexie.js (IndexedDB wrapper)
- **Build Tool**: Vite
- **Styling**: CSS with component-scoped styles
- **State Management**: Svelte stores with reactive patterns
- **Validation**: Custom validation system (existing)

### Data Flow Pattern

1. **User Interaction** → Svelte Components
2. **Component Events** → Business Logic Functions
3. **Logic Processing** → Entity Operations
4. **Data Persistence** → Dexie Database
5. **State Updates** → Reactive Stores
6. **UI Updates** → Component Re-rendering

## Components and Interfaces

### Core Entity Models

#### User Entity

```typescript
export const UserFields = BaseSchema.createFieldDefinitions({
  email: {
    type: 'string',
    indexed: true,
    required: true,
    validate: validators.email('Email'),
  },
  passwordHash: {
    type: 'string',
    required: true,
    validate: validators.nonEmptyString('Password Hash'),
  },
  primaryInstrument: {
    type: 'string',
    required: true,
    validate: validators.nonEmptyString('Primary Instrument'),
  },
  playFrequency: {
    type: 'string',
    required: true,
    validate: validators.nonEmptyString('Play Frequency'),
  },
  genreIds: {
    type: 'number[]',
    required: true,
    validate: validators.array('Genre IDs'),
  },
  onboardingCompleted: {
    type: 'boolean',
    required: true,
    validate: validators.boolean('Onboarding Completed'),
  },
  currentBandId: {
    type: 'number',
    indexed: true,
    required: false,
    validate: validators.number('Current Band ID'),
  },
} as const);
```

#### Band Entity

```typescript
export const BandFields = BaseSchema.createFieldDefinitions({
  name: {
    type: 'string',
    indexed: true,
    required: true,
    validate: validators.nonEmptyString('Band Name'),
  },
  description: {
    type: 'string',
    required: false,
    validate: validators.string('Description'),
  },
  genreIds: {
    type: 'number[]',
    required: true,
    validate: validators.array('Genre IDs'),
  },
} as const);
```

#### Genre Entity

```typescript
export const GenreFields = BaseSchema.createFieldDefinitions({
  name: {
    type: 'string',
    indexed: true,
    required: true,
    validate: validators.nonEmptyString('Genre Name'),
  },
} as const);
```

#### RecordingStudio Entity

```typescript
export const RecordingStudioFields = BaseSchema.createFieldDefinitions({
  name: {
    type: 'string',
    indexed: true,
    required: true,
    validate: validators.nonEmptyString('Studio Name'),
  },
} as const);
```

#### BandMember Entity

```typescript
export const BandMemberFields = BaseSchema.createFieldDefinitions({
  bandId: {
    type: 'number',
    indexed: true,
    required: true,
    validate: validators.number('Band ID'),
  },
  userId: {
    type: 'number',
    indexed: true,
    required: true,
    validate: validators.number('User ID'),
  },
  instrument: {
    type: 'string',
    required: true,
    validate: validators.oneOf('Instrument', [
      'lead_vocals',
      'backing_vocals',
      'lead_guitar',
      'rhythm_guitar',
      'bass',
      'drums',
      'keyboards',
      'other',
    ]),
  },
} as const);
```

#### Song Entity

```typescript
export const SongFields = BaseSchema.createFieldDefinitions({
  title: {
    type: 'string',
    indexed: true,
    required: true,
    validate: validators.nonEmptyString('Title'),
  },
  status: {
    type: 'string',
    indexed: true,
    required: true,
    validate: validators.oneOf('Status', ['in_progress', 'performed', 'professionally_recorded']),
  },
  genreId: {
    type: 'number',
    indexed: true,
    required: true,
    validate: validators.number('Genre ID'),
  },
  bandId: {
    type: 'number',
    indexed: true,
    required: false,
    validate: validators.number('Band ID'),
  },
  recordingStudioId: {
    type: 'number',
    indexed: true,
    required: false,
    validate: validators.number('Recording Studio ID'),
  },
} as const);
```

#### SetList Entity

```typescript
export const SetListFields = BaseSchema.createFieldDefinitions({
  name: {
    type: 'string',
    indexed: true,
    required: true,
    validate: validators.nonEmptyString('Name'),
  },
  bandId: {
    type: 'number',
    indexed: true,
    required: false,
    validate: validators.number('Band ID'),
  },
  songIds: {
    type: 'number[]',
    required: true,
    validate: validators.array('Song IDs'),
  },
} as const);
```

#### Venue Entity

```typescript
export const VenueFields = BaseSchema.createFieldDefinitions({
  name: {
    type: 'string',
    indexed: true,
    required: true,
    validate: validators.nonEmptyString('Name'),
  },
  address: {
    type: 'string',
    required: false,
    validate: validators.string('Address'),
  },
} as const);
```

#### Gig Entity

```typescript
export const GigFields = BaseSchema.createFieldDefinitions({
  bandId: {
    type: 'number',
    indexed: true,
    required: false,
    validate: validators.number('Band ID'),
  },
  venueId: {
    type: 'number',
    indexed: true,
    required: true,
    validate: validators.number('Venue ID'),
  },
  setListId: {
    type: 'number',
    indexed: true,
    required: false,
    validate: validators.number('Set List ID'),
  },
  date: {
    type: 'Date',
    indexed: true,
    required: true,
    validate: validators.date('Date'),
  },
  durationHours: {
    type: 'number',
    required: true,
    validate: validators.positiveNumber('Duration Hours'),
  },
  payout: {
    type: 'number',
    required: false,
    validate: validators.number('Payout'),
  },
  notes: {
    type: 'string',
    required: false,
    validate: validators.string('Notes'),
  },
} as const);
```

#### Practice Entity

```typescript
export const PracticeFields = BaseSchema.createFieldDefinitions({
  bandId: {
    type: 'number',
    indexed: true,
    required: false,
    validate: validators.number('Band ID'),
  },
  date: {
    type: 'Date',
    indexed: true,
    required: true,
    validate: validators.date('Date'),
  },
  durationMinutes: {
    type: 'number',
    required: true,
    validate: validators.positiveNumber('Duration Minutes'),
  },
  notes: {
    type: 'string',
    required: false,
    validate: validators.string('Notes'),
  },
  setListId: {
    type: 'number',
    indexed: true,
    required: false,
    validate: validators.number('Set List ID'),
  },
  songIds: {
    type: 'number[]',
    required: false,
    validate: validators.array('Song IDs'),
  },
} as const);
```

#### Goal Entity

```typescript
export const GoalFields = BaseSchema.createFieldDefinitions({
  title: {
    type: 'string',
    indexed: true,
    required: true,
    validate: validators.nonEmptyString('Title'),
  },
  description: {
    type: 'string',
    required: false,
    validate: validators.string('Description'),
  },
  targetValue: {
    type: 'number',
    required: true,
    validate: validators.positiveNumber('Target Value'),
  },
  currentValue: {
    type: 'number',
    required: true,
    validate: validators.number('Current Value'),
  },
  metricType: {
    type: 'string',
    indexed: true,
    required: true,
    validate: validators.oneOf('Metric Type', [
      'gigs',
      'practice_hours',
      'songs',
      'recordings',
      'set_lists',
    ]),
  },
  bandId: {
    type: 'number',
    indexed: true,
    required: false,
    validate: validators.number('Band ID'),
  },
  completed: {
    type: 'boolean',
    required: true,
    validate: validators.boolean('Completed'),
  },
  targetDate: {
    type: 'Date',
    required: false,
    validate: validators.date('Target Date'),
  },
} as const);
```

#### Achievement Entity

```typescript
export const AchievementFields = BaseSchema.createFieldDefinitions({
  type: {
    type: 'string',
    indexed: true,
    required: true,
    validate: validators.oneOf('Type', [
      'first_gig',
      'gigs_10',
      'gigs_50',
      'gigs_100',
      'practice_sessions_10',
      'practice_sessions_50',
      'practice_sessions_100',
      'practice_hours_10',
      'practice_hours_50',
      'practice_hours_100',
      'first_set_list',
      'set_lists_5',
      'set_lists_10',
      'venues_5',
      'venues_10',
      'venues_25',
      'songs_recorded_1',
      'songs_recorded_5',
      'songs_recorded_10',
      'songs_performed_10',
      'songs_performed_50',
      'songs_performed_100',
      'earnings_100',
      'earnings_1000',
      'earnings_5000',
      'first_band_created',
      'bands_joined_3',
      'goals_completed_5',
      'goals_completed_10',
    ]),
  },
  title: {
    type: 'string',
    required: true,
    validate: validators.nonEmptyString('Title'),
  },
  description: {
    type: 'string',
    required: true,
    validate: validators.nonEmptyString('Description'),
  },
  bandId: {
    type: 'number',
    indexed: true,
    required: false,
    validate: validators.number('Band ID'),
  },
  unlockedAt: {
    type: 'Date',
    indexed: true,
    required: true,
    validate: validators.date('Unlocked At'),
  },
} as const);
```

### Core Services

#### Authentication Service

```typescript
interface AuthService {
  register(email: string, password: string): Promise<User>;
  login(email: string, password: string): Promise<User>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
  hashPassword(password: string): Promise<string>;
  verifyPassword(password: string, hash: string): Promise<boolean>;
}
```

#### Band Context Service

```typescript
interface BandContextService {
  getCurrentContext(): Promise<BandContext>;
  switchToBand(bandId: number): Promise<void>;
  switchToSolo(): Promise<void>;
  getUserBands(userId: number): Promise<Band[]>;
  createBand(bandData: EntityCreationData<Band>): Promise<Band>;
  joinBand(bandId: number, role: string, instrument: string): Promise<void>;
}

interface BandContext {
  type: 'band' | 'solo';
  bandId?: number;
  band?: Band;
  userRole?: string;
  userInstrument?: string;
}
```

#### Progress Tracking Service

```typescript
interface ProgressTrackingService {
  getProgressMetrics(bandId?: number): Promise<ProgressMetrics>;
  updateGoalProgress(goalId: number): Promise<void>;
  checkAchievements(bandId?: number): Promise<Achievement[]>;
  calculateEarnings(bandId?: number, dateRange?: DateRange): Promise<number>;
  getPracticeHours(bandId?: number, dateRange?: DateRange): Promise<number>;
}

interface ProgressMetrics {
  totalGigs: number;
  totalEarnings: number;
  totalPracticeHours: number;
  totalSongs: number;
  recordedSongs: number;
  uniqueVenues: number;
  activeGoals: number;
  completedGoals: number;
}
```

### Frontend Component Architecture

#### Page Components

- `LoginPage.svelte` - Authentication interface
- `OnboardingPage.svelte` - User setup flow
- `Dashboard.svelte` - Main dashboard with quick actions
- `SongsPage.svelte` - Song library management
- `SetListsPage.svelte` - Set list creation and management
- `GigsPage.svelte` - Gig logging and history
- `PracticePage.svelte` - Practice session tracking
- `GoalsPage.svelte` - Goal setting and progress
- `AchievementsPage.svelte` - Achievement display
- `SettingsPage.svelte` - User preferences

#### Shared Components

- `BandSwitcher.svelte` - Context switching interface
- `QuickAddButton.svelte` - Dashboard action buttons
- `ProgressChart.svelte` - Visual progress display
- `GoalProgressBar.svelte` - Individual goal progress
- `AchievementBadge.svelte` - Achievement display
- `VenueAutocomplete.svelte` - Venue search and selection
- `SongSelector.svelte` - Song selection interface
- `DatePicker.svelte` - Date input component
- `Modal.svelte` - Reusable modal container

## Data Models

### Database Schema Design

The database will extend the existing Dexie setup with additional tables:

```typescript
export class ChordLineDatabase extends Dexie {
  users!: Table<User>;
  bands!: Table<Band>;
  bandMembers!: Table<BandMember>;
  genres!: Table<Genre>;
  recordingStudios!: Table<RecordingStudio>;
  songs!: Table<Song>;
  setLists!: Table<SetList>;
  venues!: Table<Venue>;
  gigs!: Table<Gig>;
  practices!: Table<Practice>;
  goals!: Table<Goal>;
  achievements!: Table<Achievement>;

  constructor() {
    super('ChordLineDatabase');

    this.version(1).stores({
      users: validator.generateDexieSchema(UserFields),
      bands: validator.generateDexieSchema(BandFields),
      bandMembers: validator.generateDexieSchema(BandMemberFields),
      genres: validator.generateDexieSchema(GenreFields),
      recordingStudios: validator.generateDexieSchema(RecordingStudioFields),
      songs: validator.generateDexieSchema(SongFields),
      setLists: validator.generateDexieSchema(SetListFields),
      venues: validator.generateDexieSchema(VenueFields),
      gigs: validator.generateDexieSchema(GigFields),
      practices: validator.generateDexieSchema(PracticeFields),
      goals: validator.generateDexieSchema(GoalFields),
      achievements: validator.generateDexieSchema(AchievementFields),
    });
  }
}
```

### Relationships and Constraints

- **User ↔ Band**: Many-to-many through BandMember (BandMember stores who is in each band)
- **Band ↔ Genre**: Many-to-many through genreIds array
- **Song ↔ Genre**: Many-to-one through genreId
- **Song ↔ RecordingStudio**: Many-to-one through recordingStudioId (optional)
- **Band ↔ Song**: One-to-many (songs belong to bands or solo when bandId is null)
- **Band ↔ SetList**: One-to-many
- **SetList ↔ Song**: Many-to-many through songIds array (auto-generated IDs)
- **Gig ↔ Venue**: Many-to-one
- **Gig ↔ SetList**: Many-to-one (optional)
- **Practice ↔ SetList**: Many-to-one (optional)
- **Practice ↔ Song**: Many-to-many through songIds array
- **Goal ↔ Band**: Many-to-one (optional for solo goals)
- **Achievement ↔ Band**: Many-to-one (optional for solo achievements)

### Data Initialization

The application will auto-populate reference data on first run:

#### Default Genres

```typescript
const DEFAULT_GENRES = [
  'Rock',
  'Pop',
  'Jazz',
  'Blues',
  'Country',
  'Folk',
  'Classical',
  'Electronic',
  'Hip Hop',
  'R&B',
  'Reggae',
  'Punk',
  'Metal',
  'Alternative',
  'Indie',
  'Funk',
  'Soul',
  'Gospel',
  'Latin',
  'World Music',
  'Experimental',
  'Ambient',
  'Singer-Songwriter',
];

class DataInitializationService {
  async initializeDefaultData(): Promise<void> {
    // Check if genres exist, if not populate with defaults
    const existingGenres = await genreEntity.getAll();
    if (existingGenres.length === 0) {
      for (const genreName of DEFAULT_GENRES) {
        await genreEntity.create({
          name: genreName,
        });
      }
    }
  }
}
```

### Backend Services Architecture

The backend services are pure TypeScript classes that handle business logic and data operations, separate from frontend presentation:

#### Service Layer Structure

```typescript
// Backend services - no Svelte dependencies
class AuthenticationService {
  // Pure business logic for authentication
}

class BandContextService {
  // Band switching and context management
}

class ProgressTrackingService {
  // Progress calculations and metrics
}

// Frontend logic - bridges services to Svelte components
class AuthLogic {
  // Wraps AuthenticationService for Svelte stores
}

class DashboardLogic {
  // Combines multiple services for dashboard data
}
```

## Error Handling

### Error Categories

1. **Validation Errors**: Field validation failures
2. **Authentication Errors**: Login/registration failures
3. **Database Errors**: Storage operation failures
4. **Business Logic Errors**: Rule violations
5. **Network Errors**: Future API integration errors

### Error Handling Strategy

```typescript
interface AppError {
  type: 'validation' | 'auth' | 'database' | 'business' | 'network';
  message: string;
  field?: string;
  code?: string;
}

class ErrorHandler {
  static handle(error: unknown, context: string): AppError {
    // Convert unknown errors to structured AppError
    // Log errors using existing logger
    // Return user-friendly error messages
  }
}
```

### User Feedback

- **Toast Notifications**: Success/error messages
- **Form Validation**: Real-time field validation
- **Loading States**: Operation progress indicators
- **Error Boundaries**: Graceful error recovery

## Logging Strategy

### Utilizing Existing Logger

The application will leverage the existing logger system (`src/backend/logger.ts`) for comprehensive logging throughout the application:

```typescript
import { debugLog, infoLog, errorLog, warnLog } from '../backend/logger.js';

// Service operations
class AuthenticationService {
  async login(email: string, password: string): Promise<User> {
    debugLog('AuthService', 'Login attempt', { email });
    try {
      // Login logic
      infoLog('AuthService', 'User logged in successfully', { userId: user.id });
      return user;
    } catch (error) {
      errorLog('AuthService', 'Login failed', error, { email });
      throw error;
    }
  }
}

// Database operations
class UserEntity extends BaseEntity<User> {
  async create(userData: EntityCreationData<User>): Promise<User> {
    debugLog('UserEntity', 'Creating user', { email: userData.email });
    try {
      const user = await super.create(userData);
      infoLog('UserEntity', 'User created', { userId: user.id });
      return user;
    } catch (error) {
      errorLog('UserEntity', 'User creation failed', error, userData);
      throw error;
    }
  }
}
```

### Logging Categories

- **Debug Logs**: Development-only detailed operation tracking
- **Info Logs**: Important application events (login, data creation)
- **Warning Logs**: Non-critical issues (validation warnings, deprecated usage)
- **Error Logs**: Critical failures with full context and stack traces

### Logging Context

Each log entry includes:

- **Module**: Service or entity name
- **Operation**: Specific action being performed
- **Data**: Relevant context (sanitized for sensitive information)
- **User Context**: Current user and band context when applicable
