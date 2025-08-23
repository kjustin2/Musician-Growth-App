/**
 * Shared form validation utilities
 */

export interface ValidationErrors {
    [key: string]: string;
}

/**
 * Email validation - overloaded for different input types
 */
export function validateEmail(email: string): string | null {
    if (!email) { return null; }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return 'Please enter a valid email address';
    }

    return null;
}

/**
 * Password validation for registration
 */
export function validatePassword(password: string): string | null {
    if (!password) { return null; }

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
}

/**
 * Password confirmation validation
 */
export function validatePasswordConfirmation(password: string, confirmPassword: string): string | null {
    if (!confirmPassword) { return null; }

    if (password !== confirmPassword) {
        return 'Passwords do not match';
    }

    return null;
}

/**
 * Login form validation
 */
export function validateLoginForm(email: string, password: string): ValidationErrors {
    const errors: ValidationErrors = {};

    const emailError = validateEmail(email);
    if (emailError) {
        errors.email = emailError;
    }

    if (password && password.length < 1) {
        errors.password = 'Password is required';
    }

    return errors;
}

/**
 * Registration form validation
 */
export function validateRegistrationForm(
    email: string,
    password: string,
    confirmPassword: string
): ValidationErrors {
    const errors: ValidationErrors = {};

    const emailError = validateEmail(email);
    if (emailError) {
        errors.email = emailError;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
        errors.password = passwordError;
    }

    const confirmPasswordError = validatePasswordConfirmation(password, confirmPassword);
    if (confirmPasswordError) {
        errors.confirmPassword = confirmPasswordError;
    }

    return errors;
}