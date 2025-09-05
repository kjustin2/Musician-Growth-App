/**
 * Validation system
 */
import { PLAY_FREQUENCIES, SONG_STATUSES, GIG_STATUSES, GOAL_TYPES } from './types.js';

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export const validators = {
  email: (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  },

  required: (value: unknown): boolean => {
    return value !== undefined && value !== null && value !== '';
  },

  nonEmptyString: (value: unknown): boolean => {
    return typeof value === 'string' && value.trim().length > 0;
  },

  positiveNumber: (value: unknown): boolean => {
    return typeof value === 'number' && value > 0;
  },

  boolean: (value: unknown): boolean => {
    return typeof value === 'boolean';
  },

  array: (value: unknown): boolean => {
    return Array.isArray(value);
  },

  stringArray: (value: unknown): boolean => {
    return Array.isArray(value) && value.every(item => typeof item === 'string');
  },

  date: (value: unknown): boolean => {
    return value instanceof Date || (typeof value === 'string' && !isNaN(Date.parse(value)));
  },

  oneOf:
    (validValues: readonly unknown[]) =>
    (value: unknown): boolean => {
      return validValues.includes(value);
    },
};

export const validateUser = (data: Record<string, unknown>): void => {
  if (!validators.required(data.email)) {
    throw new ValidationError('Email is required');
  }
  if (!validators.email(data.email as string)) {
    throw new ValidationError('Invalid email format');
  }
  if (!validators.nonEmptyString(data.passwordHash)) {
    throw new ValidationError('Password hash is required');
  }
  if (!validators.boolean(data.onboardingCompleted)) {
    throw new ValidationError('Onboarding completion status is required');
  }
  if (data.primaryInstrument !== null && !validators.nonEmptyString(data.primaryInstrument)) {
    throw new ValidationError('Primary instrument must be a non-empty string or null');
  }
  if (
    data.playFrequency !== null &&
    !validators.oneOf(['daily', 'several-times-week', 'weekly', 'monthly', 'occasionally'])(
      data.playFrequency
    )
  ) {
    throw new ValidationError('Play frequency must be a valid option or null');
  }
  if (!validators.stringArray(data.genres)) {
    throw new ValidationError('Genres must be an array of strings');
  }
};

export const validateItem = (data: Record<string, unknown>): void => {
  if (!validators.nonEmptyString(data.name)) {
    throw new ValidationError('Name is required');
  }
  if (data.description !== undefined && typeof data.description !== 'string') {
    throw new ValidationError('Description must be a string');
  }
};

export const validateBand = (data: Record<string, unknown>): void => {
  if (!validators.nonEmptyString(data.name)) {
    throw new ValidationError('Band name is required');
  }
  if (!validators.positiveNumber(data.userId)) {
    throw new ValidationError('User ID is required and must be positive');
  }
};

export const validateBandMembership = (data: Record<string, unknown>): void => {
  if (!validators.positiveNumber(data.userId)) {
    throw new ValidationError('User ID is required and must be positive');
  }
  if (!validators.positiveNumber(data.bandId)) {
    throw new ValidationError('Band ID is required and must be positive');
  }
  if (!validators.nonEmptyString(data.role)) {
    throw new ValidationError('Role is required');
  }
  if (!validators.nonEmptyString(data.instrument)) {
    throw new ValidationError('Instrument is required');
  }
  if (!validators.date(data.joinedAt)) {
    throw new ValidationError('Joined date is required');
  }
};

export const validateOnboardingData = (data: Record<string, unknown>): void => {
  if (!validators.nonEmptyString(data.primaryInstrument)) {
    throw new ValidationError('Primary instrument is required');
  }
  if (!validators.oneOf(PLAY_FREQUENCIES.map(f => f.value))(data.playFrequency)) {
    throw new ValidationError('Play frequency must be a valid option');
  }
  if (!validators.stringArray(data.genres)) {
    throw new ValidationError('Genres must be an array of strings');
  }
  if ((data.genres as string[]).length === 0) {
    throw new ValidationError('At least one genre is required');
  }
  if (data.bands && validators.array(data.bands)) {
    const bands = data.bands as Array<Record<string, unknown>>;
    for (const band of bands) {
      if (!validators.nonEmptyString(band.name)) {
        throw new ValidationError('Band name is required');
      }
      if (!validators.nonEmptyString(band.role)) {
        throw new ValidationError('Band role is required');
      }
      if (!validators.nonEmptyString(band.instrument)) {
        throw new ValidationError('Band instrument is required');
      }
    }
  }
};

export const validateVenue = (data: Record<string, unknown>): void => {
  if (!validators.nonEmptyString(data.name)) {
    throw new ValidationError('Venue name is required');
  }
  if (data.address !== undefined && typeof data.address !== 'string') {
    throw new ValidationError('Address must be a string');
  }
  if (data.city !== undefined && typeof data.city !== 'string') {
    throw new ValidationError('City must be a string');
  }
  if (data.state !== undefined && typeof data.state !== 'string') {
    throw new ValidationError('State must be a string');
  }
  if (data.country !== undefined && typeof data.country !== 'string') {
    throw new ValidationError('Country must be a string');
  }
  if (data.website !== undefined && typeof data.website !== 'string') {
    throw new ValidationError('Website must be a string');
  }
  if (data.notes !== undefined && typeof data.notes !== 'string') {
    throw new ValidationError('Notes must be a string');
  }
};

export const validateSong = (data: Record<string, unknown>): void => {
  if (!validators.nonEmptyString(data.title)) {
    throw new ValidationError('Song title is required');
  }
  if (data.artist !== undefined && typeof data.artist !== 'string') {
    throw new ValidationError('Artist must be a string');
  }
  if (data.genre !== undefined && typeof data.genre !== 'string') {
    throw new ValidationError('Genre must be a string');
  }
  if (data.key !== undefined && typeof data.key !== 'string') {
    throw new ValidationError('Key must be a string');
  }
  if (data.tempo !== undefined && (typeof data.tempo !== 'number' || data.tempo <= 0)) {
    throw new ValidationError('Tempo must be a positive number');
  }
  if (data.duration !== undefined && (typeof data.duration !== 'number' || data.duration <= 0)) {
    throw new ValidationError('Duration must be a positive number');
  }
  if (!validators.oneOf(SONG_STATUSES.map(s => s.value))(data.status)) {
    throw new ValidationError('Status must be a valid song status');
  }
  if (data.notes !== undefined && typeof data.notes !== 'string') {
    throw new ValidationError('Notes must be a string');
  }
  if (data.recordingUrl !== undefined && typeof data.recordingUrl !== 'string') {
    throw new ValidationError('Recording URL must be a string');
  }
  if (!validators.positiveNumber(data.userId)) {
    throw new ValidationError('User ID is required and must be positive');
  }
  if (data.bandId !== undefined && !validators.positiveNumber(data.bandId)) {
    throw new ValidationError('Band ID must be positive if provided');
  }
};

export const validateSetList = (data: Record<string, unknown>): void => {
  if (!validators.nonEmptyString(data.name)) {
    throw new ValidationError('Setlist name is required');
  }
  if (data.description !== undefined && typeof data.description !== 'string') {
    throw new ValidationError('Description must be a string');
  }
  if (!validators.positiveNumber(data.userId)) {
    throw new ValidationError('User ID is required and must be positive');
  }
  if (data.bandId !== undefined && !validators.positiveNumber(data.bandId)) {
    throw new ValidationError('Band ID must be positive if provided');
  }
  if (!validators.array(data.songs)) {
    throw new ValidationError('Songs must be an array');
  }

  const songs = data.songs as Array<Record<string, unknown>>;
  for (const song of songs) {
    if (!validators.positiveNumber(song.songId)) {
      throw new ValidationError('Song ID is required and must be positive');
    }
    if (typeof song.order !== 'number' || song.order < 0) {
      throw new ValidationError('Song order must be a non-negative number');
    }
    if (song.notes !== undefined && typeof song.notes !== 'string') {
      throw new ValidationError('Song notes must be a string');
    }
  }
};

export const validateGig = (data: Record<string, unknown>): void => {
  if (!validators.nonEmptyString(data.title)) {
    throw new ValidationError('Gig title is required');
  }
  if (data.venueId !== undefined && data.venueId !== null && !validators.positiveNumber(data.venueId)) {
    console.log('DEBUG: venueId value:', data.venueId, 'type:', typeof data.venueId);
    throw new ValidationError('Venue ID must be positive if provided');
  }
  if (data.venueName !== undefined && typeof data.venueName !== 'string') {
    throw new ValidationError('Venue name must be a string');
  }
  if (!validators.date(data.date)) {
    throw new ValidationError('Date is required and must be a valid date');
  }
  if (data.startTime !== undefined && typeof data.startTime !== 'string') {
    throw new ValidationError('Start time must be a string');
  }
  if (data.endTime !== undefined && typeof data.endTime !== 'string') {
    throw new ValidationError('End time must be a string');
  }
  if (data.earnings !== undefined && (typeof data.earnings !== 'number' || data.earnings < 0)) {
    throw new ValidationError('Earnings must be a non-negative number');
  }
  if (data.setListId !== undefined && !validators.positiveNumber(data.setListId)) {
    throw new ValidationError('Setlist ID must be positive if provided');
  }
  if (data.notes !== undefined && typeof data.notes !== 'string') {
    throw new ValidationError('Notes must be a string');
  }
  if (!validators.positiveNumber(data.userId)) {
    throw new ValidationError('User ID is required and must be positive');
  }
  if (data.bandId !== undefined && !validators.positiveNumber(data.bandId)) {
    throw new ValidationError('Band ID must be positive if provided');
  }
  if (!validators.oneOf(GIG_STATUSES.map(s => s.value))(data.status)) {
    throw new ValidationError('Status must be a valid gig status');
  }
};

export const validatePractice = (data: Record<string, unknown>): void => {
  if (!validators.date(data.date)) {
    throw new ValidationError('Date is required and must be a valid date');
  }
  if (typeof data.duration !== 'number' || data.duration <= 0) {
    throw new ValidationError('Duration is required and must be positive');
  }
  if (!validators.stringArray(data.focusAreas)) {
    throw new ValidationError('Focus areas must be an array of strings');
  }
  if ((data.focusAreas as string[]).length === 0) {
    throw new ValidationError('At least one focus area is required');
  }
  if (data.songsWorkedOn !== undefined) {
    if (!validators.array(data.songsWorkedOn)) {
      throw new ValidationError('Songs worked on must be an array');
    }
    const songs = data.songsWorkedOn as unknown[];
    if (!songs.every(id => validators.positiveNumber(id))) {
      throw new ValidationError('All song IDs must be positive numbers');
    }
  }
  if (data.notes !== undefined && typeof data.notes !== 'string') {
    throw new ValidationError('Notes must be a string');
  }
  if (
    data.rating !== undefined &&
    (typeof data.rating !== 'number' || data.rating < 1 || data.rating > 5)
  ) {
    throw new ValidationError('Rating must be a number between 1 and 5');
  }
  if (!validators.positiveNumber(data.userId)) {
    throw new ValidationError('User ID is required and must be positive');
  }
  if (data.bandId !== undefined && !validators.positiveNumber(data.bandId)) {
    throw new ValidationError('Band ID must be positive if provided');
  }
};

export const validateGoal = (data: Record<string, unknown>): void => {
  if (!validators.nonEmptyString(data.title)) {
    throw new ValidationError('Goal title is required');
  }
  if (data.description !== undefined && typeof data.description !== 'string') {
    throw new ValidationError('Description must be a string');
  }
  if (!validators.oneOf(GOAL_TYPES.map(t => t.value))(data.type)) {
    throw new ValidationError('Type must be a valid goal type');
  }
  if (
    data.targetValue !== undefined &&
    (typeof data.targetValue !== 'number' || data.targetValue <= 0)
  ) {
    throw new ValidationError('Target value must be a positive number');
  }
  if (
    data.currentValue !== undefined &&
    (typeof data.currentValue !== 'number' || data.currentValue < 0)
  ) {
    throw new ValidationError('Current value must be a non-negative number');
  }
  if (data.unit !== undefined && typeof data.unit !== 'string') {
    throw new ValidationError('Unit must be a string');
  }
  if (data.targetDate !== undefined && !validators.date(data.targetDate)) {
    throw new ValidationError('Target date must be a valid date');
  }
  if (!validators.boolean(data.completed)) {
    throw new ValidationError('Completed status is required');
  }
  if (data.completedAt !== undefined && !validators.date(data.completedAt)) {
    throw new ValidationError('Completed date must be a valid date');
  }
  if (!validators.positiveNumber(data.userId)) {
    throw new ValidationError('User ID is required and must be positive');
  }
  if (data.bandId !== undefined && !validators.positiveNumber(data.bandId)) {
    throw new ValidationError('Band ID must be positive if provided');
  }
};

// Generic validator creator for extensibility
export const createValidator = (
  rules: Record<string, (value: unknown) => boolean | string>
): ((data: Record<string, unknown>) => void) => {
  return (data: Record<string, unknown>): void => {
    for (const [field, rule] of Object.entries(rules)) {
      const result = rule(data[field]);
      if (result === false) {
        throw new ValidationError(`${field} is invalid`);
      }
      if (typeof result === 'string') {
        throw new ValidationError(result);
      }
    }
  };
};
