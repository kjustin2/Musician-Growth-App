/**
 * Validation function type
 */
export type ValidationFunction = (value: unknown) => string | null;

/**
 * Field validation rule
 */
export interface ValidationRule {
  validate: ValidationFunction;
}

/**
 * Validation schema type
 */
export type ValidationSchema = Record<string, ValidationRule>;

/**
 * Common validation functions that can be reused across schemas
 */
export const validators = {
  required:
    (fieldName: string): ValidationFunction =>
    (value: unknown): string | null => {
      if (value === undefined || value === null || value === '') {
        return `${fieldName} is required`;
      }
      return null;
    },

  string:
    (fieldName: string): ValidationFunction =>
    (value: unknown): string | null => {
      if (value !== undefined && value !== null && typeof value !== 'string') {
        return `${fieldName} must be a string`;
      }
      return null;
    },

  nonEmptyString:
    (fieldName: string): ValidationFunction =>
    (value: unknown): string | null => {
      if (!value || typeof value !== 'string') {
        return `${fieldName} is required and must be a string`;
      }
      if (value.trim().length === 0) {
        return `${fieldName} cannot be empty`;
      }
      return null;
    },

  date:
    (fieldName: string): ValidationFunction =>
    (value: unknown): string | null => {
      if (value && !(value instanceof Date)) {
        return `${fieldName} must be a Date object`;
      }
      return null;
    },

  number:
    (fieldName: string): ValidationFunction =>
    (value: unknown): string | null => {
      if (value !== undefined && value !== null && typeof value !== 'number') {
        return `${fieldName} must be a number`;
      }
      return null;
    },

  email:
    (fieldName: string): ValidationFunction =>
    (value: unknown): string | null => {
      if (value && typeof value === 'string') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          return `${fieldName} must be a valid email address`;
        }
      }
      return null;
    },
};
