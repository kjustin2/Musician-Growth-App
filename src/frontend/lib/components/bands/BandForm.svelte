<script lang="ts">
  import type { Band, CreateBand, UpdateBand, User } from '../../../../backend/database/types.js';

  export let user: User;
  export let band: Band | null = null; // For editing
  export let onSave: (bandData: CreateBand | UpdateBand) => void;
  export let onCancel: () => void;

  let isLoading = false;
  const formData = {
    name: band?.name || '',
  };
  let errors: Record<string, string> = {};

  function validateForm(): boolean {
    errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Band name is required';
    }

    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(): Promise<void> {
    if (!validateForm()) {
      return;
    }

    try {
      isLoading = true;

      const bandData = {
        name: formData.name.trim(),
        userId: user.id!,
      };

      if (band) {
        // Editing existing band
        await onSave({
          ...bandData,
          updatedAt: new Date(),
        } as UpdateBand);
      } else {
        // Creating new band
        await onSave({
          ...bandData,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as CreateBand);
      }
    } catch (error) {
      console.error('Failed to save band:', error);
      errors.submit = 'Failed to save band. Please try again.';
    } finally {
      isLoading = false;
    }
  }

  function handleCancel(): void {
    onCancel();
  }
</script>

<div class="band-form">
  <h3>{band ? 'Edit Band' : 'Create New Band'}</h3>

  <form on:submit|preventDefault={handleSubmit}>
    <div class="form-group">
      <label for="name">Band Name *</label>
      <input
        id="name"
        type="text"
        bind:value={formData.name}
        class="form-input"
        class:error={errors.name}
        placeholder="Enter band name"
        required
      />
      {#if errors.name}
        <span class="error-message">{errors.name}</span>
      {/if}
    </div>

    {#if errors.submit}
      <div class="error-message submit-error">{errors.submit}</div>
    {/if}

    <div class="form-actions">
      <button type="button" class="cancel-button" on:click={handleCancel} disabled={isLoading}>
        Cancel
      </button>
      <button type="submit" class="save-button" disabled={isLoading}>
        {isLoading ? 'Saving...' : band ? 'Update Band' : 'Create Band'}
      </button>
    </div>
  </form>
</div>

<style>
  .band-form {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 2rem;
    margin-bottom: 2rem;
  }

  .band-form h3 {
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

  .form-input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    transition: border-color 0.2s;
    box-sizing: border-box;
  }

  .form-input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .form-input.error {
    border-color: #ef4444;
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
    .band-form {
      padding: 1.5rem;
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
