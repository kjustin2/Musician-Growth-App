<script lang="ts">
  import type { OnboardingStepId } from '$lib/logic/onboardingLogic';

  export let steps: readonly { id: OnboardingStepId; title: string; description: string }[];
  export let currentStep: OnboardingStepId;
  export let currentStepIndex: number;
  export let onStepClick: (stepId: OnboardingStepId) => void;
</script>

<div class="progress-container">
  <div class="progress-steps">
    {#each steps as step, index}
      <div
        class="progress-step"
        class:active={step.id === currentStep}
        class:completed={index < currentStepIndex}
        class:clickable={index <= currentStepIndex}
        role="button"
        tabindex={index <= currentStepIndex ? 0 : -1}
        on:click={() => index <= currentStepIndex && onStepClick(step.id)}
        on:keydown={e =>
          (e.key === 'Enter' || e.key === ' ') && index <= currentStepIndex && onStepClick(step.id)}
      >
        <div class="step-number">
          {#if index < currentStepIndex}
            <svg class="check-icon" viewBox="0 0 20 20" fill="currentColor">
              <path
                fill-rule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clip-rule="evenodd"
              />
            </svg>
          {:else}
            <span>{index + 1}</span>
          {/if}
        </div>
        <span class="step-title">{step.title}</span>
      </div>

      {#if index < steps.length - 1}
        <div class="progress-line" class:completed={index < currentStepIndex}></div>
      {/if}
    {/each}
  </div>

  <div class="progress-bar-container">
    <div class="progress-bar">
      <div
        class="progress-bar-fill"
        style="width: {((currentStepIndex + 1) / steps.length) * 100}%"
      ></div>
    </div>
    <div class="progress-text">
      Step {currentStepIndex + 1} of {steps.length}
    </div>
  </div>
</div>

<style>
  .progress-container {
    margin-bottom: 2rem;
  }

  .progress-steps {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .progress-step {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    min-width: 80px;
    color: var(--color-text-secondary);
    transition: all 0.2s ease;
  }

  .progress-step.clickable {
    cursor: pointer;
  }

  .progress-step.clickable:hover {
    color: var(--color-primary);
  }

  .progress-step.active {
    color: var(--color-primary);
  }

  .progress-step.completed {
    color: var(--color-success);
  }

  .step-number {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 0.875rem;
    margin-bottom: 0.5rem;
    border: 2px solid currentColor;
    background-color: white;
    transition: all 0.2s ease;
  }

  .progress-step.active .step-number {
    background-color: var(--color-primary);
    color: white;
    border-color: var(--color-primary);
  }

  .progress-step.completed .step-number {
    background-color: var(--color-success);
    color: white;
    border-color: var(--color-success);
  }

  .check-icon {
    width: 16px;
    height: 16px;
  }

  .step-title {
    font-size: 0.75rem;
    font-weight: 500;
    max-width: 80px;
    word-break: break-word;
  }

  .progress-line {
    width: 40px;
    height: 2px;
    background-color: var(--color-border);
    transition: background-color 0.2s ease;
    margin: 0 0.5rem;
    margin-top: -16px; /* Align with step numbers */
  }

  .progress-line.completed {
    background-color: var(--color-success);
  }

  .progress-bar-container {
    text-align: center;
  }

  .progress-bar {
    width: 100%;
    height: 4px;
    background-color: var(--color-background-secondary);
    border-radius: 2px;
    overflow: hidden;
    margin-bottom: 0.5rem;
  }

  .progress-bar-fill {
    height: 100%;
    background-color: var(--color-primary);
    border-radius: 2px;
    transition: width 0.3s ease;
  }

  .progress-text {
    font-size: 0.875rem;
    color: var(--color-text-secondary);
    font-weight: 500;
  }

  /* Mobile responsiveness */
  @media (max-width: 768px) {
    .progress-steps {
      display: none; /* Hide detailed steps on mobile */
    }

    .progress-bar-container {
      margin-bottom: 1rem;
    }

    .progress-text {
      font-size: 1rem;
    }
  }

  @media (max-width: 480px) {
    .step-title {
      font-size: 0.625rem;
      max-width: 60px;
    }

    .step-number {
      width: 28px;
      height: 28px;
      font-size: 0.75rem;
    }

    .progress-line {
      width: 20px;
      margin: 0 0.25rem;
      margin-top: -14px;
    }
  }
</style>
