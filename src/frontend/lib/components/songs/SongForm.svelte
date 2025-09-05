<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { Song, CreateSong, UpdateSong, User } from '../../../../backend/database/types.js';
  import { SONG_STATUSES, GENRES } from '../../../../backend/database/types.js';

  export let user: User;
  export let selectedBandId: number | null = null;
  export let song: Song | null = null; // For editing
  export let onSave: (songData: CreateSong | UpdateSong) => void;
  export let onCancel: () => void;

  const dispatch = createEventDispatcher();

  let isLoading = false;
  let formData = {
    title: song?.title || '',
    artist: song?.artist || '',
    genre: song?.genre || '',
    key: song?.key || '',
    tempo: song?.tempo || null,
    duration: song?.duration || null,
    status: song?.status || 'learning',
    notes: song?.notes || '',
    recordingUrl: song?.recordingUrl || ''
  };
  let errors: Record<string, string> = {};

  // Convert duration from seconds to minutes:seconds format for display
  let durationMinutes = song?.duration ? Math.floor(song.duration / 60) : null;
  let durationSeconds = song?.duration ? song.duration % 60 : null;

  function validateForm(): boolean {
    errors = {};

    if (!formData.title.trim()) {
      errors.title = 'Song title is required';
    }

    if (formData.tempo !== null && formData.tempo <= 0) {
      errors.tempo = 'Tempo must be a positive number';
    }

    if (durationMinutes !== null && durationMinutes < 0) {
      errors.duration = 'Duration cannot be negative';
    }

    if (durationSeconds !== null && (durationSeconds < 0 || durationSeconds >= 60)) {
      errors.duration = 'Seconds must be between 0 and 59';
    }

    if (formData.recordingUrl && !isValidUrl(formData.recordingUrl)) {
      errors.recordingUrl = 'Please enter a valid URL';
    }

    return Object.keys(errors).length === 0;
  }

  function isValidUrl(string: string): boolean {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  }

  async function handleSubmit(): Promise<void> {
    if (!validateForm()) {
      return;
    }

    try {
      isLoading = true;

      // Convert duration back to seconds
      let durationInSeconds: number | undefined = undefined;
      if (durationMinutes !== null || durationSeconds !== null) {
        const minutes = durationMinutes || 0;
        const seconds = durationSeconds || 0;
        durationInSeconds = minutes * 60 + seconds;
      }

      const songData = {
        title: formData.title.trim(),
        artist: formData.artist.trim() || undefined,
        genre: formData.genre || undefined,
        key: formData.key || undefined,
        tempo: formData.tempo || undefined,
        duration: durationInSeconds,
        status: formData.status as 'learning' | 'ready' | 'mastered',
        notes: formData.notes.trim() || undefined,
        recordingUrl: formData.recordingUrl.trim() || undefined,
        userId: user.id!,
        bandId: selectedBandId || undefined
      };

      if (song) {
        // Editing existing song
        await onSave({
          ...songData,
          updatedAt: new Date()
        } as UpdateSong);
      } else {
        // Creating new song
        await onSave({
          ...songData,
          createdAt: new Date(),
          updatedAt: new Date()
        } as CreateSong);
      }

    } catch (error) {
      console.error('Failed to save song:', error);
      errors.submit = 'Failed to save song. Please try again.';
    } finally {
      isLoading = false;
    }
  }

  function handleCancel(): void {
    onCancel();
  }
</script>

<div class="song-form">
  <h3>{song ? 'Edit Song' : 'Add New Song'}</h3>

  <form on:submit|preventDefault={handleSubmit}>
    <div class="form-group">
      <label for="title">Title *</label>
      <input
        id="title"
        type="text"
        bind:value={formData.title}
        class="form-input"
        class:error={errors.title}
        placeholder="Enter song title"
        required
      />
      {#if errors.title}
        <span class="error-message">{errors.title}</span>
      {/if}
    </div>

    <div class="form-row">
      <div class="form-group">
        <label for="artist">Artist</label>
        <input
          id="artist"
          type="text"
          bind:value={formData.artist}
          class="form-input"
          placeholder="Enter artist name"
        />
      </div>

      <div class="form-group">
        <label for="genre">Genre</label>
        <select
          id="genre"
          bind:value={formData.genre}
          class="form-select"
        >
          <option value="">Select genre</option>
          {#each GENRES as genre}
            <option value={genre}>{genre}</option>
          {/each}
        </select>
      </div>
    </div>

    <div class="form-row">
      <div class="form-group">
        <label for="key">Key</label>
        <input
          id="key"
          type="text"
          bind:value={formData.key}
          class="form-input"
          placeholder="e.g., Am, C, F#"
        />
      </div>

      <div class="form-group">
        <label for="tempo">Tempo (BPM)</label>
        <input
          id="tempo"
          type="number"
          min="1"
          max="300"
          bind:value={formData.tempo}
          class="form-input"
          class:error={errors.tempo}
          placeholder="120"
        />
        {#if errors.tempo}
          <span class="error-message">{errors.tempo}</span>
        {/if}
      </div>
    </div>

    <div class="form-row">
      <div class="form-group">
        <label>Duration</label>
        <div class="duration-inputs">
          <input
            type="number"
            min="0"
            max="59"
            bind:value={durationMinutes}
            class="form-input duration-input"
            placeholder="0"
          />
          <span class="duration-separator">:</span>
          <input
            type="number"
            min="0"
            max="59"
            bind:value={durationSeconds}
            class="form-input duration-input"
            placeholder="00"
          />
          <span class="duration-label">mm:ss</span>
        </div>
        {#if errors.duration}
          <span class="error-message">{errors.duration}</span>
        {/if}
      </div>

      <div class="form-group">
        <label for="status">Status</label>
        <select
          id="status"
          bind:value={formData.status}
          class="form-select"
          required
        >
          {#each SONG_STATUSES as status}
            <option value={status.value}>{status.label}</option>
          {/each}
        </select>
      </div>
    </div>

    <div class="form-group">
      <label for="recordingUrl">Recording URL</label>
      <input
        id="recordingUrl"
        type="url"
        bind:value={formData.recordingUrl}
        class="form-input"
        class:error={errors.recordingUrl}
        placeholder="https://youtube.com/watch?v=..."
      />
      {#if errors.recordingUrl}
        <span class="error-message">{errors.recordingUrl}</span>
      {/if}
    </div>

    <div class="form-group">
      <label for="notes">Notes</label>
      <textarea
        id="notes"
        bind:value={formData.notes}
        class="form-textarea"
        placeholder="Chords, lyrics, practice notes..."
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
        {isLoading ? 'Saving...' : song ? 'Update Song' : 'Add Song'}
      </button>
    </div>
  </form>
</div>

<style>
  .song-form {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 2rem;
    margin-bottom: 2rem;
  }

  .song-form h3 {
    margin: 0 0 1.5rem 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: #111827;
  }

  .form-group {
    margin-bottom: 1.5rem;
  }

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
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

  .duration-inputs {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .duration-input {
    width: 60px;
    text-align: center;
  }

  .duration-separator {
    font-weight: 600;
    color: #6b7280;
  }

  .duration-label {
    font-size: 0.75rem;
    color: #6b7280;
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
    .song-form {
      padding: 1.5rem;
    }

    .form-row {
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