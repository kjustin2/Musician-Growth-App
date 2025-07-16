import { MusicianProfile, UserPreferences } from '../core/types';
import { generateId } from './index';

export function createDefaultProfile(partialProfile: Partial<MusicianProfile>): MusicianProfile {
  const now = new Date();
  
  const defaultPreferences: UserPreferences = {
    practiceReminders: false,
    goalDeadlineAlerts: true,
    performanceMetrics: true,
    notifications: true,
    dataSharing: false,
    themes: 'light',
    language: 'en',
    defaultVenueType: 'bar'
  };

  return {
    id: generateId(),
    name: '',
    createdAt: now,
    lastUpdated: now,
    instrument: '',
    performanceFrequency: 'never',
    crowdSize: '1-10',
    yearsOfExperience: 0,
    marketingEfforts: [],
    genres: [],
    shows: [],
    practiceLog: [],
    goals: [],
    achievements: [],
    preferences: defaultPreferences,
    ...partialProfile
  };
}

export function createBasicProfile(data: {
  instrument: string;
  performanceFrequency: MusicianProfile['performanceFrequency'];
  crowdSize: MusicianProfile['crowdSize'];
  yearsOfExperience: number;
  marketingEfforts: string[];
}): MusicianProfile {
  return createDefaultProfile(data);
}

export function migrateOldProfileData(oldData: any): MusicianProfile {
  return createDefaultProfile({
    instrument: oldData.instrument || '',
    performanceFrequency: oldData.performanceFrequency || 'never',
    crowdSize: oldData.crowdSize || '1-10',
    yearsOfExperience: oldData.yearsOfExperience || 0,
    marketingEfforts: oldData.marketingEfforts || [],
    name: oldData.name || `${oldData.instrument} Player`
  });
}