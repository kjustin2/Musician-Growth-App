/**
 * Database entity types
 */

export interface BaseEntity {
  id?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface User extends BaseEntity {
  email: string;
  passwordHash: string;
  onboardingCompleted: boolean;
  primaryInstrument: string | null;
  playFrequency: 'daily' | 'several-times-week' | 'weekly' | 'monthly' | 'occasionally' | null;
  genres: string[];
}

export interface Item extends BaseEntity {
  name: string;
  description?: string;
}

export interface Band extends BaseEntity {
  name: string;
  userId: number; // owner
}

export interface BandMembership extends BaseEntity {
  userId: number;
  bandId: number;
  role: string;
  instrument: string;
  joinedAt: Date;
}

// Creation types (omit auto-generated fields)
export type CreateUser = Omit<User, 'id' | 'createdAt' | 'updatedAt'>;
export type CreateItem = Omit<Item, 'id' | 'createdAt' | 'updatedAt'>;
export type CreateBand = Omit<Band, 'id' | 'createdAt' | 'updatedAt'>;
export type CreateBandMembership = Omit<BandMembership, 'id' | 'createdAt' | 'updatedAt'>;

// Update types (omit id and createdAt)
export type UpdateUser = Partial<Omit<User, 'id' | 'createdAt'>>;
export type UpdateItem = Partial<Omit<Item, 'id' | 'createdAt'>>;
export type UpdateBand = Partial<Omit<Band, 'id' | 'createdAt'>>;
export type UpdateBandMembership = Partial<Omit<BandMembership, 'id' | 'createdAt'>>;

// Generic types for extensibility
export type CreateEntity<T extends BaseEntity> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateEntity<T extends BaseEntity> = Partial<Omit<T, 'id' | 'createdAt'>>;

// Onboarding specific types
export interface OnboardingData {
  primaryInstrument: string;
  playFrequency: 'daily' | 'several-times-week' | 'weekly' | 'monthly' | 'occasionally';
  genres: string[];
  bands: Array<{
    name: string;
    role: string;
    instrument: string;
  }>;
}

// Available options for onboarding
export const INSTRUMENTS = [
  'Guitar',
  'Bass',
  'Drums',
  'Keyboard/Piano',
  'Vocals',
  'Saxophone',
  'Trumpet',
  'Violin',
  'Other',
] as const;

export const GENRES = [
  'Rock',
  'Pop',
  'Jazz',
  'Blues',
  'Country',
  'Classical',
  'Electronic',
  'Hip Hop',
  'R&B',
  'Folk',
  'Metal',
  'Indie',
  'Other',
] as const;

export const PLAY_FREQUENCIES = [
  { value: 'daily', label: 'Daily' },
  { value: 'several-times-week', label: 'Several times a week' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'occasionally', label: 'Occasionally' },
] as const;

// Venue entity
export interface Venue extends BaseEntity {
  name: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  website?: string;
  notes?: string;
}

// Song entity
export interface Song extends BaseEntity {
  title: string;
  artist?: string;
  genre?: string;
  key?: string;
  tempo?: number;
  duration?: number; // in seconds
  status: 'learning' | 'ready' | 'mastered';
  notes?: string;
  recordingUrl?: string;
  userId: number; // owner
  bandId?: number; // optional band association
}

// Setlist entity
export interface SetList extends BaseEntity {
  name: string;
  description?: string;
  userId: number;
  bandId?: number;
  songs: Array<{
    songId: number;
    order: number;
    notes?: string;
  }>;
}

// Gig entity
export interface Gig extends BaseEntity {
  title: string;
  venueId?: number;
  venueName?: string; // fallback if venue not in system
  date: Date;
  startTime?: string;
  endTime?: string;
  earnings?: number; // always in USD
  setListId?: number;
  notes?: string;
  userId: number;
  bandId?: number;
  status: 'scheduled' | 'completed' | 'cancelled';
}

// Practice session entity
export interface Practice extends BaseEntity {
  date: Date;
  duration: number; // in minutes
  focusAreas: string[]; // technique, songs, theory, etc.
  songsWorkedOn?: number[]; // song IDs
  notes?: string;
  rating?: number; // 1-5 scale
  userId: number;
  bandId?: number;
}

// Goal entity
export interface Goal extends BaseEntity {
  title: string;
  description?: string;
  type: 'practice' | 'performance' | 'skill' | 'repertoire';
  targetValue?: number;
  currentValue?: number;
  unit?: string; // minutes, songs, gigs, etc.
  targetDate?: Date;
  completed: boolean;
  completedAt?: Date;
  userId: number;
  bandId?: number;
}

// Create types for new entities
export type CreateVenue = Omit<Venue, 'id' | 'createdAt' | 'updatedAt'>;
export type CreateSong = Omit<Song, 'id' | 'createdAt' | 'updatedAt'>;
export type CreateSetList = Omit<SetList, 'id' | 'createdAt' | 'updatedAt'>;
export type CreateGig = Omit<Gig, 'id' | 'createdAt' | 'updatedAt'>;
export type CreatePractice = Omit<Practice, 'id' | 'createdAt' | 'updatedAt'>;
export type CreateGoal = Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>;

// Update types for new entities
export type UpdateVenue = Partial<Omit<Venue, 'id' | 'createdAt'>>;
export type UpdateSong = Partial<Omit<Song, 'id' | 'createdAt'>>;
export type UpdateSetList = Partial<Omit<SetList, 'id' | 'createdAt'>>;
export type UpdateGig = Partial<Omit<Gig, 'id' | 'createdAt'>>;
export type UpdatePractice = Partial<Omit<Practice, 'id' | 'createdAt'>>;
export type UpdateGoal = Partial<Omit<Goal, 'id' | 'createdAt'>>;

// Constants for new entities
export const SONG_STATUSES = [
  { value: 'learning', label: 'Learning' },
  { value: 'ready', label: 'Ready to Perform' },
  { value: 'mastered', label: 'Mastered' },
] as const;

export const GIG_STATUSES = [
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
] as const;

export const GOAL_TYPES = [
  { value: 'practice', label: 'Practice Goal' },
  { value: 'performance', label: 'Performance Goal' },
  { value: 'skill', label: 'Skill Development' },
  { value: 'repertoire', label: 'Repertoire Goal' },
] as const;

export const FOCUS_AREAS = [
  'Technique',
  'Songs',
  'Theory',
  'Improvisation',
  'Rhythm',
  'Scales',
  'Chords',
  'Performance',
  'Recording',
  'Other',
] as const;
