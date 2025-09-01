<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { User } from '../../../../backend/database/types.js';
  import { createOnboardingLogic, ONBOARDING_STEPS } from '$lib/logic/onboardingLogic';
  import OnboardingProgress from './OnboardingProgress.svelte';
  import InstrumentStep from './InstrumentStep.svelte';
  import PlayFrequencyStep from './PlayFrequencyStep.svelte';
  import GenresStep from './GenresStep.svelte';
  import BandsStep from './BandsStep.svelte';

  export let user: User;

  const dispatch = createEventDispatcher<{
    complete: void;
  }>();

  const onboardingLogic = createOnboardingLogic(user.id!);
  const { onboardingState, formData, nextStep, previousStep, submitOnboarding, clearError } = onboardingLogic;

  let isSubmitting = false;

  function handleNext(): void {
    if ($onboardingState.currentStep === 'bands') {
      // Last step - submit onboarding
      void handleSubmitPromise();
    } else {
      nextStep();
    }
  }

  function handlePrevious(): void {
    previousStep();
  }

  async function handleSubmit(): Promise<void> {
    try {
      isSubmitting = true;
      await submitOnboarding();
      dispatch('complete');
    } catch {
      // Error is handled by the onboarding logic
    } finally {
      isSubmitting = false;
    }
  }

  function handleStepClick(stepId: (typeof ONBOARDING_STEPS)[number]['id']): void {
    // Allow clicking on previous steps or current step
    const targetIndex = ONBOARDING_STEPS.findIndex(step => step.id === stepId);
    const currentIndex = $onboardingState.currentStepIndex;

    if (targetIndex <= currentIndex) {
      onboardingLogic.goToStep(stepId);
    }
  }

  async function handleSubmitPromise(): Promise<void> {
    await handleSubmit();
  }

  $: currentStepConfig = ONBOARDING_STEPS.find(step => step.id === $onboardingState.currentStep);
  $: isLastStep = $onboardingState.currentStep === 'bands';
</script>

<div class="onboarding-flow">
  <div class="onboarding-header">
    <h1>Welcome to ChordLine!</h1>
    <p>Let's set up your profile to personalize your musical journey.</p>
  </div>

  <OnboardingProgress
    steps={ONBOARDING_STEPS}
    currentStep={$onboardingState.currentStep}
    currentStepIndex={$onboardingState.currentStepIndex}
    onStepClick={handleStepClick}
  />

  <div class="onboarding-content">
    <div class="step-header">
      <h2>{currentStepConfig?.title}</h2>
      <p class="step-description">{currentStepConfig?.description}</p>
    </div>

    <div class="step-content">
      {#if $onboardingState.currentStep === 'instrument'}
        <InstrumentStep
          bind:selectedInstrument={$formData.primaryInstrument}
          bind:customInstrument={$formData.customInstrument}
          availableInstruments={onboardingLogic.availableInstruments}
          on:change={() => clearError()}
        />
      {:else if $onboardingState.currentStep === 'frequency'}
        <PlayFrequencyStep
          bind:selectedFrequency={$formData.playFrequency}
          frequencyOptions={onboardingLogic.playFrequencyOptions}
          on:change={() => clearError()}
        />
      {:else if $onboardingState.currentStep === 'genres'}
        <GenresStep
          bind:selectedGenres={$formData.genres}
          availableGenres={onboardingLogic.availableGenres}
          on:change={() => clearError()}
        />
      {:else if $onboardingState.currentStep === 'bands'}
        <BandsStep
          bind:bands={$formData.bands}
          availableInstruments={onboardingLogic.availableInstruments}
          on:change={() => clearError()}
        />
      {/if}
    </div>

    {#if $onboardingState.error}
      <div class="error-message">
        <p>{$onboardingState.error}</p>
        <button type="button" class="error-close" on:click={clearError}>×</button>
      </div>
    {/if}

    <div class="step-actions">
      <button
        type="button"
        class="btn-secondary"
        disabled={!$onboardingState.canGoBack || $onboardingState.isLoading || isSubmitting}
        on:click={handlePrevious}
      >
        Previous
      </button>

      <button
        type="button"
        class="btn-primary"
        disabled={!$onboardingState.canProceed || $onboardingState.isLoading || isSubmitting}
        on:click={handleNext}
      >
        {#if isSubmitting}
          Completing...
        {:else if isLastStep}
          Complete Setup
        {:else}
          Next
        {/if}
      </button>
    </div>
  </div>
</div>

<style>
  .onboarding-flow {
    max-width: 600px;
    margin: 0 auto;
    padding: 2rem;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .onboarding-header {
    text-align: center;
    margin-bottom: 2rem;
  }

  .onboarding-header h1 {
    color: var(--color-primary);
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }

  .onboarding-header p {
    color: var(--color-text-secondary);
    font-size: 1.1rem;
  }

  .onboarding-content {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .step-header {
    text-align: center;
    margin-bottom: 2rem;
  }

  .step-header h2 {
    color: var(--color-text-primary);
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
  }

  .step-description {
    color: var(--color-text-secondary);
    font-size: 1rem;
  }

  .step-content {
    flex: 1;
    margin-bottom: 2rem;
  }

  .error-message {
    background-color: var(--color-error-background);
    border: 1px solid var(--color-error);
    border-radius: 4px;
    padding: 1rem;
    margin-bottom: 1rem;
    position: relative;
    color: var(--color-error);
  }

  .error-close {
    position: absolute;
    top: 0.5rem;
    right: 0.75rem;
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: var(--color-error);
    line-height: 1;
  }

  .error-close:hover {
    opacity: 0.7;
  }

  .step-actions {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    padding-top: 1rem;
    border-top: 1px solid var(--color-border);
  }

  .btn-primary,
  .btn-secondary {
    flex: 1;
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    min-height: 44px;
  }

  .btn-primary {
    background-color: var(--color-primary);
    color: white;
  }

  .btn-primary:hover:not(:disabled) {
    background-color: var(--color-primary-hover);
  }

  .btn-secondary {
    background-color: transparent;
    color: var(--color-text-secondary);
    border: 1px solid var(--color-border);
  }

  .btn-secondary:hover:not(:disabled) {
    background-color: var(--color-background-secondary);
    color: var(--color-text-primary);
  }

  .btn-primary:disabled,
  .btn-secondary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    .onboarding-flow {
      padding: 1rem;
    }

    .onboarding-header h1 {
      font-size: 1.5rem;
    }

    .step-header h2 {
      font-size: 1.25rem;
    }

    .step-actions {
      flex-direction: column;
    }

    .step-actions button {
      flex: none;
    }
  }
</style>
