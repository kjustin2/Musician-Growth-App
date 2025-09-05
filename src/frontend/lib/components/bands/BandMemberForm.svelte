<script lang="ts">
  import { onMount } from 'svelte';
  import type {
    BandMembership,
    CreateBandMembership,
    Band,
  } from '../../../../backend/database/types.js';
  import { INSTRUMENTS } from '../../../../backend/database/types.js';

  export let band: Band;
  export let onSave: (membershipData: CreateBandMembership) => void;
  export let onCancel: () => void;

  let isLoading = false;
  const formData = {
    role: '',
    instrument: '',
    joinedAt: new Date().toISOString().split('T')[0],
  };
  let errors: Record<string, string> = {};

  function validateForm(): boolean {
    errors = {};

    if (!formData.role.trim()) {
      errors.role = 'Role is required';
    }

    if (!formData.instrument) {
      errors.instrument = 'Instrument is required';
    }

    if (!formData.joinedAt) {
      errors.joinedAt = 'Join date is required';
    }

    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(): Promise<void> {
    if (!validateForm()) {
      return;
    }

    try {
      isLoading = true;

      const membershipData: CreateBandMembership = {
        userId: band.userId, // For now, assume owner is adding themselves
        bandId: band.id!,
        role: formData.role.trim(),
        instrument: formData.instrument,
        joinedAt: new Date(formData.joinedAt),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await onSave(membershipData);
    } catch (error) {
      console.error('Failed to add member:', error);
      errors.submit = 'Failed to add member. Please try again.';
    } finally {
      isLoading = false;
    }
  }

  function handleCancel(): void {
    onCancel();
  }
</script>

<div class="member-form">
  <h3>Add Band Member</h3>
  <p class="form-description">Add yourself or other members to {band.name}</p>

  <form on:submit|preventDefault={handleSubmit}>
    <div class="form-group">
      <label for="role">Role *</label>
      <input
        id="role"
        type="text"
        bind:value={formData.role}
        class="form-input"
        class:error={errors.role}
        placeholder="e.g., Lead Vocalist, Guitarist, Drummer"
        required
      />
      {#if errors.role}
        <span class="error-message">{errors.role}</span>
      {/if}
    </div>

    <div class="form-group">
      <label for="instrument">Instrument *</label>
      <select
        id="instrument"
        bind:value={formData.instrument}
        class="form-select"
        class:error={errors.instrument}
        required
      >
        <option value="">Select instrument</option>
        {#each INSTRUMENTS as instrument}
          <option value={instrument}>{instrument}</option>
        {/each}
      </select>
      {#if errors.instrument}
        <span class="error-message">{errors.instrument}</span>
      {/if}
    </div>

    <div class="form-group">
      <label for="joinedAt">Join Date *</label>
      <input
        id="joinedAt"
        type="date"
        bind:value={formData.joinedAt}
        class="form-input"
        class:error={errors.joinedAt}
        required
      />
      {#if errors.joinedAt}
        <span class="error-message">{errors.joinedAt}</span>
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
        {isLoading ? 'Adding...' : 'Add Member'}
      </button>
    </div>
  </form>
</div>

<style>
  .member-form {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 2rem;
    margin-bottom: 2rem;
  }

  .member-form h3 {
    margin: 0 0 0.5rem 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: #111827;
  }

  .form-description {
    margin: 0 0 1.5rem 0;
    color: #6b7280;
    font-size: 0.875rem;
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
  .form-select {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    transition: border-color 0.2s;
    box-sizing: border-box;
  }

  .form-input:focus,
  .form-select:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .form-input.error,
  .form-select.error {
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
    .member-form {
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
