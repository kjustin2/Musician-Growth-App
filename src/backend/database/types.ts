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
