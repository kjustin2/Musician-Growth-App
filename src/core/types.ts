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
}

export interface PracticeSession {
  id: string;
  date: Date;
  duration: number; // minutes
  focusAreas: string[];
  notes?: string;
  skillsWorkedOn: string[];
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

export type PageState = 'landing' | 'profile-selection' | 'profile-creation' | 'dashboard' | 'form' | 'results' | 'activity-entry' | 'goal-management' | 'bulk-entry';

export interface AppState {
  currentPage: PageState;
  musicianProfile: MusicianProfile | null;
  availableProfiles: MusicianProfile[];
  recommendations: Recommendation[];
  isLoading: boolean;
  error: string | null;
}

export type AppAction =
  | { type: 'SET_PAGE'; payload: PageState }
  | { type: 'SET_PROFILE'; payload: MusicianProfile }
  | { type: 'SET_AVAILABLE_PROFILES'; payload: MusicianProfile[] }
  | { type: 'SET_RECOMMENDATIONS'; payload: Recommendation[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'ADD_PERFORMANCE'; payload: PerformanceRecord }
  | { type: 'ADD_PRACTICE_SESSION'; payload: PracticeSession }
  | { type: 'ADD_GOAL'; payload: Goal }
  | { type: 'UPDATE_GOAL'; payload: { id: string; updates: Partial<Goal> } }
  | { type: 'ADD_ACHIEVEMENT'; payload: import('./achievementTypes').Achievement }
  | { type: 'RESET' };