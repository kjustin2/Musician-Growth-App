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

/**
 * Type guard to check if a value is defined (not null or undefined)
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * Type guard to check if a value is a non-empty string
 */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Type guard to check if a value is a valid number
 */
export function isValidNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
}

/**
 * Type guard to check if a value is a positive number
 */
export function isPositiveNumber(value: unknown): value is number {
  return isValidNumber(value) && value >= 0;
}

/**
 * Type guard to check if a value is a valid Date object
 */
export function isValidDate(value: unknown): value is Date {
  return value instanceof Date && !isNaN(value.getTime());
}

/**
 * Type guard to check if a value is a valid array
 */
export function isValidArray<T>(value: unknown): value is T[] {
  return Array.isArray(value);
}

/**
 * Type guard to check if a value is a valid MusicianProfile
 */
export function isMusicianProfile(value: unknown): value is MusicianProfile {
  if (!value || typeof value !== 'object') return false;
  
  const profile = value as any;
  return (
    isNonEmptyString(profile.id) &&
    isNonEmptyString(profile.name) &&
    isNonEmptyString(profile.instrument) &&
    isValidDate(profile.createdAt) &&
    isValidDate(profile.lastUpdated) &&
    isValidArray(profile.shows) &&
    isValidArray(profile.practiceLog) &&
    isValidArray(profile.goals) &&
    isValidArray(profile.achievements) &&
    isValidArray(profile.recordings)
  );
}

/**
 * Type guard to check if a value is a valid Goal
 */
export function isGoal(value: unknown): value is Goal {
  if (!value || typeof value !== 'object') return false;
  
  const goal = value as any;
  return (
    isNonEmptyString(goal.id) &&
    isNonEmptyString(goal.title) &&
    isValidNumber(goal.currentValue) &&
    ['performance', 'skill', 'financial', 'recording', 'custom'].includes(goal.type) &&
    ['active', 'completed', 'paused', 'cancelled'].includes(goal.status) &&
    isValidDate(goal.createdAt) &&
    typeof goal.autoUpdate === 'boolean' &&
    isValidArray(goal.progressHistory)
  );
}

/**
 * Type guard to check if a value is a valid PerformanceRecord
 */
export function isPerformanceRecord(value: unknown): value is PerformanceRecord {
  if (!value || typeof value !== 'object') return false;
  
  const performance = value as any;
  return (
    isNonEmptyString(performance.id) &&
    isValidDate(performance.date) &&
    isNonEmptyString(performance.venueName) &&
    ['bar', 'restaurant', 'concert_hall', 'festival', 'private_event', 'other'].includes(performance.venueType) &&
    isPositiveNumber(performance.audienceSize) &&
    isPositiveNumber(performance.duration) &&
    isValidNumber(performance.payment)
  );
}

/**
 * Type guard to check if a value is a valid PracticeSession
 */
export function isPracticeSession(value: unknown): value is PracticeSession {
  if (!value || typeof value !== 'object') return false;
  
  const session = value as any;
  return (
    isNonEmptyString(session.id) &&
    isValidDate(session.date) &&
    isPositiveNumber(session.duration) &&
    isValidArray(session.focusAreas) &&
    isValidArray(session.skillsWorkedOn)
  );
}

/**
 * Type guard to check if a value is a valid RecordingSession
 */
export function isRecordingSession(value: unknown): value is RecordingSession {
  if (!value || typeof value !== 'object') return false;
  
  const recording = value as any;
  return (
    isNonEmptyString(recording.id) &&
    isValidDate(recording.date) &&
    isNonEmptyString(recording.location) &&
    isValidNumber(recording.cost) &&
    isValidArray(recording.songs) &&
    isPositiveNumber(recording.totalPlays) &&
    isValidNumber(recording.totalRevenue) &&
    isValidDate(recording.createdAt) &&
    isValidDate(recording.updatedAt)
  );
}

/**
 * Type guard to check if a value is a valid BandMember
 */
export function isBandMember(value: unknown): value is BandMember {
  if (!value || typeof value !== 'object') return false;
  
  const member = value as any;
  return (
    isNonEmptyString(member.id) &&
    isNonEmptyString(member.name) &&
    isNonEmptyString(member.instrument) &&
    isPositiveNumber(member.yearsExperience) &&
    isValidDate(member.joinDate) &&
    isNonEmptyString(member.profileId) &&
    isValidArray(member.participationHistory) &&
    isValidDate(member.createdAt) &&
    isValidDate(member.updatedAt)
  );
}

/**
 * Type guard to check if a value is a valid SetList
 */
export function isSetList(value: unknown): value is SetList {
  if (!value || typeof value !== 'object') return false;
  
  const setList = value as any;
  return (
    isNonEmptyString(setList.id) &&
    isNonEmptyString(setList.name) &&
    isNonEmptyString(setList.profileId) &&
    isValidArray(setList.songs) &&
    isValidArray(setList.genres) &&
    isPositiveNumber(setList.usageCount) &&
    isValidDate(setList.createdAt) &&
    isValidDate(setList.updatedAt)
  );
}

/**
 * Type guard to check if a value is valid UserPreferences
 */
export function isUserPreferences(value: unknown): value is UserPreferences {
  if (!value || typeof value !== 'object') return false;
  
  const prefs = value as any;
  return (
    typeof prefs.practiceReminders === 'boolean' &&
    typeof prefs.goalDeadlineAlerts === 'boolean' &&
    typeof prefs.performanceMetrics === 'boolean' &&
    typeof prefs.notifications === 'boolean' &&
    typeof prefs.dataSharing === 'boolean' &&
    ['light', 'dark'].includes(prefs.themes) &&
    isNonEmptyString(prefs.language) &&
    ['bar', 'restaurant', 'concert_hall', 'festival', 'private_event', 'other'].includes(prefs.defaultVenueType)
  );
}

/**
 * Safe property access utility that returns undefined if the property doesn't exist
 */
export function safeGet<T, K extends keyof T>(obj: T | null | undefined, key: K): T[K] | undefined {
  return obj?.[key];
}

/**
 * Safe array access utility that returns undefined if index is out of bounds
 */
export function safeArrayGet<T>(arr: T[] | null | undefined, index: number): T | undefined {
  return arr?.[index];
}

/**
 * Safe nested property access utility
 */
export function safeNestedGet<T>(
  obj: any,
  path: string,
  defaultValue?: T
): T | undefined {
  try {
    const keys = path.split('.');
    let current = obj;
    
    for (const key of keys) {
      if (current == null || typeof current !== 'object') {
        return defaultValue;
      }
      current = current[key];
    }
    
    return current !== undefined ? current : defaultValue;
  } catch {
    return defaultValue;
  }
}

/**
 * Utility to filter out null and undefined values from an array
 */
export function filterDefined<T>(arr: (T | null | undefined)[]): T[] {
  return arr.filter(isDefined);
}

/**
 * Utility to ensure a value is an array, returning empty array if not
 */
export function ensureArray<T>(value: T[] | null | undefined): T[] {
  return isValidArray(value) ? value : [];
}

/**
 * Utility to ensure a value is a string, returning empty string if not
 */
export function ensureString(value: unknown): string {
  return isNonEmptyString(value) ? value : '';
}

/**
 * Utility to ensure a value is a number, returning 0 if not
 */
export function ensureNumber(value: unknown): number {
  return isValidNumber(value) ? value : 0;
}

/**
 * Utility to ensure a value is a Date, returning current date if not
 */
export function ensureDate(value: unknown): Date {
  return isValidDate(value) ? value : new Date();
}

/**
 * Type assertion utility that throws if the value doesn't match the type guard
 */
export function assertType<T>(
  value: unknown,
  guard: (value: unknown) => value is T,
  errorMessage: string
): asserts value is T {
  if (!guard(value)) {
    throw new Error(errorMessage);
  }
}

/**
 * Utility to check if an object has all required properties
 */
export function hasRequiredProperties<T extends Record<string, any>>(
  obj: unknown,
  requiredProps: (keyof T)[]
): obj is T {
  if (!obj || typeof obj !== 'object') return false;
  
  return requiredProps.every(prop => {
    const value = (obj as any)[prop];
    return value !== undefined && value !== null;
  });
}

/**
 * Utility to safely parse JSON with type checking
 */
export function safeJsonParse<T>(
  json: string,
  guard: (value: unknown) => value is T
): T | null {
  try {
    const parsed = JSON.parse(json);
    return guard(parsed) ? parsed : null;
  } catch {
    return null;
  }
}