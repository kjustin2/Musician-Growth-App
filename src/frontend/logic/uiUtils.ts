/**
 * Shared UI utility functions
 */

/**
 * Check if form has validation errors
 */
export function hasValidationErrors(errors: Record<string, string>): boolean {
    return Object.keys(errors).length > 0;
}

/**
 * Check if form is ready for submission
 */
export function isFormReady(
    requiredFields: string[],
    values: Record<string, string>,
    errors: Record<string, string>
): boolean {
    // Check if all required fields have values
    const hasAllRequiredFields = requiredFields.every(field => values[field]?.trim());

    // Check if there are no validation errors
    const hasNoErrors = !hasValidationErrors(errors);

    return hasAllRequiredFields && hasNoErrors;
}

/**
 * Sanitize user input for display
 */
export function sanitizeForDisplay(input: string): string {
    return input.trim();
}

/**
 * Format user greeting
 */
export function formatUserGreeting(email: string): string {
    return `Welcome back, ${email}!`;
}

/**
 * Get loading button text
 */
export function getLoadingButtonText(isLoading: boolean, defaultText: string, loadingText: string): string {
    return isLoading ? loadingText : defaultText;
}