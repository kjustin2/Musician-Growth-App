<script lang="ts">
  import { onMount } from 'svelte';
  import { bandMembershipService, type User } from '../../../../backend/database/db.js';
  import type { Band } from '../../../../backend/database/types.js';

  export let user: User;
  export let selectedBandId: number | null = null;
  export let onBandChange: (bandId: number | null) => void;

  let userBands: Array<Band & { role: string; instrument: string }> = [];
  let isLoading = false;

  onMount(async () => {
    await loadUserBands();
  });

  async function loadUserBands(): Promise<void> {
    try {
      isLoading = true;
      userBands = await bandMembershipService.getUserBands(user.id!);
    } catch (error) {
      console.error('Failed to load user bands:', error);
    } finally {
      isLoading = false;
    }
  }

  function handleBandSelect(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const value = target.value;
    const bandId = value === '' ? null : parseInt(value);
    selectedBandId = bandId;
    onBandChange(bandId);
  }
</script>

<div class="band-selector">
  <label for="band-select" class="band-selector-label"> Active Band: </label>

  <select
    id="band-select"
    class="band-selector-dropdown"
    value={selectedBandId?.toString() || ''}
    on:change={handleBandSelect}
    disabled={isLoading}
  >
    <option value="">Personal (No Band)</option>
    {#each userBands as band}
      <option value={band.id?.toString()}>
        {band.name} ({band.role})
      </option>
    {/each}
  </select>

  {#if isLoading}
    <span class="loading-indicator">Loading...</span>
  {/if}
</div>

<style>
  .band-selector {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .band-selector-label {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--text-secondary, #666);
    white-space: nowrap;
  }

  .band-selector-dropdown {
    padding: 0.375rem 0.75rem;
    border: 1px solid var(--border-color, #d1d5db);
    border-radius: 0.375rem;
    font-size: 0.875rem;
    background: var(--bg-primary, white);
    color: var(--text-primary, #374151);
    min-width: 180px;
    cursor: pointer;
  }

  .band-selector-dropdown:focus {
    outline: none;
    border-color: var(--primary-color, #3b82f6);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .band-selector-dropdown:disabled {
    background: var(--bg-disabled, #f3f4f6);
    cursor: not-allowed;
    opacity: 0.7;
  }

  .loading-indicator {
    font-size: 0.75rem;
    color: var(--text-secondary, #666);
    font-style: italic;
  }

  /* Dark mode support */
  @media (prefers-color-scheme: dark) {
    .band-selector-dropdown {
      background: var(--bg-primary, #1f2937);
      border-color: var(--border-color, #374151);
      color: var(--text-primary, #f3f4f6);
    }
  }
</style>
