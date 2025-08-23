# Requirements Document

## Introduction

ChordLine is a progress and growth application designed for local and gigging musicians and bands. The MVP provides a comprehensive platform for tracking musical activities, managing band operations, setting goals, and receiving AI-powered recommendations. The application supports both solo artists and band members, offering multi-band functionality with individual progress tracking, set list management, gig logging, practice tracking, and achievement systems.

## Requirements

### Requirement 1

**User Story:** As a new user, I want to register and login to the app, so that I can access my personal musical data securely.

#### Acceptance Criteria

1. WHEN a new user creates an account THEN the system SHALL present registration and login options
2. WHEN registering THEN the system SHALL require email address and password with confirmation
3. WHEN a user provides registration information THEN the system SHALL validate email format and password strength
4. WHEN registration is successful THEN the system SHALL automatically log the user in and proceed to onboarding
5. WHEN an existing user opens the app THEN the system SHALL present a login form
6. WHEN logging in THEN the system SHALL authenticate the user with email and password
7. WHEN login is successful THEN the system SHALL redirect to the home dashboard
8. IF login credentials are invalid THEN the system SHALL display appropriate error messages

### Requirement 2

**User Story:** As a new user, I want to complete an onboarding process, so that the app can provide personalized recommendations and tracking.

#### Acceptance Criteria

1. WHEN a new user creates an account THEN the system SHALL present a required onboarding flow
2. WHEN onboarding starts THEN the system SHALL ask for primary instrument, play frequency, genres performed, and band memberships
3. WHEN a user provides band information THEN the system SHALL capture band name and user's role/instrument for each band
4. WHEN onboarding is completed THEN the system SHALL store user preferences for personalization
5. WHEN onboarding is required THEN the system SHALL not allow skipping and must be completed to access main app features

### Requirement 3

**User Story:** As a musician, I want to manage multiple bands and solo activities, so that I can track progress across all my musical endeavors.

#### Acceptance Criteria

1. WHEN a user completes onboarding THEN the system SHALL allow them to create multiple bands
2. WHEN a user joins a band THEN the system SHALL associate their role and instrument with that band
3. WHEN a user switches between bands THEN the system SHALL display band-specific data (members, set lists, gigs, songs, practices, stats)
4. WHEN a user selects solo mode THEN the system SHALL track individual musical activities separate from band activities
5. IF a user belongs to multiple bands THEN the system SHALL maintain separate data contexts for each band

### Requirement 4

**User Story:** As a musician, I want a centralized dashboard, so that I can quickly access all key features and see my progress at a glance.

#### Acceptance Criteria

1. WHEN a logged-in user accesses the app THEN the system SHALL display a home dashboard
2. WHEN the dashboard loads THEN the system SHALL show a band switcher to select active band or solo mode
3. WHEN the dashboard is displayed THEN the system SHALL provide quick-add buttons for logging gigs, adding songs, logging practice, creating set lists, and editing band info
4. WHEN the dashboard loads THEN the system SHALL display a progress chart showing earnings, gigs, songs, and practice hours
5. WHEN progress data exists THEN the system SHALL allow filtering by band or aggregate view
6. WHEN the dashboard is shown THEN the system SHALL display personalized recommendations, achievements preview, active goals, and notifications

### Requirement 5

**User Story:** As a band member, I want to create and manage set lists, so that I can organize songs for performances and practices.

#### Acceptance Criteria

1. WHEN a user creates a set list THEN the system SHALL allow naming and associating it with a specific band
2. WHEN managing a set list THEN the system SHALL allow adding, removing, and reordering songs
3. WHEN a set list is created THEN the system SHALL optionally link it to gigs and practices
4. WHEN viewing set lists THEN the system SHALL display all set lists for the currently selected band
5. IF a user switches bands THEN the system SHALL show only set lists belonging to that band

### Requirement 6

**User Story:** As a musician, I want to track my songs, so that I can monitor my repertoire and recording progress.

#### Acceptance Criteria

1. WHEN a user adds a song THEN the system SHALL capture title, status (in progress/performed/professionally recorded), genre, set list assignments, and recording studio (if professionally recorded)
2. WHEN viewing songs THEN the system SHALL display a filterable library per band/solo context
3. WHEN a song is professionally recorded THEN the system SHALL highlight it visually in the song library and display the recording studio
4. WHEN songs are displayed THEN the system SHALL allow filtering by status, genre, and set list assignment
5. IF a user switches bands THEN the system SHALL show only songs belonging to that band context

### Requirement 7

**User Story:** As a musician, I want to log gigs and practice sessions, so that I can track my musical activity and progress.

#### Acceptance Criteria

1. WHEN logging a gig THEN the system SHALL capture band selection, set list used (optional), venue with search/autocomplete, date, duration in hours, payout, and notes
2. WHEN logging practice THEN the system SHALL capture band/solo selection, date, duration, notes, and songs/set list practiced
3. WHEN entering venue information THEN the system SHALL provide search and autocomplete functionality from previously saved venues
4. WHEN a new venue is entered THEN the system SHALL save it for future selection
5. WHEN gig or practice data is saved THEN the system SHALL update relevant progress metrics
6. IF logging for a specific band THEN the system SHALL associate the activity with that band's data

### Requirement 8

**User Story:** As a musician, I want to set and track goals, so that I can measure my progress and stay motivated.

#### Acceptance Criteria

1. WHEN a user accesses the goals page THEN the system SHALL display active and completed goals
2. WHEN creating a goal THEN the system SHALL allow selection from any trackable metric (gigs, practice, recordings, set lists)
3. WHEN a goal is created manually THEN the system SHALL track progress automatically
4. WHEN goal progress is displayed THEN the system SHALL show progress bars for each goal
5. WHEN a goal is completed THEN the system SHALL detect completion automatically and display celebration animation

### Requirement 9

**User Story:** As a musician, I want to earn achievements, so that I can celebrate milestones and stay motivated.

#### Acceptance Criteria

1. WHEN a user reaches specific milestones THEN the system SHALL unlock corresponding badges (first gig, 10 practice sessions, first set list, 5 unique venues)
2. WHEN achievements are earned THEN the system SHALL track progress for both user and band contexts
3. WHEN the dashboard loads THEN the system SHALL display achievement previews
4. WHEN a user views achievements THEN the system SHALL provide a dedicated achievements page
5. IF an achievement is unlocked THEN the system SHALL notify the user with appropriate visual feedback

### Requirement 10

**User Story:** As a user, I want to manage my profile and settings, so that I can keep my information current and customize my experience.

#### Acceptance Criteria

1. WHEN a user accesses settings THEN the system SHALL allow updating instrument, genres, band memberships, and notification preferences
2. WHEN managing bands THEN the system SHALL allow editing roles, member information, and account details
3. WHEN profile changes are made THEN the system SHALL update personalization and recommendations accordingly
4. IF notification preferences are changed THEN the system SHALL respect new settings for all future notifications
