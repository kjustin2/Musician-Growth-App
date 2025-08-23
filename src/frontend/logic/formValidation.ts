/**
 * Simplified form validation utilities
 */

export interface ValidationErrors {
    [key: string]: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validate individual fields
 */
export const validators = {
    email: (email: string): string | null => {
        if (!email) { return null; }
        return EMAIL_REGEX.test(email) ? null : 'Please enter a valid email address';
    },

    password: (password: string): string | null => {
        if (!password) { return null; }
        if (password.length < 8) { return 'Password must be at least 8 characters long'; }
        if (!/[A-Z]/.test(password)) { return 'Password must contain at least one uppercase letter'; }
        if (!/[a-z]/.test(password)) { return 'Password must contain at least one lowercase letter'; }
        if (!/[0-9]/.test(password)) { return 'Password must contain at least one number'; }
        return null;
    },

    confirmPassword: (password: string, confirmPassword: string): string | null => {
        if (!confirmPassword) { return null; }
        return password === confirmPassword ? null : 'Passwords do not match';
    }
};

/**
 * Validate forms with field mapping
 */
export function validateForm(fields: Record<string, string>, rules: Record<string, (value: string, fields?: Record<string, string>) => string | null>): ValidationErrors {
    const errors: ValidationErrors = {};

    for (const [field, validator] of Object.entries(rules)) {
        const error = validator(fields[field], fields);
        if (error) { errors[field] = error; }
    }

    return errors;
}

/**
 * Pre-configured form validators
 */
export const formValidators = {
    login: (email: string, password: string): ValidationErrors => validateForm(
        { email, password },
        {
            email: validators.email,
            password: (pwd: string) => pwd ? null : 'Password is required'
        }
    ),

    register: (email: string, password: string, confirmPassword: string): ValidationErrors => validateForm(
        { email, password, confirmPassword },
        {
            email: validators.email,
            password: validators.password,
            confirmPassword: (_: string, fields?: Record<string, string>) =>
                fields ? validators.confirmPassword(fields.password, fields.confirmPassword) : null
        }
    )
};