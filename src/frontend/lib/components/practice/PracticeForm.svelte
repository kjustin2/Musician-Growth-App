<script lang="ts">
  import { onMount } from 'svelte';
  import { practiceService, songService, type User } from '../../../../backend/database/db.js';
  import type { CreatePractice, Song } from '../../../../backend/database/types.js';
  import { FOCUS_AREAS } from '../../../../backend/database/types.js';

  export let user: User;
  export let selectedBandId: number | null = null;
  export let onSave: (practice: CreatePractice) => void;
  export let onCancel: () => void;

  let isLoading = false;
  const formData = {
    date: new Date().toISOString().split('T')[0],
    duration: 60,
    focusAreas: [] as string[],
    songsWorkedOn: [] as number[],
    notes: '',
    rating: 3,
  };
  let availableSongs: Song[] = [];
  let errors: Record<string, string> = {};

  onMount(async () => {
    await loadSongs();
  });

  async function loadSongs(): Promise<void> {
    try {
      if (selectedBandId) {
        availableSongs = await songService.findByBandId(selectedBandId);
      } else {
        availableSongs = await songService.findByUserId(user.id);
      }
    } catch (error) {
      console.error('Failed to load songs:', error);
    }
  }

  function handleFocusAreaToggle(area: string): void {
    if (formData.focusAreas.includes(area)) {
      formData.focusAreas = formData.focusAreas.filter(a => a !== area);
    } else {
      formData.focusAreas = [...formData.focusAreas, area];
    }
  }

  function handleSongToggle(songId: number): void {
    if (formData.songsWorkedOn.includes(songId)) {
      formData.songsWorkedOn = formData.songsWorkedOn.filter(id => id !== songId);
    } else {
      formData.songsWorkedOn = [...formData.songsWorkedOn, songId];
    }
  }

  function validateForm(): boolean {
    errors = {};

    if (!formData.date) {
      errors.date = 'Date is required';
    }

    if (formData.duration <= 0) {
      errors.duration = 'Duration must be greater than 0';
    }

    if (formData.focusAreas.length === 0) {
      errors.focusAreas = 'At least one focus area is required';
    }

    if (formData.rating < 1 || formData.rating > 5) {
      errors.rating = 'Rating must be between 1 and 5';
    }

    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(): Promise<void> {
    if (!validateForm()) {
      return;
    }

    try {
      isLoading = true;

      const practiceData: CreatePractice = {
        date: new Date(formData.date),
        duration: formData.duration,
        focusAreas: formData.focusAreas,
        songsWorkedOn: formData.songsWorkedOn.length > 0 ? formData.songsWorkedOn : undefined,
        notes: formData.notes || undefined,
        rating: formData.rating,
        userId: user.id!,
        bandId: selectedBandId || undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await onSave(practiceData);
    } catch (error) {
      console.error('Failed to save practice:', error);
      errors.submit = 'Failed to save practice. Please try again.';
    } finally {
      isLoading = false;
    }
  }

  function handleCancel(): void {
    onCancel();
  }
</script>

<div class="practice-form">
  <h3>Log Practice Session</h3>

  <form on:submit|preventDefault={handleSubmit}>
    <div class="form-group">
      <label for="date">Date *</label>
      <input
        id="date"
        type="date"
        bind:value={formData.date}
        class="form-input"
        class:error={errors.date}
        required
      />
      {#if errors.date}
        <span class="error-message">{errors.date}</span>
      {/if}
    </div>

    <div class="form-group">
      <label for="duration">Duration (minutes) *</label>
      <input
        id="duration"
        type="number"
        min="1"
        max="600"
        bind:value={formData.duration}
        class="form-input"
        class:error={errors.duration}
        required
      />
      {#if errors.duration}
        <span class="error-message">{errors.duration}</span>
      {/if}
    </div>

    <div class="form-group">
      <label>Focus Areas *</label>
      <div class="checkbox-grid">
        {#each FOCUS_AREAS as area}
          <label class="checkbox-item">
            <input
              type="checkbox"
              checked={formData.focusAreas.includes(area)}
              on:change={() => handleFocusAreaToggle(area)}
            />
            <span class="checkbox-label">{area}</span>
          </label>
        {/each}
      </div>
      {#if errors.focusAreas}
        <span class="error-message">{errors.focusAreas}</span>
      {/if}
    </div>

    {#if availableSongs.length > 0}
      <div class="form-group">
        <label>Songs Worked On</label>
        <div class="song-selection">
          {#each availableSongs as song (song.id)}
            <label class="checkbox-item">
              <input
                type="checkbox"
                checked={song.id && formData.songsWorkedOn.includes(song.id)}
                on:change={() => song.id && handleSongToggle(song.id)}
              />
              <span class="checkbox-label">
                {song.title}
                {#if song.artist}
                  <span class="song-artist">by {song.artist}</span>
                {/if}
              </span>
            </label>
          {/each}
        </div>
      </div>
    {/if}

    <div class="form-group">
      <label for="rating">Session Rating</label>
      <select
        id="rating"
        bind:value={formData.rating}
        class="form-select"
        class:error={errors.rating}
      >
        <option value={1}>1 - Poor</option>
        <option value={2}>2 - Below Average</option>
        <option value={3}>3 - Average</option>
        <option value={4}>4 - Good</option>
        <option value={5}>5 - Excellent</option>
      </select>
      {#if errors.rating}
        <span class="error-message">{errors.rating}</span>
      {/if}
    </div>

    <div class="form-group">
      <label for="notes">Notes</label>
      <textarea
        id="notes"
        bind:value={formData.notes}
        class="form-textarea"
        placeholder="What did you work on? What went well? What needs improvement?"
        rows="4"
      ></textarea>
    </div>

    {#if errors.submit}
      <div class="error-message submit-error">{errors.submit}</div>
    {/if}

    <div class="form-actions">
      <button type="button" class="cancel-button" on:click={handleCancel} disabled={isLoading}>
        Cancel
      </button>
      <button type="submit" class="save-button" disabled={isLoading}>
        {isLoading ? 'Saving...' : 'Save Practice'}
      </button>
    </div>
  </form>
</div>

<style>
  .practice-form {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 2rem;
    margin-bottom: 2rem;
  }

  .practice-form h3 {
    margin: 0 0 1.5rem 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: #111827;
  }

  .form-group {
    margin-bottom: 1.5rem;
  }

  label {
    display: block;
    font-size: 0.875rem;
    font-weight: 500;
    color: #374151;
    margin-bottom: 0.5rem;
  }

  .form-input,
  .form-select,
  .form-textarea {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    transition: border-color 0.2s;
    box-sizing: border-box;
  }

  .form-input:focus,
  .form-select:focus,
  .form-textarea:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .form-input.error,
  .form-select.error,
  .form-textarea.error {
    border-color: #ef4444;
  }

  .checkbox-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 0.75rem;
    margin-top: 0.5rem;
  }

  .song-selection {
    max-height: 200px;
    overflow-y: auto;
    border: 1px solid #e5e7eb;
    border-radius: 0.375rem;
    padding: 0.75rem;
    margin-top: 0.5rem;
  }

  .checkbox-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.25rem 0;
    cursor: pointer;
  }

  .checkbox-item input[type='checkbox'] {
    width: auto;
    margin: 0;
  }

  .checkbox-label {
    font-size: 0.875rem;
    color: #374151;
  }

  .song-artist {
    color: #6b7280;
    font-style: italic;
  }

  .error-message {
    display: block;
    color: #ef4444;
    font-size: 0.75rem;
    margin-top: 0.25rem;
  }

  .submit-error {
    margin-bottom: 1rem;
    padding: 0.75rem;
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 0.375rem;
  }

  .form-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    margin-top: 2rem;
  }

  .cancel-button,
  .save-button {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .cancel-button {
    background: #f3f4f6;
    color: #374151;
  }

  .cancel-button:hover {
    background: #e5e7eb;
  }

  .save-button {
    background: #3b82f6;
    color: white;
  }

  .save-button:hover {
    background: #2563eb;
  }

  .cancel-button:disabled,
  .save-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    .practice-form {
      padding: 1.5rem;
    }

    .checkbox-grid {
      grid-template-columns: 1fr;
    }

    .form-actions {
      flex-direction: column-reverse;
    }

    .cancel-button,
    .save-button {
      width: 100%;
    }
  }
</style>
