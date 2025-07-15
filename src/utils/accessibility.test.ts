import { describe, it, expect } from 'vitest';
import {
  calculateContrastRatio,
  validateTabAccessibility,
  validateElementAccessibility,
  validateKeyboardNavigation,
  validateResponsiveAccessibility,
  testColorCombinations,
  ACCESSIBILITY_COLORS
} from './accessibility';

describe('Accessibility Utils - Color Contrast', () => {
  it('should calculate correct contrast ratios', () => {
    // Test high contrast (black on white)
    const blackOnWhite = calculateContrastRatio('#000000', '#ffffff');
    expect(blackOnWhite.ratio).toBe(21);
    expect(blackOnWhite.level).toBe('AAA');
    expect(blackOnWhite.isValid).toBe(true);
    
    // Test low contrast (light gray on white)
    const lightGrayOnWhite = calculateContrastRatio('#f0f0f0', '#ffffff');
    expect(lightGrayOnWhite.ratio).toBeLessThan(4.5);
    expect(lightGrayOnWhite.level).toBe('fail');
    expect(lightGrayOnWhite.isValid).toBe(false);
    
    // Test our primary colors
    const primaryBlueOnWhite = calculateContrastRatio(ACCESSIBILITY_COLORS.PRIMARY_BLUE, ACCESSIBILITY_COLORS.TEXT_WHITE);
    expect(primaryBlueOnWhite.isValid).toBe(true);
    expect(primaryBlueOnWhite.ratio).toBeGreaterThanOrEqual(4.5);
  });

  it('should validate tab accessibility correctly', () => {
    // Test valid tab colors
    const validTabs = validateTabAccessibility(
      ACCESSIBILITY_COLORS.PRIMARY_BLUE,
      ACCESSIBILITY_COLORS.TEXT_WHITE,
      ACCESSIBILITY_COLORS.BACKGROUND_WHITE,
      ACCESSIBILITY_COLORS.TEXT_SECONDARY
    );
    
    expect(validTabs.isValid).toBe(true);
    expect(validTabs.errors).toHaveLength(0);
    
    // Test invalid tab colors
    const invalidTabs = validateTabAccessibility(
      '#f0f0f0', // Very light gray
      '#ffffff', // White text
      '#ffffff', // White background
      '#f5f5f5'  // Very light gray text
    );
    
    expect(invalidTabs.isValid).toBe(false);
    expect(invalidTabs.errors.length).toBeGreaterThan(0);
  });

  it('should test all predefined color combinations', () => {
    const result = testColorCombinations();
    
    // All our predefined colors should pass WCAG AA
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});

describe('Accessibility Utils - Element Validation', () => {
  it('should validate button elements correctly', () => {
    // Create a valid button element
    const validButton = document.createElement('button');
    validButton.type = 'button';
    validButton.textContent = 'Click me';
    
    const validResult = validateElementAccessibility(validButton);
    expect(validResult.isValid).toBe(true);
    expect(validResult.errors).toHaveLength(0);
    
    // Create an invalid button element
    const invalidButton = document.createElement('button');
    // Missing type and text content
    
    const invalidResult = validateElementAccessibility(invalidButton);
    expect(invalidResult.isValid).toBe(false);
    expect(invalidResult.errors.length).toBeGreaterThan(0);
  });

  it('should validate heading elements correctly', () => {
    // Create a valid heading
    const validHeading = document.createElement('h1');
    validHeading.textContent = 'Page Title';
    
    const validResult = validateElementAccessibility(validHeading);
    expect(validResult.isValid).toBe(true);
    
    // Create an invalid heading
    const invalidHeading = document.createElement('h1');
    // Empty heading
    
    const invalidResult = validateElementAccessibility(invalidHeading);
    expect(invalidResult.isValid).toBe(false);
    expect(invalidResult.errors).toContain('Heading element is empty');
  });

  it('should validate form elements correctly', () => {
    // Create a valid input with label
    const validInput = document.createElement('input');
    validInput.type = 'text';
    validInput.setAttribute('aria-label', 'Enter your name');
    
    const validResult = validateElementAccessibility(validInput);
    expect(validResult.isValid).toBe(true);
    
    // Create an invalid input without label
    const invalidInput = document.createElement('input');
    invalidInput.type = 'text';
    
    const invalidResult = validateElementAccessibility(invalidInput);
    expect(invalidResult.isValid).toBe(false);
    expect(invalidResult.errors).toContain('Form element missing accessible label');
  });
});

describe('Accessibility Utils - Keyboard Navigation', () => {
  it('should validate keyboard navigation for interactive elements', () => {
    // Create a valid button
    const validButton = document.createElement('button');
    validButton.type = 'button';
    validButton.textContent = 'Click me';
    
    // Mock the getComputedStyle to return a focus indicator
    const originalGetComputedStyle = window.getComputedStyle;
    window.getComputedStyle = vi.fn().mockReturnValue({
      outline: '2px solid blue',
      boxShadow: 'none',
      border: 'none'
    });
    
    const validResult = validateKeyboardNavigation(validButton);
    expect(validResult.isValid).toBe(true);
    
    // Restore original function
    window.getComputedStyle = originalGetComputedStyle;
  });

  it('should detect missing focus indicators', () => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = 'No focus indicator';
    
    // Mock getComputedStyle to return no focus indicator
    const originalGetComputedStyle = window.getComputedStyle;
    window.getComputedStyle = vi.fn().mockReturnValue({
      outline: 'none',
      boxShadow: 'none',
      border: 'none'
    });
    
    const result = validateKeyboardNavigation(button);
    expect(result.warnings).toContain('Interactive element should have visible focus indicator');
    
    // Restore original function
    window.getComputedStyle = originalGetComputedStyle;
  });
});

describe('Accessibility Utils - Responsive Design', () => {
  it('should validate touch target sizes on mobile', () => {
    // Create a small button
    const smallButton = document.createElement('button');
    smallButton.type = 'button';
    smallButton.textContent = 'Small';
    
    // Mock getBoundingClientRect to return small dimensions
    smallButton.getBoundingClientRect = vi.fn().mockReturnValue({
      width: 30,
      height: 30,
      top: 0,
      left: 0,
      bottom: 30,
      right: 30
    });
    
    const mobileResult = validateResponsiveAccessibility(smallButton, 480);
    expect(mobileResult.warnings).toContain('Touch target size (30x30) is below recommended 44x44px');
    
    // Test with adequate size
    smallButton.getBoundingClientRect = vi.fn().mockReturnValue({
      width: 44,
      height: 44,
      top: 0,
      left: 0,
      bottom: 44,
      right: 44
    });
    
    const validResult = validateResponsiveAccessibility(smallButton, 480);
    expect(validResult.warnings).not.toContain('Touch target size (44x44) is below recommended 44x44px');
  });

  it('should detect horizontal scrolling issues', () => {
    const wideElement = document.createElement('div');
    
    // Mock getBoundingClientRect to return width larger than viewport
    wideElement.getBoundingClientRect = vi.fn().mockReturnValue({
      width: 1200,
      height: 100,
      top: 0,
      left: 0,
      bottom: 100,
      right: 1200
    });
    
    const result = validateResponsiveAccessibility(wideElement, 800);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Element extends beyond viewport width, may cause horizontal scrolling');
  });

  it('should validate font sizes for mobile readability', () => {
    const smallTextElement = document.createElement('p');
    smallTextElement.textContent = 'Small text';
    
    // Mock getComputedStyle to return small font size
    const originalGetComputedStyle = window.getComputedStyle;
    window.getComputedStyle = vi.fn().mockReturnValue({
      fontSize: '12px'
    });
    
    const result = validateResponsiveAccessibility(smallTextElement, 480);
    expect(result.warnings).toContain('Font size below 14px may be difficult to read on mobile devices');
    
    // Restore original function
    window.getComputedStyle = originalGetComputedStyle;
  });
});

describe('Accessibility Utils - Constants', () => {
  it('should provide valid accessibility colors', () => {
    // Test that all predefined colors are valid hex colors
    const hexColorRegex = /^#[0-9A-F]{6}$/i;
    
    Object.values(ACCESSIBILITY_COLORS).forEach(color => {
      expect(color).toMatch(hexColorRegex);
    });
  });

  it('should ensure primary colors meet contrast requirements', () => {
    const primaryOnWhite = calculateContrastRatio(
      ACCESSIBILITY_COLORS.PRIMARY_BLUE,
      ACCESSIBILITY_COLORS.TEXT_WHITE
    );
    
    expect(primaryOnWhite.isValid).toBe(true);
    expect(primaryOnWhite.ratio).toBeGreaterThanOrEqual(4.5);
  });
});