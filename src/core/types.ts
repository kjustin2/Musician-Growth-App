export interface MusicianProfile {
  id: string;
  name: string;
  createdAt: Date;
  lastUpdated: Date;
  
  // Basic info (existing)
  instrument: string;
  performanceFrequency: 'never' | 'yearly' | 'monthly' | 'weekly' | 'multiple';
  crowdSize: '1-10' | '10-50' | '50-100' | '100-500' | '500+';
  yearsOfExperience: number;
  marketingEfforts: string[];
  
  // New persistent data
  genres: string[];
  shows: PerformanceRecord[];
  practiceLog: PracticeSession[];
  goals: Goal[];
  achievements: import('./achievementTypes').Achievement[];
  preferences: UserPreferences;
  recordings: RecordingSession[];
  surveyResponseHistory: SurveyResponse[];
  
  // Band and set list management
  bandMembers: BandMember[];
  setLists: SetList[];
}

export interface PerformanceRecord {
  id: string;
  date: Date;
  venueName: string;
  venueType: 'bar' | 'restaurant' | 'concert_hall' | 'festival' | 'private_event' | 'other';
  audienceSize: number;
  duration: number; // minutes
  payment: number;
  notes?: string;
  setlist?: string[];
  bandMembersPresent?: string[]; // band member IDs
  setListUsed?: string; // set list ID
  bandId?: string; // ID of the band this performance was with
}

export interface PracticeSession {
  id: string;
  date: Date;
  duration: number; // minutes
  focusAreas: string[];
  notes?: string;
  skillsWorkedOn: string[];
  bandMembersPresent?: string[]; // band member IDs for group practice
}

// Band Management
export interface Band {
  id: string;
  name: string;
  genre: string;
  profileId: string;
  memberRole: string; // User's role in this band
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Band Member Management
export interface BandMember {
  id: string;
  name: string;
  instrument: string;
  yearsExperience: number;
  joinDate: Date;
  profileId: string;
  participationHistory: ParticipationRecord[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ParticipationRecord {
  id: string;
  activityId: string;
  activityType: 'performance' | 'practice' | 'recording';
  date: Date;
  role?: string; // specific role in that activity
  bandMemberId: string;
}

// Set List Management
export interface SetList {
  id: string;
  name: string;
  profileId: string;
  songs: SetListSong[];
  totalDuration?: number; // in minutes
  genres: string[];
  usageCount: number;
  lastUsed?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface SetListSong {
  id: string;
  title: string;
  artist: string;
  genre: string;
  duration?: number; // in minutes
  bandMembers: string[]; // band member IDs who play this song
  position: number; // order in set list
}

// Analysis Interfaces
export interface BandCompositionAnalysis {
  currentInstruments: string[];
  missingInstruments: string[];
  experienceBalance: number;
  recommendedAdditions: InstrumentRecommendation[];
}

export interface InstrumentRecommendation {
  instrument: string;
  priority: 'high' | 'medium' | 'low';
  reason: string;
}

export interface SetListAnalysis {
  genreDiversity: number;
  averageSongDuration: number;
  genreDistribution: Record<string, number>;
  recommendedGenres: GenreRecommendation[];
}

export interface GenreRecommendation {
  genre: string;
  compatibility: number;
  reason: string;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  type: 'performance' | 'skill' | 'financial' | 'recording' | 'custom';
  targetValue?: number;
  currentValue: number;
  deadline?: Date;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  createdAt: Date;
  // New required fields for metric linking
  linkedMetric: string; // Required field - defaults based on goal type
  autoUpdate: boolean; // Defaults to true unless custom goal
  bandSpecific: boolean;
  selectedBands: string[];
  progressHistory: GoalProgressEntry[];
  lastAutoUpdate?: Date;
}

export interface GoalProgressEntry {
  date: Date;
  value: number;
  triggeredBy?: string; // ID of the action that triggered this update
}

export interface RecordingSession {
  id: string;
  date: Date;
  location: string;
  cost: number;
  songs: RecordedSong[];
  notes?: string;
  totalPlays: number;
  totalRevenue: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface RecordedSong {
  id: string;
  title: string;
  duration?: number; // in seconds
  plays: number;
  revenue: number;
  distributionPlatforms: string[];
  recordingSessionId: string;
}

export interface SurveyResponse {
  id: string;
  profileId: string;
  responses: {
    instrument: string;
    performanceFrequency: string;
    crowdSize: string;
    yearsOfExperience: number;
    marketingEfforts: string[];
  };
  updatedAt: Date;
}

export interface FinancialSummary {
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  revenueBySource: {
    performances: number;
    recordings: number;
    other: number;
  };
  expensesByCategory: {
    recording: number;
    equipment: number;
    marketing: number;
    other: number;
  };
  monthlyTrends: MonthlyFinancialData[];
}

export interface MonthlyFinancialData {
  month: string;
  revenue: number;
  expenses: number;
  netIncome: number;
}

export interface GoalTemplate {
  id: string;
  title: string;
  description: string;
  linkedMetric: string;
  category: 'performance' | 'practice' | 'recording' | 'financial';
  defaultTargetValue?: number;
}

export interface RecommendationContext {
  profile: MusicianProfile;
  recentActivities: ActivitySummary;
  financialData: FinancialSummary;
  goalProgress: GoalProgressSummary;
  seasonalFactors: SeasonalData;
}

export interface ActivitySummary {
  recentPerformances: PerformanceRecord[];
  recentPractice: PracticeSession[];
  recentRecordings: RecordingSession[];
  performanceTrends: PerformanceTrends;
  practiceAnalysis: PracticeAnalysis;
  recordingAnalysis: RecordingAnalysis;
}

export interface GoalProgressSummary {
  activeGoals: Goal[];
  completedGoals: Goal[];
  overdueGoals: Goal[];
  goalCompletionRate: number;
}

export interface SeasonalData {
  currentMonth: number;
  seasonalPerformancePattern: 'peak' | 'low' | 'normal';
  holidayPeriod: boolean;
}

export interface RecordingAnalysis {
  totalSongs: number;
  totalPlays: number;
  totalRevenue: number;
  averageRevenuePerSong: number;
  recordingFrequency: 'increasing' | 'decreasing' | 'stable';
  costEfficiency: 'good' | 'poor' | 'excellent';
}

export class RecordingError extends Error {
  constructor(
    message: string,
    public code: 'INVALID_COST' | 'MISSING_SONGS' | 'STORAGE_FAILED' | 'DUPLICATE_SESSION',
    public recoverable: boolean = true
  ) {
    super(message);
    this.name = 'RecordingError';
  }
}

export class GoalLinkingError extends Error {
  constructor(
    message: string,
    public code: 'GOAL_NOT_FOUND' | 'INVALID_METRIC' | 'CALCULATION_FAILED',
    public goalId?: string
  ) {
    super(message);
    this.name = 'GoalLinkingError';
  }
}

export class BandMemberError extends Error {
  constructor(
    message: string,
    public code: 'DUPLICATE_MEMBER' | 'INVALID_INSTRUMENT' | 'STORAGE_FAILED' | 'MEMBER_NOT_FOUND',
    public recoverable: boolean = true
  ) {
    super(message);
    this.name = 'BandMemberError';
  }
}

export class SetListError extends Error {
  constructor(
    message: string,
    public code: 'EMPTY_SETLIST' | 'INVALID_SONG_DATA' | 'MISSING_BAND_MEMBERS' | 'SETLIST_NOT_FOUND',
    public setListId?: string
  ) {
    super(message);
    this.name = 'SetListError';
  }
}

// Achievement interface is defined in achievementTypes.ts
export type { Achievement, AchievementProgress, Notification } from './achievementTypes';

export interface UserPreferences {
  practiceReminders: boolean;
  goalDeadlineAlerts: boolean;
  performanceMetrics: boolean;
  notifications: boolean;
  dataSharing: boolean;
  themes: 'light' | 'dark';
  language: string;
  defaultVenueType: PerformanceRecord['venueType'];
}

export interface PerformanceTrends {
  averageAudienceSize: number;
  totalEarnings: number;
  showFrequency: 'increasing' | 'decreasing' | 'stable';
  venueProgression: 'improving' | 'declining' | 'stable';
}

export interface PracticeAnalysis {
  weeklyAverage: number;
  consistency: 'excellent' | 'good' | 'needs_improvement';
  recommendedAdjustment: 'increase' | 'decrease' | 'maintain';
  suggestProfessionalLessons: boolean;
}

export interface StorageError extends Error {
  type: 'quota_exceeded' | 'data_corruption' | 'browser_unsupported' | 'unknown';
  recoverable: boolean;
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  category: 'marketing' | 'performance' | 'networking' | 'skill';
  priority: 'high' | 'medium' | 'low';
}

export type PageState = 'landing' | 'profile-selection' | 'profile-creation' | 'dashboard' | 'form' | 'results' | 'activity-entry' | 'goal-management' | 'bulk-entry' | 'settings' | 'recording-details';

export interface AppState {
  currentPage: PageState;
  musicianProfile: MusicianProfile | null;
  availableProfiles: MusicianProfile[];
  recommendations: Recommendation[];
  isLoading: boolean;
  error: string | null;
  navigationContext: 'onboarding' | 'dashboard' | null;
}

export type AppAction =
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
  | { type: 'ADD_ACHIEVEMENT'; payload: import('./achievementTypes').Achievement }
  | { type: 'ADD_RECORDING'; payload: RecordingSession }
  | { type: 'UPDATE_RECORDING'; payload: { id: string; updates: Partial<RecordingSession> } }
  | { type: 'UPDATE_SURVEY_RESPONSES'; payload: SurveyResponse }
  | { type: 'ADD_BAND_MEMBER'; payload: BandMember }
  | { type: 'UPDATE_BAND_MEMBER'; payload: { id: string; updates: Partial<BandMember> } }
  | { type: 'REMOVE_BAND_MEMBER'; payload: string }
  | { type: 'ADD_SET_LIST'; payload: SetList }
  | { type: 'UPDATE_SET_LIST'; payload: { id: string; updates: Partial<SetList> } }
  | { type: 'REMOVE_SET_LIST'; payload: string }
  | { type: 'UPDATE_PARTICIPATION'; payload: ParticipationRecord }
  | { type: 'RESET' };