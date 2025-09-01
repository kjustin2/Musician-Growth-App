<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let bands: Array<{ name: string; role: string; instrument: string }>;
  export let availableInstruments: string[];

  const dispatch = createEventDispatcher<{
    change: void;
  }>();

  let isAddingBand = false;
  let newBand = { name: '', role: '', instrument: '' };

  function addBand(): void {
    isAddingBand = true;
    newBand = { name: '', role: '', instrument: '' };
  }

  function cancelAddBand(): void {
    isAddingBand = false;
    newBand = { name: '', role: '', instrument: '' };
  }

  function saveBand(): void {
    if (newBand.name.trim() && newBand.role.trim() && newBand.instrument.trim()) {
      bands = [...bands, { ...newBand }];
      isAddingBand = false;
      newBand = { name: '', role: '', instrument: '' };
      dispatch('change');
    }
  }

  function removeBand(index: number): void {
    bands = bands.filter((_, i) => i !== index);
    dispatch('change');
  }

  function handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      saveBand();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      cancelAddBand();
    }
  }

  $: canSaveBand =
    newBand.name.trim() !== '' && newBand.role.trim() !== '' && newBand.instrument.trim() !== '';
</script>

<div class="bands-step">
  <div class="step-header">
    <p>
      Tell us about any bands you're currently in or have been part of. This is optional - you can
      skip this step or add bands later.
    </p>
  </div>

  <div class="bands-list">
    {#if bands.length > 0}
      <h3>Your Bands</h3>
      {#each bands as band, index}
        <div class="band-card">
          <div class="band-info">
            <div class="band-name">{band.name}</div>
            <div class="band-details">
              <span class="band-role">{band.role}</span>
              <span class="separator">•</span>
              <span class="band-instrument">{band.instrument}</span>
            </div>
          </div>
          <button
            type="button"
            class="remove-band"
            on:click={() => removeBand(index)}
            title="Remove band"
          >
            ×
          </button>
        </div>
      {/each}
    {/if}

    {#if isAddingBand}
      <div class="add-band-form">
        <h3>Add a Band</h3>
        <div class="form-row">
          <div class="form-group">
            <label for="band-name">Band Name</label>
            <input
              id="band-name"
              type="text"
              bind:value={newBand.name}
              placeholder="e.g., The Midnight Rockers"
              maxlength="50"
              on:keydown={handleKeydown}
            />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="band-role">Your Role</label>
            <input
              id="band-role"
              type="text"
              bind:value={newBand.role}
              placeholder="e.g., Lead Guitar, Backup Vocals"
              maxlength="30"
              on:keydown={handleKeydown}
            />
          </div>

          <div class="form-group">
            <label for="band-instrument">Instrument</label>
            <select id="band-instrument" bind:value={newBand.instrument}>
              <option value="">Select instrument</option>
              {#each availableInstruments as instrument}
                <option value={instrument}>{instrument}</option>
              {/each}
            </select>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="btn-secondary" on:click={cancelAddBand}> Cancel </button>
          <button type="button" class="btn-primary" disabled={!canSaveBand} on:click={saveBand}>
            Add Band
          </button>
        </div>
      </div>
    {:else}
      <button type="button" class="add-band-button" on:click={addBand}>
        <div class="add-icon">+</div>
        <span>Add a Band</span>
      </button>
    {/if}
  </div>

  <div class="step-info">
    <p>
      {#if bands.length === 0}
        No bands yet? No problem! You can always add them later in your profile settings.
      {:else}
        Great! You can add more bands anytime or continue to complete your setup.
      {/if}
    </p>
  </div>
</div>

<style>
  .bands-step {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    max-width: 600px;
    margin: 0 auto;
  }

  .step-header p {
    text-align: center;
    color: var(--color-text-primary);
    margin: 0;
  }

  .bands-list h3 {
    color: var(--color-text-primary);
    font-size: 1.1rem;
    margin-bottom: 1rem;
  }

  .band-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: white;
    border: 1px solid var(--color-border);
    border-radius: 8px;
    padding: 1rem;
    margin-bottom: 0.75rem;
  }

  .band-info {
    flex: 1;
  }

  .band-name {
    font-weight: 600;
    color: var(--color-text-primary);
    font-size: 1rem;
    margin-bottom: 0.25rem;
  }

  .band-details {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    color: var(--color-text-secondary);
  }

  .separator {
    color: var(--color-border);
  }

  .remove-band {
    background: none;
    border: none;
    color: var(--color-text-secondary);
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0.25rem;
    border-radius: 4px;
    transition: all 0.2s ease;
  }

  .remove-band:hover {
    background-color: var(--color-error-light);
    color: var(--color-error);
  }

  .add-band-form {
    background: var(--color-background-secondary);
    border: 1px solid var(--color-border);
    border-radius: 8px;
    padding: 1.5rem;
  }

  .add-band-form h3 {
    margin: 0 0 1rem 0;
    color: var(--color-text-primary);
  }

  .form-row {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .form-group {
    flex: 1;
  }

  .form-group label {
    display: block;
    font-weight: 500;
    color: var(--color-text-primary);
    margin-bottom: 0.25rem;
    font-size: 0.875rem;
  }

  .form-group input,
  .form-group select {
    width: 100%;
    padding: 0.625rem;
    border: 1px solid var(--color-border);
    border-radius: 4px;
    font-size: 0.875rem;
    transition: border-color 0.2s ease;
  }

  .form-group input:focus,
  .form-group select:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 2px rgba(var(--color-primary-rgb), 0.1);
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    margin-top: 1rem;
  }

  .btn-primary,
  .btn-secondary {
    padding: 0.625rem 1rem;
    border: none;
    border-radius: 4px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .btn-primary {
    background-color: var(--color-primary);
    color: white;
  }

  .btn-primary:hover:not(:disabled) {
    background-color: var(--color-primary-hover);
  }

  .btn-primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn-secondary {
    background-color: transparent;
    color: var(--color-text-secondary);
    border: 1px solid var(--color-border);
  }

  .btn-secondary:hover {
    background-color: var(--color-background-secondary);
  }

  .add-band-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    background: white;
    border: 2px dashed var(--color-border);
    border-radius: 8px;
    padding: 1.5rem;
    cursor: pointer;
    transition: all 0.2s ease;
    color: var(--color-text-secondary);
    font-size: 1rem;
  }

  .add-band-button:hover {
    border-color: var(--color-primary);
    color: var(--color-primary);
    background-color: var(--color-primary-light);
  }

  .add-icon {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background-color: var(--color-primary);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    font-weight: bold;
  }

  .step-info {
    text-align: center;
    color: var(--color-text-secondary);
    font-size: 0.875rem;
  }

  /* Mobile responsiveness */
  @media (max-width: 768px) {
    .form-row {
      flex-direction: column;
      gap: 0.75rem;
    }

    .form-actions {
      justify-content: stretch;
    }

    .form-actions button {
      flex: 1;
    }

    .band-card {
      padding: 0.875rem;
    }

    .band-details {
      flex-wrap: wrap;
    }
  }
</style>
