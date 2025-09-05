/**
 * Simplified form validation utilities
 */

export interface ValidationErrors {
  [key: string]: string;
}

export interface TouchedFields {
  [key: string]: boolean;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validate individual fields
 */
export const validators = {
  email: (email: string): string | null => {
    if (!email) {
      return null;
    }
    return EMAIL_REGEX.test(email) ? null : 'Please enter a valid email address';
  },

  password: (password: string): string | null => {
    if (!password) {
      return null;
    }
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/[a-z]/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/[0-9]/.test(password)) {
      return 'Password must contain at least one number';
    }
    return null;
  },

  confirmPassword: (password: string, confirmPassword: string): string | null => {
    if (!confirmPassword) {
      return null;
    }
    return password === confirmPassword ? null : 'Passwords do not match';
  },

  required: (value: string): string | null => {
    return value && value.trim() ? null : 'This field is required';
  },

  requiredArray: (value: string[]): string | null => {
    return value && value.length > 0 ? null : 'Please select at least one option';
  },

  maxLength:
    (maxLength: number) =>
    (value: string): string | null => {
      if (!value) {
        return null;
      }
      return value.length <= maxLength ? null : `Maximum ${maxLength} characters allowed`;
    },

  customInstrument: (primaryInstrument: string, customInstrument: string): string | null => {
    if (primaryInstrument !== 'Other') {
      return null;
    }
    return customInstrument && customInstrument.trim() ? null : 'Please specify your instrument';
  },

  bandName: (value: string): string | null => {
    if (!value) {
      return null;
    }
    return value.trim() ? null : 'Band name cannot be empty';
  },

  bandRole: (value: string): string | null => {
    if (!value) {
      return null;
    }
    return value.trim() ? null : 'Role cannot be empty';
  },
};

/**
 * Validate forms with field mapping and touched state
 */
export function validateForm(
  fields: Record<string, string>,
  rules: Record<string, (value: string, fields?: Record<string, string>) => string | null>,
  touchedFields: TouchedFields = {},
  showAllErrors: boolean = false
): ValidationErrors {
  const errors: ValidationErrors = {};

  for (const [field, validator] of Object.entries(rules)) {
    const fieldValue = fields[field];
    if (fieldValue !== undefined) {
      // Only show errors if field has been touched or we're showing all errors (e.g., on submit)
      if (showAllErrors || touchedFields[field]) {
        const error = validator(fieldValue, fields);
        if (error) {
          errors[field] = error;
        }
      }
    }
  }

  return errors;
}

/**
 * Onboarding-specific validation
 */
export interface OnboardingValidationState {
  primaryInstrument: string;
  customInstrument: string;
  playFrequency: string;
  genres: string[];
  bands: Array<{ name: string; role: string; instrument: string }>;
}

export function validateOnboardingStep(
  step: 'instrument' | 'frequency' | 'genres' | 'bands',
  data: OnboardingValidationState
): ValidationErrors {
  const errors: ValidationErrors = {};

  switch (step) {
    case 'instrument':
      if (!data.primaryInstrument) {
        errors.primaryInstrument = 'Please select an instrument';
      } else if (data.primaryInstrument === 'Other' && !data.customInstrument?.trim()) {
        errors.customInstrument = 'Please specify your instrument';
      }
      break;

    case 'frequency':
      if (!data.playFrequency) {
        errors.playFrequency = 'Please select how often you play';
      }
      break;

    case 'genres':
      if (!data.genres || data.genres.length === 0) {
        errors.genres = 'Please select at least one genre';
      }
      break;

    case 'bands':
      // Bands step is optional, but validate individual bands if they exist
      if (data.bands?.length && data.bands.length > 0) {
        data.bands.forEach((band, index) => {
          if (band.name && !band.name.trim()) {
            errors[`band_${index}_name`] = 'Band name cannot be empty';
          }
          if (band.role && !band.role.trim()) {
            errors[`band_${index}_role`] = 'Role cannot be empty';
          }
          if (!band.instrument) {
            errors[`band_${index}_instrument`] = 'Please select an instrument';
          }
        });
      }
      break;
  }

  return errors;
}

export function validateCompleteOnboarding(data: OnboardingValidationState): ValidationErrors {
  const errors: ValidationErrors = {};

  // Validate all required steps
  const instrumentErrors = validateOnboardingStep('instrument', data);
  const frequencyErrors = validateOnboardingStep('frequency', data);
  const genresErrors = validateOnboardingStep('genres', data);
  const bandsErrors = validateOnboardingStep('bands', data);

  return {
    ...errors,
    ...instrumentErrors,
    ...frequencyErrors,
    ...genresErrors,
    ...bandsErrors,
  };
}

/**
 * Pre-configured form validators
 */
export const formValidators = {
  login: (
    email: string,
    password: string,
    touchedFields: TouchedFields = {},
    showAllErrors: boolean = false
  ): ValidationErrors =>
    validateForm(
      { email, password },
      {
        email: validators.email,
        password: (pwd: string) => (pwd ? null : 'Password is required'),
      },
      touchedFields,
      showAllErrors
    ),

  register: (
    email: string,
    password: string,
    confirmPassword: string,
    touchedFields: TouchedFields = {},
    showAllErrors: boolean = false
  ): ValidationErrors =>
    validateForm(
      { email, password, confirmPassword },
      {
        email: validators.email,
        password: validators.password,
        confirmPassword: (_: string, fields?: Record<string, string>) =>
          fields?.password && fields.confirmPassword
            ? validators.confirmPassword(fields.password, fields.confirmPassword)
            : null,
      },
      touchedFields,
      showAllErrors
    ),

  onboardingInstrument: (
    primaryInstrument: string,
    customInstrument: string,
    touchedFields: TouchedFields = {},
    showAllErrors: boolean = false
  ): ValidationErrors => {
    const data: OnboardingValidationState = {
      primaryInstrument,
      customInstrument,
      playFrequency: '',
      genres: [],
      bands: [],
    };
    return showAllErrors || touchedFields.primaryInstrument || touchedFields.customInstrument
      ? validateOnboardingStep('instrument', data)
      : {};
  },

  onboardingFrequency: (
    playFrequency: string,
    touchedFields: TouchedFields = {},
    showAllErrors: boolean = false
  ): ValidationErrors => {
    const data: OnboardingValidationState = {
      primaryInstrument: '',
      customInstrument: '',
      playFrequency,
      genres: [],
      bands: [],
    };
    return showAllErrors || touchedFields.playFrequency
      ? validateOnboardingStep('frequency', data)
      : {};
  },

  onboardingGenres: (
    genres: string[],
    touchedFields: TouchedFields = {},
    showAllErrors: boolean = false
  ): ValidationErrors => {
    const data: OnboardingValidationState = {
      primaryInstrument: '',
      customInstrument: '',
      playFrequency: '',
      genres,
      bands: [],
    };
    return showAllErrors || touchedFields.genres ? validateOnboardingStep('genres', data) : {};
  },
};
