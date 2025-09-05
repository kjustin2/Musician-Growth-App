import { derived, writable, get, type Readable, type Writable } from 'svelte/store';
import {
  GENRES,
  INSTRUMENTS,
  PLAY_FREQUENCIES,
  type OnboardingData,
} from '../../../backend/database/types.js';
import { debugLog, errorLog } from '../../../backend/logger.js';
import { onboardingService } from '../../../backend/services/onboarding/OnboardingService.js';

/**
 * Onboarding step definitions
 */
export const ONBOARDING_STEPS = [
  { id: 'instrument', title: 'Primary Instrument', description: 'What do you primarily play?' },
  { id: 'frequency', title: 'Play Frequency', description: 'How often do you play?' },
  { id: 'genres', title: 'Music Genres', description: 'What genres do you play?' },
  { id: 'bands', title: 'Band Information', description: 'Tell us about your bands (optional)' },
] as const;

export type OnboardingStepId = (typeof ONBOARDING_STEPS)[number]['id'];

/**
 * Onboarding state interface
 */
export interface OnboardingState {
  currentStep: OnboardingStepId;
  currentStepIndex: number;
  totalSteps: number;
  isLoading: boolean;
  error: string | null;
  canProceed: boolean;
  canGoBack: boolean;
  formData: OnboardingFormData;
}

/**
 * Form data structure
 */
export interface OnboardingFormData {
  primaryInstrument: string;
  customInstrument: string;
  playFrequency: OnboardingData['playFrequency'] | '';
  genres: string[];
  bands: Array<{
    name: string;
    role: string;
    instrument: string;
  }>;
}

/**
 * Create onboarding logic
 */
export function createOnboardingLogic(userId: number): {
  onboardingState: Readable<OnboardingState>;
  currentStep: Writable<OnboardingStepId>;
  isLoading: Writable<boolean>;
  error: Writable<string | null>;
  formData: Writable<OnboardingFormData>;

  // Actions
  nextStep: () => void;
  previousStep: () => void;
  goToStep: (stepId: OnboardingStepId) => void;
  updateFormData: <K extends keyof OnboardingFormData>(
    key: K,
    value: OnboardingFormData[K]
  ) => void;
  submitOnboarding: () => Promise<void>;
  clearError: () => void;

  // Data
  availableInstruments: string[];
  availableGenres: string[];
  playFrequencyOptions: typeof PLAY_FREQUENCIES;
} {
  // Internal stores
  const currentStep: Writable<OnboardingStepId> = writable('instrument');
  const isLoading: Writable<boolean> = writable(false);
  const error: Writable<string | null> = writable(null);
  const formData: Writable<OnboardingFormData> = writable({
    primaryInstrument: '',
    customInstrument: '',
    playFrequency: '',
    genres: [],
    bands: [],
  });

  // Derived state
  const currentStepIndex = derived(currentStep, $currentStep =>
    ONBOARDING_STEPS.findIndex(step => step.id === $currentStep)
  );

  const canProceed = derived([currentStep, formData], ([$currentStep, $formData]) => {
    switch ($currentStep) {
      case 'instrument':
        return (
          $formData.primaryInstrument !== '' &&
          ($formData.primaryInstrument !== 'Other' || $formData.customInstrument.trim() !== '')
        );
      case 'frequency':
        return $formData.playFrequency !== '';
      case 'genres':
        return $formData.genres.length > 0;
      case 'bands':
        return true; // Bands step is optional
      default:
        return false;
    }
  });

  const canGoBack = derived(currentStepIndex, $index => $index > 0);

  const onboardingState: Readable<OnboardingState> = derived(
    [currentStep, currentStepIndex, isLoading, error, canProceed, canGoBack, formData],
    ([
      $currentStep,
      $currentStepIndex,
      $isLoading,
      $error,
      $canProceed,
      $canGoBack,
      $formData,
    ]) => ({
      currentStep: $currentStep,
      currentStepIndex: $currentStepIndex,
      totalSteps: ONBOARDING_STEPS.length,
      isLoading: $isLoading,
      error: $error,
      canProceed: $canProceed,
      canGoBack: $canGoBack,
      formData: $formData,
    })
  );

  // Actions
  const clearError = (): void => {
    error.set(null);
  };

  const nextStep = (): void => {
    const index = get(currentStepIndex);
    if (index < ONBOARDING_STEPS.length - 1) {
      currentStep.set(ONBOARDING_STEPS[index + 1]!.id);
    }
  };

  const previousStep = (): void => {
    const index = get(currentStepIndex);
    if (index > 0) {
      currentStep.set(ONBOARDING_STEPS[index - 1]!.id);
    }
  };

  const goToStep = (stepId: OnboardingStepId): void => {
    const stepExists = ONBOARDING_STEPS.some(step => step.id === stepId);
    if (stepExists) {
      currentStep.set(stepId);
    }
  };

  const updateFormData = <K extends keyof OnboardingFormData>(
    key: K,
    value: OnboardingFormData[K]
  ): void => {
    formData.update(data => ({
      ...data,
      [key]: value,
    }));
    clearError();
  };

  const submitOnboarding = async (): Promise<void> => {
    debugLog('OnboardingLogic', 'Submitting onboarding data', { userId });

    try {
      clearError();
      isLoading.set(true);

      const $formData = await new Promise<OnboardingFormData>(resolve => {
        formData.subscribe(data => resolve(data))();
      });

      // Prepare onboarding data
      const onboardingData: OnboardingData = {
        primaryInstrument:
          $formData.primaryInstrument === 'Other'
            ? $formData.customInstrument
            : $formData.primaryInstrument,
        playFrequency: $formData.playFrequency as OnboardingData['playFrequency'],
        genres: $formData.genres,
        bands: $formData.bands,
      };

      // Submit to service
      await onboardingService.completeOnboarding(userId, onboardingData);

      debugLog('OnboardingLogic', 'Onboarding submitted successfully', { userId });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to complete onboarding';
      error.set(errorMessage);
      errorLog('OnboardingLogic', 'Failed to submit onboarding', err, { userId });
      throw err;
    } finally {
      isLoading.set(false);
    }
  };

  return {
    // State
    onboardingState,
    currentStep,
    isLoading,
    error,
    formData,

    // Actions
    nextStep,
    previousStep,
    goToStep,
    updateFormData,
    submitOnboarding,
    clearError,

    // Data
    availableInstruments: [...INSTRUMENTS],
    availableGenres: [...GENRES],
    playFrequencyOptions: PLAY_FREQUENCIES,
  };
}
