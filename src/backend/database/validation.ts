/**
 * Validation system
 */
import { PLAY_FREQUENCIES } from './types.js';

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
