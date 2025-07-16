import { describe, it, expect, vi } from 'vitest';
import {
  calculateContrastRatio,
  validateTabAccessibility,
  validateElementAccessibility,
  validateKeyboardNavigation,
  validateResponsiveAccessibility,
  validateAccessibility,
  testColorCombinations,
  ACCESSIBILITY_COLORS
} from './accessibility';

describe('Accessibility Utils - Color Contrast', () => {
  it('should calculate correct contrast ratios', () => {
    // Test high contrast (black on white) - should be exactly 21:1
    const blackOnWhite = calculateContrastRatio('#000000', '#ffffff');
    expect(blackOnWhite.ratio).toBe(21);
    expect(blackOnWhite.level).toBe('AAA');
    expect(blackOnWhite.isValid).toBe(true);
    
    // Test low contrast (light gray on white)
    const lightGrayOnWhite = calculateContrastRatio('#f0f0f0', '#ffffff');
    expect(lightGrayOnWhite.ratio).toBeLessThan(4.5);
    expect(lightGrayOnWhite.level).toBe('fail');
    expect(lightGrayOnWhite.isValid).toBe(false);
    
    // Test our updated primary colors (should meet WCAG AA standards)
    const primaryBlueOnWhite = calculateContrastRatio(ACCESSIBILITY_COLORS.PRIMARY_BLUE, ACCESSIBILITY_COLORS.TEXT_WHITE);
    expect(primaryBlueOnWhite.isValid).toBe(true);
    expect(primaryBlueOnWhite.ratio).toBeGreaterThanOrEqual(4.5);
    
    // Test precision with known values
    const grayOnWhite = calculateContrastRatio('#767676', '#ffffff');
    expect(grayOnWhite.ratio).toBeCloseTo(4.54, 1); // Should be around 4.54:1
    expect(grayOnWhite.level).toBe('AA');
  });

  it('should validate tab accessibility correctly', () => {
    // Test valid tab colors with updated ACCESSIBILITY_COLORS
    const validTabs = validateTabAccessibility(
      ACCESSIBILITY_COLORS.PRIMARY_BLUE,
      ACCESSIBILITY_COLORS.TEXT_WHITE,
      ACCESSIBILITY_COLORS.BACKGROUND_WHITE,
      ACCESSIBILITY_COLORS.TEXT_SECONDARY
    );
    
    expect(validTabs.isValid).toBe(true);
    expect(validTabs.errors).toHaveLength(0);
    
    // Test invalid tab colors (insufficient contrast)
    const invalidTabs = validateTabAccessibility(
      '#f0f0f0', // Very light gray background
      '#ffffff', // White text (poor contrast)
      '#ffffff', // White background  
      '#f5f5f5'  // Very light gray text (poor contrast)
    );
    
    expect(invalidTabs.isValid).toBe(false);
    expect(invalidTabs.errors.length).toBeGreaterThan(0);
    expect(invalidTabs.errors[0]).toContain('contrast ratio');
    
    // Test edge case with borderline contrast
    const borderlineTabs = validateTabAccessibility(
      '#767676', // Should be around 4.5:1 contrast
      '#ffffff',
      '#000000',
      '#ffffff'
    );
    
    expect(borderlineTabs.isValid).toBe(true);
    expect(borderlineTabs.errors).toHaveLength(0);
  });

  it('should test all predefined color combinations', () => {
    const result = testColorCombinations();
    
    // All our predefined colors should pass WCAG AA (updated colors are compliant)
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
    
    // May have some warnings for colors that meet AA but not AAA
    // This is acceptable as we're targeting WCAG AA compliance
    if (result.warnings.length > 0) {
      result.warnings.forEach(warning => {
        expect(warning).toContain('meets AA');
      });
    }
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
    expect(invalidResult.errors[0]).toContain('Button element missing type attribute');
    
    // Test button with invalid type
    const invalidTypeButton = document.createElement('button');
    invalidTypeButton.setAttribute('type', 'invalid');
    invalidTypeButton.textContent = 'Test';
    
    const invalidTypeResult = validateElementAccessibility(invalidTypeButton);
    expect(invalidTypeResult.isValid).toBe(false);
    expect(invalidTypeResult.errors[0]).toContain('Button type "invalid" is invalid');
    
    // Test button with aria-label instead of text
    const ariaButton = document.createElement('button');
    ariaButton.type = 'button';
    ariaButton.setAttribute('aria-label', 'Close dialog');
    
    const ariaResult = validateElementAccessibility(ariaButton);
    expect(ariaResult.isValid).toBe(true);
    expect(ariaResult.errors).toHaveLength(0);
  });

  it('should validate heading elements correctly', () => {
    // Create a valid heading
    const validHeading = document.createElement('h1');
    validHeading.textContent = 'Page Title';
    
    const validResult = validateElementAccessibility(validHeading);
    expect(validResult.isValid).toBe(true);
    
    // Create an invalid heading (empty)
    const invalidHeading = document.createElement('h1');
    // Empty heading
    
    const invalidResult = validateElementAccessibility(invalidHeading);
    expect(invalidResult.isValid).toBe(false);
    expect(invalidResult.errors).toContain('Heading element is empty (headings must contain meaningful content)');
    
    // Test heading hierarchy warning
    const h3Heading = document.createElement('h3');
    h3Heading.textContent = 'Subsection';
    // Not inside a section element
    
    const h3Result = validateElementAccessibility(h3Heading);
    expect(h3Result.isValid).toBe(true); // Still valid, but may have warnings
    // May have warning about heading hierarchy
  });

  it('should validate form elements correctly', () => {
    // Create a valid input with aria-label
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
    expect(invalidResult.errors).toContain('Form element missing accessible label (aria-label, aria-labelledby, associated label, or title)');
    
    // Test placeholder-only input (accessibility anti-pattern)
    const placeholderInput = document.createElement('input');
    placeholderInput.type = 'text';
    placeholderInput.setAttribute('placeholder', 'Enter your email');
    
    const placeholderResult = validateElementAccessibility(placeholderInput);
    expect(placeholderResult.isValid).toBe(false);
    expect(placeholderResult.errors).toContain('Input using placeholder as only label is inaccessible - provide proper label');
    
    // Test required input with proper attributes
    const requiredInput = document.createElement('input');
    requiredInput.type = 'email';
    requiredInput.required = true;
    requiredInput.setAttribute('aria-label', 'Email address');
    
    const requiredResult = validateElementAccessibility(requiredInput);
    expect(requiredResult.isValid).toBe(true);
    // May have warnings about aria-required or autocomplete
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
    window.getComputedStyle = vi.fn()
      .mockReturnValueOnce({
        // First call - normal style
        outline: 'none',
        boxShadow: 'none',
        border: 'none',
        backgroundColor: 'rgb(255, 255, 255)'
      })
      .mockReturnValueOnce({
        // Second call with :focus pseudo-class
        outline: '2px solid blue',
        boxShadow: 'none',
        border: 'none',
        backgroundColor: 'rgb(255, 255, 255)'
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
    window.getComputedStyle = vi.fn()
      .mockReturnValue({
        // Normal style
        outline: 'none',
        boxShadow: 'none',
        border: 'none',
        backgroundColor: 'rgb(255, 255, 255)'
      })
      .mockReturnValueOnce({
        // First call - normal style
        outline: 'none',
        boxShadow: 'none',
        border: 'none',
        backgroundColor: 'rgb(255, 255, 255)'
      })
      .mockReturnValueOnce({
        // Second call - :focus style (same as normal, no focus indicator)
        outline: 'none',
        boxShadow: 'none',
        border: 'none',
        backgroundColor: 'rgb(255, 255, 255)'
      });
    
    const result = validateKeyboardNavigation(button);
    expect(result.warnings).toContain('Interactive element should have visible focus indicator (outline, box-shadow, border, or background change)');
    
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
    
    // Mock getComputedStyle for font size
    const originalGetComputedStyle = window.getComputedStyle;
    window.getComputedStyle = vi.fn().mockReturnValue({
      fontSize: '16px',
      lineHeight: 'normal',
      width: '30px',
      height: '30px',
      maxWidth: 'none',
      overflow: 'visible',
      overflowX: 'visible'
    });
    
    const mobileResult = validateResponsiveAccessibility(smallButton, 480);
    expect(mobileResult.isValid).toBe(false);
    expect(mobileResult.errors).toContain('Touch target size (30x30px) is below WCAG 2.1 minimum of 44x44px on mobile');
    
    // Test with adequate size
    smallButton.getBoundingClientRect = vi.fn().mockReturnValue({
      width: 44,
      height: 44,
      top: 0,
      left: 0,
      bottom: 44,
      right: 44
    });
    
    window.getComputedStyle = vi.fn().mockReturnValue({
      fontSize: '16px',
      lineHeight: 'normal',
      width: '44px',
      height: '44px',
      maxWidth: 'none',
      overflow: 'visible',
      overflowX: 'visible'
    });
    
    const validResult = validateResponsiveAccessibility(smallButton, 480);
    expect(validResult.isValid).toBe(true);
    
    // Restore original function
    window.getComputedStyle = originalGetComputedStyle;
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
    
    // Mock getComputedStyle
    const originalGetComputedStyle = window.getComputedStyle;
    window.getComputedStyle = vi.fn().mockReturnValue({
      fontSize: '16px',
      lineHeight: 'normal',
      width: '1200px',
      height: '100px',
      overflow: 'visible',
      overflowX: 'visible'
    });
    
    const result = validateResponsiveAccessibility(wideElement, 800);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Element width (1200px) exceeds viewport width (800px), causing horizontal scroll');
    
    // Restore original function
    window.getComputedStyle = originalGetComputedStyle;
  });

  it('should validate font sizes for mobile readability', () => {
    const smallTextElement = document.createElement('p');
    smallTextElement.textContent = 'Small text';
    
    // Mock getBoundingClientRect
    smallTextElement.getBoundingClientRect = vi.fn().mockReturnValue({
      width: 200,
      height: 20,
      top: 0,
      left: 0,
      bottom: 20,
      right: 200
    });
    
    // Mock getComputedStyle to return small font size
    const originalGetComputedStyle = window.getComputedStyle;
    window.getComputedStyle = vi.fn().mockReturnValue({
      fontSize: '12px',
      lineHeight: 'normal',
      width: '200px',
      height: '20px',
      overflow: 'visible',
      overflowX: 'visible'
    });
    
    const result = validateResponsiveAccessibility(smallTextElement, 480);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Font size 12px is below 14px minimum for mobile readability');
    
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
    
    // Test that the updated primary blue has better contrast than the old one
    const oldBlueOnWhite = calculateContrastRatio('#007bff', '#ffffff');
    expect(primaryOnWhite.ratio).toBeGreaterThan(oldBlueOnWhite.ratio);
    
    // Test dark primary blue has even better contrast
    const darkPrimaryOnWhite = calculateContrastRatio(
      ACCESSIBILITY_COLORS.PRIMARY_BLUE_DARK,
      ACCESSIBILITY_COLORS.TEXT_WHITE
    );
    
    expect(darkPrimaryOnWhite.isValid).toBe(true);
    expect(darkPrimaryOnWhite.ratio).toBeGreaterThan(primaryOnWhite.ratio);
  });
});

describe('Accessibility Utils - Edge Cases and Comprehensive Validation', () => {
  it('should handle invalid hex colors gracefully', () => {
    expect(() => calculateContrastRatio('invalid', '#ffffff')).toThrow('Invalid hex color format');
    expect(() => calculateContrastRatio('#ff', '#ffffff')).not.toThrow(); // Should pad short hex
    expect(() => calculateContrastRatio('rgb(255,255,255)', '#ffffff')).toThrow(); // Invalid format for this function
  });

  it('should validate exact boundary contrast ratios', () => {
    // Test exactly 4.5:1 ratio (AA boundary)
    const boundaryAA = calculateContrastRatio('#767676', '#ffffff');
    expect(boundaryAA.ratio).toBeCloseTo(4.54, 1);
    expect(boundaryAA.level).toBe('AA');
    expect(boundaryAA.isValid).toBe(true);

    // Test exactly 7:1 ratio (AAA boundary) 
    const boundaryAAA = calculateContrastRatio('#595959', '#ffffff');
    expect(boundaryAAA.ratio).toBeGreaterThanOrEqual(7);
    expect(boundaryAAA.level).toBe('AAA');
  });

  it('should validate comprehensive accessibility with all options', () => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = 'Test Button';
    button.style.backgroundColor = '#0056b3';
    button.style.color = '#ffffff';

    // Mock all required functions
    button.getBoundingClientRect = vi.fn().mockReturnValue({
      width: 44,
      height: 44,
      top: 0,
      left: 0,
      bottom: 44,
      right: 44
    });

    const originalGetComputedStyle = window.getComputedStyle;
    window.getComputedStyle = vi.fn().mockReturnValue({
      fontSize: '16px',
      lineHeight: '1.5',
      backgroundColor: 'rgb(0, 86, 179)',
      color: 'rgb(255, 255, 255)',
      outline: '2px solid blue',
      boxShadow: 'none',
      border: 'none',
      width: '44px',
      height: '44px',
      overflow: 'visible',
      overflowX: 'visible'
    });

    const result = validateAccessibility(button, {
      checkContrast: true,
      checkKeyboard: true,
      checkResponsive: true,
      checkTabAccessibility: true,
      viewportWidth: 480,
      activeTabColor: ACCESSIBILITY_COLORS.PRIMARY_BLUE,
      activeTabTextColor: ACCESSIBILITY_COLORS.TEXT_WHITE,
      inactiveTabColor: ACCESSIBILITY_COLORS.BACKGROUND_WHITE,
      inactiveTabTextColor: ACCESSIBILITY_COLORS.TEXT_SECONDARY,
      strictMode: false
    });

    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);

    // Restore original function
    window.getComputedStyle = originalGetComputedStyle;
  });

  it('should handle elements with special accessibility requirements', () => {
    // Test image validation
    const img = document.createElement('img');
    img.src = 'test.jpg';
    
    const imgWithoutAlt = validateElementAccessibility(img);
    expect(imgWithoutAlt.isValid).toBe(false);
    expect(imgWithoutAlt.errors).toContain('Image element missing alt attribute (required for accessibility)');

    // Test image with empty alt (decorative)
    img.alt = '';
    const decorativeImg = validateElementAccessibility(img);
    expect(decorativeImg.isValid).toBe(true);

    // Test link validation
    const link = document.createElement('a');
    link.href = '#';
    link.textContent = 'click here'; // Generic text

    const linkResult = validateElementAccessibility(link);
    expect(linkResult.isValid).toBe(true);
    expect(linkResult.warnings.some(w => w.includes('not descriptive'))).toBe(true);

    // Test link that opens in new window
    link.target = '_blank';
    link.textContent = 'External link';
    
    const newWindowLink = validateElementAccessibility(link);
    expect(newWindowLink.isValid).toBe(true);
    expect(newWindowLink.warnings.some(w => w.includes('opens in new window'))).toBe(true);
  });

  it('should validate complex form elements', () => {
    // Test multi-select
    const select = document.createElement('select');
    select.multiple = true;
    select.setAttribute('aria-label', 'Choose options');

    const selectResult = validateElementAccessibility(select);
    expect(selectResult.isValid).toBe(true);
    expect(selectResult.warnings.some(w => w.includes('aria-multiselectable'))).toBe(true);

    // Test required input without aria-required
    const requiredInput = document.createElement('input');
    requiredInput.type = 'email';
    requiredInput.required = true;
    requiredInput.setAttribute('aria-label', 'Email');

    const requiredResult = validateElementAccessibility(requiredInput);
    expect(requiredResult.isValid).toBe(true);
    expect(requiredResult.warnings.some(w => w.includes('aria-required'))).toBe(true);
  });

  it('should handle responsive edge cases', () => {
    const element = document.createElement('div');
    element.textContent = 'Very long text content that should be tested for mobile readability and potential line length issues on smaller screens';

    element.getBoundingClientRect = vi.fn().mockReturnValue({
      width: 300,
      height: 100,
      top: 0,
      left: 0,
      bottom: 100,
      right: 300
    });

    const originalGetComputedStyle = window.getComputedStyle;
    window.getComputedStyle = vi.fn().mockReturnValue({
      fontSize: '14px',
      lineHeight: '1.2',
      width: '300px',
      height: '100px',
      overflow: 'visible',
      overflowX: 'visible'
    });

    const result = validateResponsiveAccessibility(element, 480);
    
    // Should pass font size but may have line height warning
    expect(result.isValid).toBe(true); // No errors for 14px on mobile
    expect(result.warnings.some(w => w.includes('Line height ratio'))).toBe(true);

    // Restore original function
    window.getComputedStyle = originalGetComputedStyle;
  });

  it('should validate keyboard navigation edge cases', () => {
    // Test positive tabindex (should warn)
    const positiveTabButton = document.createElement('button');
    positiveTabButton.type = 'button';
    positiveTabButton.textContent = 'Button';
    positiveTabButton.setAttribute('tabindex', '5');

    const result = validateKeyboardNavigation(positiveTabButton);
    expect(result.isValid).toBe(true); // Valid but should warn
    expect(result.warnings.some(w => w.includes('positive tabindex'))).toBe(true);

    // Test element with focus class
    const focusClassButton = document.createElement('button');
    focusClassButton.type = 'button';
    focusClassButton.textContent = 'Focus Button';
    focusClassButton.className = 'btn-focus-ring';

    const focusClassResult = validateKeyboardNavigation(focusClassButton);
    expect(focusClassResult.isValid).toBe(true);
    // Should detect focus handling from class name
  });

  it('should test color conversion edge cases', () => {
    // Test the rgbToHex helper function indirectly through comprehensive validation
    const colorElement = document.createElement('div');
    colorElement.style.backgroundColor = 'rgb(0, 86, 179)';
    colorElement.style.color = 'rgb(255, 255, 255)';

    const originalGetComputedStyle = window.getComputedStyle;
    window.getComputedStyle = vi.fn().mockReturnValue({
      backgroundColor: 'rgb(0, 86, 179)',
      color: 'rgb(255, 255, 255)',
      fontSize: '16px'
    });

    const result = validateAccessibility(colorElement, {
      checkContrast: true,
      checkKeyboard: false,
      checkResponsive: false
    });

    expect(result.isValid).toBe(true);

    // Test with rgba (with alpha)
    window.getComputedStyle = vi.fn().mockReturnValue({
      backgroundColor: 'rgba(0, 86, 179, 0.8)',
      color: 'rgba(255, 255, 255, 1)',
      fontSize: '16px'
    });

    const alphaResult = validateAccessibility(colorElement, {
      checkContrast: true,
      checkKeyboard: false,
      checkResponsive: false
    });

    expect(alphaResult.isValid).toBe(true);

    // Restore original function
    window.getComputedStyle = originalGetComputedStyle;
  });

  it('should handle error conditions gracefully', () => {
    const element = document.createElement('div');
    
    // Test with invalid computed style
    const originalGetComputedStyle = window.getComputedStyle;
    window.getComputedStyle = vi.fn().mockImplementation(() => {
      throw new Error('Style computation failed');
    });

    const result = validateAccessibility(element);
    // The function should still be valid since contrast validation errors go to warnings by default
    expect(result.isValid).toBe(true);
    expect(result.warnings.some(e => e.includes('Contrast validation failed'))).toBe(true);

    // Test with strict mode to make warnings become errors
    const strictResult = validateAccessibility(element, { strictMode: true });
    expect(strictResult.isValid).toBe(false);
    expect(strictResult.errors.some(e => e.includes('Contrast validation failed'))).toBe(true);

    // Restore original function
    window.getComputedStyle = originalGetComputedStyle;
  });
});