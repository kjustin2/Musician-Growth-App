<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let selectedInstrument: string;
  export let customInstrument: string;
  export let availableInstruments: string[];

  const dispatch = createEventDispatcher<{
    change: void;
  }>();

  function handleInstrumentSelect(instrument: string): void {
    selectedInstrument = instrument;
    if (instrument !== 'Other') {
      customInstrument = '';
    }
    dispatch('change');
  }

  function handleCustomInstrumentChange(): void {
    dispatch('change');
  }
</script>

<div class="instrument-step">
  <div class="instrument-grid">
    {#each availableInstruments as instrument}
      <button
        type="button"
        class="instrument-option"
        class:selected={selectedInstrument === instrument}
        on:click={() => handleInstrumentSelect(instrument)}
      >
        <div class="instrument-icon">
          {#if instrument === 'Guitar'}
            🎸
          {:else if instrument === 'Bass'}
            🎸
          {:else if instrument === 'Drums'}
            🥁
          {:else if instrument === 'Keyboard/Piano'}
            🎹
          {:else if instrument === 'Vocals'}
            🎤
          {:else if instrument === 'Saxophone'}
            🎷
          {:else if instrument === 'Trumpet'}
            🎺
          {:else if instrument === 'Violin'}
            🎻
          {:else}
            🎵
          {/if}
        </div>
        <span class="instrument-name">{instrument}</span>
      </button>
    {/each}
  </div>

  {#if selectedInstrument === 'Other'}
    <div class="custom-instrument">
      <label for="custom-instrument" class="custom-label"> What instrument do you play? </label>
      <input
        id="custom-instrument"
        type="text"
        bind:value={customInstrument}
        on:input={handleCustomInstrumentChange}
        placeholder="Enter your instrument"
        class="custom-input"
        maxlength="50"
      />
    </div>
  {/if}

  <div class="step-info">
    <p>
      Select your primary instrument - the one you play most often or consider yourself most skilled
      with.
    </p>
  </div>
</div>

<style>
  .instrument-step {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .instrument-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 1rem;
    max-width: 600px;
    margin: 0 auto;
  }

  .instrument-option {
    background: white;
    border: 2px solid var(--color-border);
    border-radius: 8px;
    padding: 1rem;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    min-height: 100px;
    text-align: center;
  }

  .instrument-option:hover {
    border-color: var(--color-primary);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .instrument-option.selected {
    border-color: var(--color-primary);
    background-color: var(--color-primary-light);
    box-shadow: 0 2px 8px rgba(var(--color-primary-rgb), 0.2);
  }

  .instrument-icon {
    font-size: 2rem;
    line-height: 1;
  }

  .instrument-name {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--color-text-primary);
  }

  .custom-instrument {
    max-width: 400px;
    margin: 0 auto;
    text-align: center;
  }

  .custom-label {
    display: block;
    font-weight: 500;
    color: var(--color-text-primary);
    margin-bottom: 0.5rem;
    font-size: 1rem;
  }

  .custom-input {
    width: 100%;
    padding: 0.75rem;
    border: 2px solid var(--color-border);
    border-radius: 4px;
    font-size: 1rem;
    text-align: center;
    transition: border-color 0.2s ease;
  }

  .custom-input:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.1);
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
    .instrument-grid {
      grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
      gap: 0.75rem;
    }

    .instrument-option {
      padding: 0.75rem;
      min-height: 80px;
    }

    .instrument-icon {
      font-size: 1.5rem;
    }

    .instrument-name {
      font-size: 0.75rem;
    }
  }

  @media (max-width: 480px) {
    .instrument-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
</style>
