/**
 * Validation system
 */

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
};

export const validateItem = (data: Record<string, unknown>): void => {
  if (!validators.nonEmptyString(data.name)) {
    throw new ValidationError('Name is required');
  }
  if (data.description !== undefined && typeof data.description !== 'string') {
    throw new ValidationError('Description must be a string');
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
