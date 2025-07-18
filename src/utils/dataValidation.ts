import { 
  MusicianProfile, 
  Goal, 
  PerformanceRecord, 
  PracticeSession, 
  RecordingSession,
  BandMember,
  SetList,
  UserPreferences
} from '../core/types';
import { loggingService } from '../services/loggingService';

/**
 * Type guard to check if a value is a valid Date
 */
export function isValidDate(date: any): date is Date {
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Type guard to check if a value is a non-empty string
 */
export function isNonEmptyString(value: any): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Type guard to check if a value is a positive number
 */
export function isPositiveNumber(value: any): value is number {
  return typeof value === 'number' && value >= 0 && !isNaN(value);
}

/**
 * Type guard to check if an object has required fields
 */
export function hasRequiredFields<T>(obj: unknown, fields: (keyof T)[]): obj is T {
  if (!obj || typeof obj !== 'object') return false;
  
  return fields.every(field => {
    const value = (obj as any)[field];
    return value !== undefined && value !== null;
  });
}

/**
 * Validates and sanitizes a MusicianProfile object
 */
export function validateProfile(profile: unknown): MusicianProfile | null {
  try {
    if (!profile || typeof profile !== 'object') {
      loggingService.warn('Invalid profile: not an object', profile);
      return null;
    }

    const p = profile as any;

    // Check required fields
    if (!hasRequiredFields<MusicianProfile>(profile, ['id', 'name', 'instrument'])) {
      loggingService.warn('Invalid profile: missing required fields', profile);
      return null;
    }

    // Create a validated profile with defaults
    const validatedProfile: MusicianProfile = {
      id: p.id,
      name: p.name,
      createdAt: isValidDate(p.createdAt) ? p.createdAt : new Date(),
      lastUpdated: isValidDate(p.lastUpdated) ? p.lastUpdated : new Date(),
      
      // Basic info
      instrument: p.instrument,
      performanceFrequency: p.performanceFrequency || 'never',
      crowdSize: p.crowdSize || '1-10',
      yearsOfExperience: isPositiveNumber(p.yearsOfExperience) ? p.yearsOfExperience : 0,
      marketingEfforts: Array.isArray(p.marketingEfforts) ? p.marketingEfforts : [],
      
      // Arrays with defaults
      genres: Array.isArray(p.genres) ? p.genres : [],
      shows: validatePerformances(p.shows),
      practiceLog: validatePracticeSessions(p.practiceLog),
      goals: validateGoals(p.goals),
      achievements: Array.isArray(p.achievements) ? p.achievements : [],
      recordings: validateRecordings(p.recordings),
      surveyResponseHistory: Array.isArray(p.surveyResponseHistory) ? p.surveyResponseHistory : [],
      bandMembers: validateBandMembers(p.bandMembers),
      setLists: validateSetLists(p.setLists),
      
      // Preferences with defaults
      preferences: validateUserPreferences(p.preferences)
    };

    return validatedProfile;
  } catch (error) {
    loggingService.error('Error validating profile', error as Error, profile);
    return null;
  }
}

/**
 * Validates an array of goals
 */
export function validateGoals(goals: unknown): Goal[] {
  if (!Array.isArray(goals)) {
    return [];
  }

  return goals.filter((goal): goal is Goal => {
    if (!goal || typeof goal !== 'object') return false;
    
    const g = goal as any;
    return (
      isNonEmptyString(g.id) &&
      isNonEmptyString(g.title) &&
      typeof g.currentValue === 'number' &&
      ['performance', 'skill', 'financial', 'recording', 'custom'].includes(g.type) &&
      ['active', 'completed', 'paused', 'cancelled'].includes(g.status) &&
      isValidDate(g.createdAt)
    );
  }).map(goal => ({
    ...goal,
    progressHistory: Array.isArray(goal.progressHistory) ? goal.progressHistory : [],
    autoUpdate: Boolean(goal.autoUpdate),
    linkedMetric: goal.linkedMetric || ''
  }));
}

/**
 * Validates an array of performance records
 */
export function validatePerformances(performances: unknown): PerformanceRecord[] {
  if (!Array.isArray(performances)) {
    return [];
  }

  return performances.filter((perf): perf is PerformanceRecord => {
    if (!perf || typeof perf !== 'object') return false;
    
    const p = perf as any;
    return (
      isNonEmptyString(p.id) &&
      isValidDate(p.date) &&
      isNonEmptyString(p.venueName) &&
      isPositiveNumber(p.audienceSize) &&
      isPositiveNumber(p.duration) &&
      typeof p.payment === 'number'
    );
  }).map(perf => ({
    ...perf,
    setlist: Array.isArray(perf.setlist) ? perf.setlist : [],
    bandMembersPresent: Array.isArray(perf.bandMembersPresent) ? perf.bandMembersPresent : []
  }));
}

/**
 * Validates an array of practice sessions
 */
export function validatePracticeSessions(sessions: unknown): PracticeSession[] {
  if (!Array.isArray(sessions)) {
    return [];
  }

  return sessions.filter((session): session is PracticeSession => {
    if (!session || typeof session !== 'object') return false;
    
    const s = session as any;
    return (
      isNonEmptyString(s.id) &&
      isValidDate(s.date) &&
      isPositiveNumber(s.duration)
    );
  }).map(session => ({
    ...session,
    focusAreas: Array.isArray(session.focusAreas) ? session.focusAreas : [],
    skillsWorkedOn: Array.isArray(session.skillsWorkedOn) ? session.skillsWorkedOn : [],
    bandMembersPresent: Array.isArray(session.bandMembersPresent) ? session.bandMembersPresent : []
  }));
}

/**
 * Validates an array of recording sessions
 */
export function validateRecordings(recordings: unknown): RecordingSession[] {
  if (!Array.isArray(recordings)) {
    return [];
  }

  return recordings.filter((recording): recording is RecordingSession => {
    if (!recording || typeof recording !== 'object') return false;
    
    const r = recording as any;
    return (
      isNonEmptyString(r.id) &&
      isValidDate(r.date) &&
      isNonEmptyString(r.location) &&
      typeof r.cost === 'number'
    );
  }).map(recording => ({
    ...recording,
    songs: Array.isArray(recording.songs) ? recording.songs : [],
    totalPlays: isPositiveNumber(recording.totalPlays) ? recording.totalPlays : 0,
    totalRevenue: typeof recording.totalRevenue === 'number' ? recording.totalRevenue : 0,
    createdAt: isValidDate(recording.createdAt) ? recording.createdAt : new Date(),
    updatedAt: isValidDate(recording.updatedAt) ? recording.updatedAt : new Date()
  }));
}

/**
 * Validates an array of band members
 */
export function validateBandMembers(members: unknown): BandMember[] {
  if (!Array.isArray(members)) {
    return [];
  }

  return members.filter((member): member is BandMember => {
    if (!member || typeof member !== 'object') return false;
    
    const m = member as any;
    return (
      isNonEmptyString(m.id) &&
      isNonEmptyString(m.name) &&
      isNonEmptyString(m.instrument) &&
      isPositiveNumber(m.yearsExperience) &&
      isValidDate(m.joinDate)
    );
  }).map(member => ({
    ...member,
    participationHistory: Array.isArray(member.participationHistory) ? member.participationHistory : [],
    createdAt: isValidDate(member.createdAt) ? member.createdAt : new Date(),
    updatedAt: isValidDate(member.updatedAt) ? member.updatedAt : new Date()
  }));
}

/**
 * Validates an array of set lists
 */
export function validateSetLists(setLists: unknown): SetList[] {
  if (!Array.isArray(setLists)) {
    return [];
  }

  return setLists.filter((setList): setList is SetList => {
    if (!setList || typeof setList !== 'object') return false;
    
    const s = setList as any;
    return (
      isNonEmptyString(s.id) &&
      isNonEmptyString(s.name) &&
      isNonEmptyString(s.profileId)
    );
  }).map(setList => ({
    ...setList,
    songs: Array.isArray(setList.songs) ? setList.songs : [],
    genres: Array.isArray(setList.genres) ? setList.genres : [],
    usageCount: isPositiveNumber(setList.usageCount) ? setList.usageCount : 0,
    createdAt: isValidDate(setList.createdAt) ? setList.createdAt : new Date(),
    updatedAt: isValidDate(setList.updatedAt) ? setList.updatedAt : new Date()
  }));
}

/**
 * Validates user preferences
 */
export function validateUserPreferences(preferences: unknown): UserPreferences {
  if (!preferences || typeof preferences !== 'object') {
    return getDefaultUserPreferences();
  }

  const p = preferences as any;
  return {
    practiceReminders: Boolean(p.practiceReminders),
    goalDeadlineAlerts: Boolean(p.goalDeadlineAlerts),
    performanceMetrics: Boolean(p.performanceMetrics),
    notifications: Boolean(p.notifications),
    dataSharing: Boolean(p.dataSharing),
    themes: p.themes === 'dark' ? 'dark' : 'light',
    language: isNonEmptyString(p.language) ? p.language : 'en',
    defaultVenueType: ['bar', 'restaurant', 'concert_hall', 'festival', 'private_event', 'other'].includes(p.defaultVenueType) 
      ? p.defaultVenueType 
      : 'bar'
  };
}

/**
 * Returns default user preferences
 */
export function getDefaultUserPreferences(): UserPreferences {
  return {
    practiceReminders: true,
    goalDeadlineAlerts: true,
    performanceMetrics: true,
    notifications: true,
    dataSharing: false,
    themes: 'light',
    language: 'en',
    defaultVenueType: 'bar'
  };
}

/**
 * Creates a default MusicianProfile with minimal required data
 */
export function createDefaultProfile(id: string, name: string, instrument: string): MusicianProfile {
  const now = new Date();
  
  return {
    id,
    name,
    createdAt: now,
    lastUpdated: now,
    instrument,
    performanceFrequency: 'never',
    crowdSize: '1-10',
    yearsOfExperience: 0,
    marketingEfforts: [],
    genres: [],
    shows: [],
    practiceLog: [],
    goals: [],
    achievements: [],
    recordings: [],
    surveyResponseHistory: [],
    bandMembers: [],
    setLists: [],
    preferences: getDefaultUserPreferences()
  };
}

/**
 * Repairs a profile by ensuring all required arrays exist
 */
export function repairProfile(profile: MusicianProfile): MusicianProfile {
  return {
    ...profile,
    shows: profile.shows || [],
    practiceLog: profile.practiceLog || [],
    goals: profile.goals || [],
    achievements: profile.achievements || [],
    recordings: profile.recordings || [],
    surveyResponseHistory: profile.surveyResponseHistory || [],
    bandMembers: profile.bandMembers || [],
    setLists: profile.setLists || [],
    genres: profile.genres || [],
    marketingEfforts: profile.marketingEfforts || [],
    preferences: profile.preferences || getDefaultUserPreferences()
  };
}