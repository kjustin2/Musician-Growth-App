/**
 * Accessibility utility functions for testing and validation
 */

export interface ColorContrastResult {
  ratio: number;
  level: 'AA' | 'AAA' | 'fail';
  isValid: boolean;
}

export interface AccessibilityValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Calculate the contrast ratio between two colors
 * @param color1 - First color in hex format (e.g., '#007bff')
 * @param color2 - Second color in hex format (e.g., '#ffffff')
 * @returns ColorContrastResult object
 */
export const calculateContrastRatio = (color1: string, color2: string): ColorContrastResult => {
  const getLuminance = (hex: string): number => {
    const rgb = parseInt(hex.replace('#', ''), 16);
    const r = (rgb >> 16) & 255;
    const g = (rgb >> 8) & 255;
    const b = rgb & 255;
    
    const normalize = (c: number) => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    };
    
    const rNorm = normalize(r);
    const gNorm = normalize(g);
    const bNorm = normalize(b);
    
    return 0.2126 * rNorm + 0.7152 * gNorm + 0.0722 * bNorm;
  };
  
  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);
  
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  
  const ratio = (lighter + 0.05) / (darker + 0.05);
  
  let level: 'AA' | 'AAA' | 'fail' = 'fail';
  if (ratio >= 7) {
    level = 'AAA';
  } else if (ratio >= 4.5) {
    level = 'AA';
  }
  
  return {
    ratio,
    level,
    isValid: ratio >= 4.5
  };
};

/**
 * Validate tab navigation accessibility
 * @param activeColor - Active tab background color
 * @param activeTextColor - Active tab text color
 * @param inactiveColor - Inactive tab background color
 * @param inactiveTextColor - Inactive tab text color
 */
export const validateTabAccessibility = (
  activeColor: string,
  activeTextColor: string,
  inactiveColor: string,
  inactiveTextColor: string
): AccessibilityValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check active tab contrast
  const activeContrast = calculateContrastRatio(activeColor, activeTextColor);
  if (!activeContrast.isValid) {
    errors.push(`Active tab contrast ratio ${activeContrast.ratio.toFixed(2)} is below WCAG AA minimum of 4.5:1`);
  }
  
  // Check inactive tab contrast
  const inactiveContrast = calculateContrastRatio(inactiveColor, inactiveTextColor);
  if (!inactiveContrast.isValid) {
    errors.push(`Inactive tab contrast ratio ${inactiveContrast.ratio.toFixed(2)} is below WCAG AA minimum of 4.5:1`);
  }
  
  // Check for AAA level compliance
  if (activeContrast.level === 'AA') {
    warnings.push('Active tab contrast meets AA but not AAA standards');
  }
  if (inactiveContrast.level === 'AA') {
    warnings.push('Inactive tab contrast meets AA but not AAA standards');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Validate element accessibility attributes
 * @param element - DOM element to validate
 */
export const validateElementAccessibility = (element: HTMLElement): AccessibilityValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check for proper button attributes
  if (element.tagName === 'BUTTON') {
    if (!element.hasAttribute('type')) {
      errors.push('Button element missing type attribute');
    }
    
    if (!element.textContent?.trim() && !element.hasAttribute('aria-label')) {
      errors.push('Button element missing accessible name');
    }
    
    if (element.hasAttribute('disabled') && element.getAttribute('tabindex') === '-1') {
      warnings.push('Disabled button should not have tabindex="-1"');
    }
  }
  
  // Check for proper heading hierarchy
  if (element.tagName.match(/^H[1-6]$/)) {
    if (!element.textContent?.trim()) {
      errors.push('Heading element is empty');
    }
  }
  
  // Check for proper form labels
  if (element.tagName === 'INPUT' || element.tagName === 'SELECT' || element.tagName === 'TEXTAREA') {
    const hasLabel = element.hasAttribute('aria-label') || 
                    element.hasAttribute('aria-labelledby') ||
                    document.querySelector(`label[for="${element.id}"]`) !== null;
    
    if (!hasLabel) {
      errors.push('Form element missing accessible label');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Validate keyboard navigation support
 * @param element - DOM element to validate
 */
export const validateKeyboardNavigation = (element: HTMLElement): AccessibilityValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check if interactive elements are focusable
  const interactiveTags = ['BUTTON', 'INPUT', 'SELECT', 'TEXTAREA', 'A'];
  
  if (interactiveTags.includes(element.tagName)) {
    const tabIndex = element.getAttribute('tabindex');
    
    if (tabIndex === '-1' && !element.hasAttribute('disabled')) {
      errors.push('Interactive element should not have tabindex="-1" unless disabled');
    }
    
    // Check for focus indicators
    const computedStyle = window.getComputedStyle(element, ':focus');
    if (!computedStyle.outline || computedStyle.outline === 'none') {
      if (!computedStyle.boxShadow && !computedStyle.border) {
        warnings.push('Interactive element should have visible focus indicator');
      }
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Validate responsive design accessibility
 * @param element - DOM element to validate
 * @param viewportWidth - Current viewport width
 */
export const validateResponsiveAccessibility = (
  element: HTMLElement, 
  viewportWidth: number
): AccessibilityValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  const rect = element.getBoundingClientRect();
  
  // Check minimum touch target size on mobile
  if (viewportWidth <= 768) {
    const minTouchSize = 44; // 44px is the recommended minimum touch target size
    
    if (element.tagName === 'BUTTON' || element.tagName === 'A') {
      if (rect.width < minTouchSize || rect.height < minTouchSize) {
        warnings.push(`Touch target size (${rect.width}x${rect.height}) is below recommended 44x44px`);
      }
    }
  }
  
  // Check for horizontal scrolling
  if (rect.width > viewportWidth) {
    errors.push('Element extends beyond viewport width, may cause horizontal scrolling');
  }
  
  // Check for proper scaling
  const fontSize = parseFloat(window.getComputedStyle(element).fontSize);
  if (fontSize < 14) {
    warnings.push('Font size below 14px may be difficult to read on mobile devices');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Run comprehensive accessibility validation on an element
 * @param element - DOM element to validate
 * @param options - Validation options
 */
export const validateAccessibility = (
  element: HTMLElement,
  options: {
    checkContrast?: boolean;
    checkKeyboard?: boolean;
    checkResponsive?: boolean;
    viewportWidth?: number;
  } = {}
): AccessibilityValidationResult => {
  const allErrors: string[] = [];
  const allWarnings: string[] = [];
  
  // Basic element validation
  const elementValidation = validateElementAccessibility(element);
  allErrors.push(...elementValidation.errors);
  allWarnings.push(...elementValidation.warnings);
  
  // Keyboard navigation validation
  if (options.checkKeyboard !== false) {
    const keyboardValidation = validateKeyboardNavigation(element);
    allErrors.push(...keyboardValidation.errors);
    allWarnings.push(...keyboardValidation.warnings);
  }
  
  // Responsive design validation
  if (options.checkResponsive && options.viewportWidth) {
    const responsiveValidation = validateResponsiveAccessibility(element, options.viewportWidth);
    allErrors.push(...responsiveValidation.errors);
    allWarnings.push(...responsiveValidation.warnings);
  }
  
  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings
  };
};

/**
 * CSS variables for accessibility-compliant colors
 */
export const ACCESSIBILITY_COLORS = {
  // Primary colors with WCAG AA compliance
  PRIMARY_BLUE: '#007bff',
  PRIMARY_BLUE_DARK: '#0056b3',
  
  // Text colors
  TEXT_PRIMARY: '#2c3e50',
  TEXT_SECONDARY: '#6c757d',
  TEXT_WHITE: '#ffffff',
  
  // Background colors
  BACKGROUND_LIGHT: '#f8f9fa',
  BACKGROUND_WHITE: '#ffffff',
  
  // Status colors
  SUCCESS_GREEN: '#28a745',
  WARNING_YELLOW: '#ffc107',
  DANGER_RED: '#dc3545',
  INFO_BLUE: '#17a2b8',
  
  // Gray scale
  GRAY_100: '#f8f9fa',
  GRAY_200: '#e9ecef',
  GRAY_300: '#dee2e6',
  GRAY_400: '#ced4da',
  GRAY_500: '#adb5bd',
  GRAY_600: '#6c757d',
  GRAY_700: '#495057',
  GRAY_800: '#343a40',
  GRAY_900: '#212529',
} as const;

/**
 * Test all color combinations for WCAG compliance
 */
export const testColorCombinations = (): AccessibilityValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Test primary combinations
  const primaryOnWhite = calculateContrastRatio(ACCESSIBILITY_COLORS.PRIMARY_BLUE, ACCESSIBILITY_COLORS.TEXT_WHITE);
  if (!primaryOnWhite.isValid) {
    errors.push('Primary blue on white does not meet WCAG AA contrast requirements');
  }
  
  const textOnBackground = calculateContrastRatio(ACCESSIBILITY_COLORS.TEXT_PRIMARY, ACCESSIBILITY_COLORS.BACKGROUND_LIGHT);
  if (!textOnBackground.isValid) {
    errors.push('Primary text on light background does not meet WCAG AA contrast requirements');
  }
  
  const secondaryTextOnWhite = calculateContrastRatio(ACCESSIBILITY_COLORS.TEXT_SECONDARY, ACCESSIBILITY_COLORS.BACKGROUND_WHITE);
  if (!secondaryTextOnWhite.isValid) {
    errors.push('Secondary text on white background does not meet WCAG AA contrast requirements');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};