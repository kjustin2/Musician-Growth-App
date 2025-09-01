<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let selectedGenres: string[];
  export let availableGenres: string[];

  const dispatch = createEventDispatcher<{
    change: void;
  }>();

  function handleGenreToggle(genre: string): void {
    if (selectedGenres.includes(genre)) {
      selectedGenres = selectedGenres.filter(g => g !== genre);
    } else {
      selectedGenres = [...selectedGenres, genre];
    }
    dispatch('change');
  }

  function isSelected(genre: string): boolean {
    return selectedGenres.includes(genre);
  }

  $: selectedCount = selectedGenres.length;
</script>

<div class="genres-step">
  <div class="selection-info">
    <p>Select all the music genres you play or are interested in playing.</p>
    <div class="selection-count">
      Selected: {selectedCount} genre{selectedCount !== 1 ? 's' : ''}
      {#if selectedCount === 0}
        <span class="requirement">(Please select at least one)</span>
      {/if}
    </div>
  </div>

  <div class="genres-grid">
    {#each availableGenres as genre}
      <button
        type="button"
        class="genre-option"
        class:selected={isSelected(genre)}
        on:click={() => handleGenreToggle(genre)}
      >
        <div class="genre-icon">
          {#if genre === 'Rock'}
            🤘
          {:else if genre === 'Pop'}
            🎵
          {:else if genre === 'Jazz'}
            🎺
          {:else if genre === 'Blues'}
            🎸
          {:else if genre === 'Country'}
            🤠
          {:else if genre === 'Classical'}
            🎼
          {:else if genre === 'Electronic'}
            🎛️
          {:else if genre === 'Hip Hop'}
            🎤
          {:else if genre === 'R&B'}
            🎶
          {:else if genre === 'Folk'}
            🪕
          {:else if genre === 'Metal'}
            ⚡
          {:else if genre === 'Indie'}
            🎧
          {:else}
            🎭
          {/if}
        </div>
        <span class="genre-name">{genre}</span>
        {#if isSelected(genre)}
          <div class="selected-check">✓</div>
        {/if}
      </button>
    {/each}
  </div>

  <div class="step-info">
    <p>
      Don't worry if you're not sure about some genres - you can always update your preferences
      later in settings.
    </p>
  </div>
</div>

<style>
  .genres-step {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .selection-info {
    text-align: center;
    color: var(--color-text-primary);
  }

  .selection-info p {
    margin-bottom: 0.5rem;
    font-size: 1rem;
  }

  .selection-count {
    font-size: 0.875rem;
    color: var(--color-text-secondary);
    font-weight: 500;
  }

  .requirement {
    color: var(--color-warning);
    font-weight: 600;
  }

  .genres-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 0.75rem;
    max-width: 700px;
    margin: 0 auto;
  }

  .genre-option {
    background: white;
    border: 2px solid var(--color-border);
    border-radius: 8px;
    padding: 0.875rem;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    min-height: 90px;
    text-align: center;
    position: relative;
  }

  .genre-option:hover {
    border-color: var(--color-primary);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .genre-option.selected {
    border-color: var(--color-primary);
    background-color: var(--color-primary-light);
    box-shadow: 0 2px 8px rgba(var(--color-primary-rgb), 0.2);
  }

  .genre-icon {
    font-size: 1.5rem;
    line-height: 1;
  }

  .genre-name {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--color-text-primary);
  }

  .selected-check {
    position: absolute;
    top: 0.25rem;
    right: 0.25rem;
    width: 20px;
    height: 20px;
    background-color: var(--color-primary);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: bold;
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
    .genres-grid {
      grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
      gap: 0.5rem;
    }

    .genre-option {
      padding: 0.75rem;
      min-height: 75px;
    }

    .genre-icon {
      font-size: 1.25rem;
    }

    .genre-name {
      font-size: 0.75rem;
    }
  }

  @media (max-width: 480px) {
    .genres-grid {
      grid-template-columns: repeat(3, 1fr);
    }

    .genre-option {
      padding: 0.5rem;
      min-height: 65px;
    }

    .genre-name {
      font-size: 0.7rem;
    }
  }
</style>
