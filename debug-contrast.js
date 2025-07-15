// Debug script to test contrast calculations
const calculateContrastRatio = (color1, color2) => {
  const getLuminance = (hex) => {
    const rgb = parseInt(hex.replace('#', ''), 16);
    const r = (rgb >> 16) & 255;
    const g = (rgb >> 8) & 255;
    const b = rgb & 255;
    
    const normalize = (c) => {
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
  
  let level = 'fail';
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

const ACCESSIBILITY_COLORS = {
  PRIMARY_BLUE: '#007bff',
  TEXT_WHITE: '#ffffff',
};

console.log('Testing contrast ratios:');
console.log('Primary Blue:', ACCESSIBILITY_COLORS.PRIMARY_BLUE);
console.log('Text White:', ACCESSIBILITY_COLORS.TEXT_WHITE);

const result = calculateContrastRatio(ACCESSIBILITY_COLORS.PRIMARY_BLUE, ACCESSIBILITY_COLORS.TEXT_WHITE);
console.log('Contrast Result:', result);

// Test black on white (should be 21:1)
const blackOnWhite = calculateContrastRatio('#000000', '#ffffff');
console.log('Black on White:', blackOnWhite);