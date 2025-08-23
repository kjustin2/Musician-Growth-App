/**
 * Simplified UI utility functions
 */

/**
 * Check if form is ready for submission
 */
export function isFormReady(
    requiredFields: string[],
    values: Record<string, string>,
    errors: Record<string, string>
): boolean {
    const hasAllFields = requiredFields.every(field => values[field]?.trim());
    const hasNoErrors = Object.keys(errors).length === 0;
    return hasAllFields && hasNoErrors;
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