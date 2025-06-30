// Form Configuration
export const FORM_STEPS = {
  TOTAL: 5,
  INSTRUMENT: 1,
  PERFORMANCE_FREQUENCY: 2,
  CROWD_SIZE: 3,
  EXPERIENCE: 4,
  MARKETING_EFFORTS: 5,
} as const;

// Recommendation Engine Configuration
export const RECOMMENDATION_CONFIG = {
  MIN_RECOMMENDATIONS: 3,
  MAX_RECOMMENDATIONS: 5,
  LOADING_DELAY_MS: 2000,
} as const;

// Form Validation
export const EXPERIENCE_LIMITS = {
  MIN: 0,
  MAX: 50,
} as const;

// Instruments
export const INSTRUMENTS = [
  'Guitar', 'Piano', 'Vocals', 'Drums', 'Bass', 'Violin', 
  'Saxophone', 'Trumpet', 'Flute', 'Keyboard', 'Ukulele', 'Other'
] as const;

// Marketing Options
export const MARKETING_OPTIONS = [
  { id: 'social', label: 'Social Media (Facebook, Instagram, TikTok)' },
  { id: 'mailing', label: 'Mailing List' },
  { id: 'website', label: 'Website/Blog' },
  { id: 'posters', label: 'Posters/Fliers' },
  { id: 'networking', label: 'Networking with other musicians' },
  { id: 'none', label: 'None of the above' }
] as const;

// Step Labels for Progress Bar
export const STEP_LABELS = [
  'Instrument',
  'Performance Frequency',
  'Crowd Size',
  'Experience',
  'Marketing Efforts'
] as const;