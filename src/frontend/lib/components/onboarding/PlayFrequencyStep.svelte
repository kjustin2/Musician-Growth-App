<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { PLAY_FREQUENCIES } from '../../../../backend/database/types.js';

  export let selectedFrequency: string;
  export let frequencyOptions: typeof PLAY_FREQUENCIES;

  const dispatch = createEventDispatcher<{
    change: void;
  }>();

  function handleFrequencySelect(frequency: string): void {
    selectedFrequency = frequency;
    dispatch('change');
  }
</script>

<div class="frequency-step">
  <div class="frequency-options">
    {#each frequencyOptions as option}
      <button
        type="button"
        class="frequency-option"
        class:selected={selectedFrequency === option.value}
        on:click={() => handleFrequencySelect(option.value)}
      >
        <div class="frequency-icon">
          {#if option.value === 'daily'}
            🌟
          {:else if option.value === 'several-times-week'}
            🔥
          {:else if option.value === 'weekly'}
            📅
          {:else if option.value === 'monthly'}
            📆
          {:else}
            ⏰
          {/if}
        </div>
        <div class="frequency-content">
          <span class="frequency-label">{option.label}</span>
          <span class="frequency-description">
            {#if option.value === 'daily'}
              Perfect for rapid skill building
            {:else if option.value === 'several-times-week'}
              Great for steady progress
            {:else if option.value === 'weekly'}
              Good for maintaining skills
            {:else if option.value === 'monthly'}
              Casual playing and enjoyment
            {:else}
              Playing when inspiration strikes
            {/if}
          </span>
        </div>
      </button>
    {/each}
  </div>

  <div class="step-info">
    <p>
      How often do you typically play your instrument? This helps us tailor your experience and set
      appropriate goals.
    </p>
  </div>
</div>

<style>
  .frequency-step {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .frequency-options {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    max-width: 500px;
    margin: 0 auto;
  }

  .frequency-option {
    background: white;
    border: 2px solid var(--color-border);
    border-radius: 8px;
    padding: 1rem;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 1rem;
    text-align: left;
    width: 100%;
  }

  .frequency-option:hover {
    border-color: var(--color-primary);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .frequency-option.selected {
    border-color: var(--color-primary);
    background-color: var(--color-primary-light);
    box-shadow: 0 2px 8px rgba(var(--color-primary-rgb), 0.2);
  }

  .frequency-icon {
    font-size: 1.5rem;
    line-height: 1;
    flex-shrink: 0;
  }

  .frequency-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .frequency-label {
    font-size: 1rem;
    font-weight: 600;
    color: var(--color-text-primary);
    display: block;
  }

  .frequency-description {
    font-size: 0.875rem;
    color: var(--color-text-secondary);
    display: block;
  }

  .step-info {
    text-align: center;
    color: var(--color-text-secondary);
    font-size: 0.875rem;
    max-width: 500px;
    margin: 0 auto;
  }

  /* Mobile responsiveness */
  @media (max-width: 768px) {
    .frequency-option {
      padding: 0.875rem;
      gap: 0.75rem;
    }

    .frequency-icon {
      font-size: 1.25rem;
    }

    .frequency-label {
      font-size: 0.9rem;
    }

    .frequency-description {
      font-size: 0.8rem;
    }
  }

  @media (max-width: 480px) {
    .frequency-option {
      flex-direction: column;
      text-align: center;
      gap: 0.5rem;
    }

    .frequency-content {
      align-items: center;
    }
  }
</style>
