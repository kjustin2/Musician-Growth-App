<script lang="ts">
  import { onMount } from 'svelte';
  import type { Band, BandMembership } from '../../../../backend/database/types.js';
  import { bandMembershipService } from '../../../../backend/database/db.js';

  export let bands: Band[];
  export let isLoading: boolean;
  export let onEdit: (band: Band) => void;
  export let onDelete: (band: Band) => void;
  export let onAddMember: (band: Band) => void;
  export let onViewDetails: (band: Band) => void;

  let bandMemberships: Map<
    number,
    Array<BandMembership & { role: string; instrument: string }>
  > = new Map();

  onMount(async () => {
    await loadMemberships();
  });

  $: if (bands.length > 0) {
    loadMemberships();
  }

  async function loadMemberships(): Promise<void> {
    try {
      const membershipsMap = new Map();

      for (const band of bands) {
        if (band.id) {
          const members = await bandMembershipService.findByBandId(band.id);
          membershipsMap.set(band.id, members);
        }
      }

      bandMemberships = membershipsMap;
    } catch (error) {
      console.error('Failed to load band memberships:', error);
    }
  }

  function formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      year: 'numeric',
    }).format(new Date(date));
  }

  function handleEdit(band: Band): void {
    onEdit(band);
  }

  function handleDelete(band: Band): void {
    onDelete(band);
  }

  function handleAddMember(band: Band): void {
    onAddMember(band);
  }

  function handleViewDetails(band: Band): void {
    onViewDetails(band);
  }
</script>

<div class="band-list">
  <div class="list-header">
    <h2>Your Bands</h2>
    <div class="stats">
      <div class="stat">
        <span class="stat-value">{bands.length}</span>
        <span class="stat-label">Total Bands</span>
      </div>
    </div>
  </div>

  <div class="list-content">
    {#if isLoading}
      <div class="loading-state">
        <p>Loading bands...</p>
      </div>
    {:else if bands.length === 0}
      <div class="empty-state">
        <p>No bands yet</p>
        <p class="empty-subtitle">
          Create your first band to start collaborating with other musicians!
        </p>
      </div>
    {:else}
      <div class="bands-grid">
        {#each bands as band (band.id)}
          {@const members = band.id ? bandMemberships.get(band.id) || [] : []}
          <div class="band-card">
            <div class="band-header">
              <div class="band-name">{band.name}</div>
              <div class="band-created">
                Created {formatDate(band.createdAt)}
              </div>
            </div>

            <div class="band-details">
              <div class="member-count">
                👥 {members.length}
                {members.length === 1 ? 'member' : 'members'}
              </div>

              {#if members.length > 0}
                <div class="members-preview">
                  {#each members.slice(0, 3) as member}
                    <span class="member-tag">
                      {member.role} ({member.instrument})
                    </span>
                  {/each}
                  {#if members.length > 3}
                    <span class="more-members">+{members.length - 3} more</span>
                  {/if}
                </div>
              {:else}
                <div class="no-members">No members added yet</div>
              {/if}
            </div>

            <div class="band-actions">
              <button class="view-button" on:click={() => handleViewDetails(band)}>
                View Details
              </button>
              <button class="add-member-button" on:click={() => handleAddMember(band)}>
                Add Member
              </button>
              <button class="edit-button" on:click={() => handleEdit(band)}> Edit </button>
              <button class="delete-button" on:click={() => handleDelete(band)}> Delete </button>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>

<style>
  .band-list {
    padding: 1.5rem;
  }

  .list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .list-header h2 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: #333;
  }

  .stats {
    display: flex;
    gap: 2rem;
  }

  .stat {
    text-align: center;
  }

  .stat-value {
    display: block;
    font-size: 1.25rem;
    font-weight: 600;
    color: #3b82f6;
  }

  .stat-label {
    font-size: 0.75rem;
    color: #6b7280;
  }

  .list-content {
    min-height: 200px;
  }

  .loading-state,
  .empty-state {
    text-align: center;
    padding: 3rem 1rem;
    color: #666;
  }

  .empty-subtitle {
    font-size: 0.875rem;
    color: #888;
    margin-top: 0.5rem;
  }

  .bands-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 1.5rem;
  }

  .band-card {
    background: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 8px;
    padding: 1.5rem;
    transition: all 0.2s;
  }

  .band-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-color: #dee2e6;
  }

  .band-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;
    gap: 1rem;
  }

  .band-name {
    font-size: 1.125rem;
    font-weight: 600;
    color: #333;
    line-height: 1.3;
    flex-grow: 1;
  }

  .band-created {
    font-size: 0.75rem;
    color: #6b7280;
    white-space: nowrap;
  }

  .band-details {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
  }

  .member-count {
    font-size: 0.875rem;
    color: #374151;
    font-weight: 500;
  }

  .members-preview {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .member-tag {
    background: #e5e7eb;
    padding: 0.25rem 0.5rem;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 500;
    color: #374151;
  }

  .more-members {
    background: #ddd6fe;
    padding: 0.25rem 0.5rem;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 500;
    color: #7c3aed;
  }

  .no-members {
    font-size: 0.875rem;
    color: #9ca3af;
    font-style: italic;
  }

  .band-actions {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .view-button,
  .add-member-button,
  .edit-button,
  .delete-button {
    padding: 0.5rem 0.75rem;
    border: none;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    flex: 1;
    min-width: 80px;
  }

  .view-button {
    background: #f3f4f6;
    color: #374151;
  }

  .view-button:hover {
    background: #e5e7eb;
  }

  .add-member-button {
    background: #10b981;
    color: white;
  }

  .add-member-button:hover {
    background: #059669;
  }

  .edit-button {
    background: #3b82f6;
    color: white;
  }

  .edit-button:hover {
    background: #2563eb;
  }

  .delete-button {
    background: #ef4444;
    color: white;
  }

  .delete-button:hover {
    background: #dc2626;
  }

  @media (max-width: 768px) {
    .band-list {
      padding: 1rem;
    }

    .list-header {
      flex-direction: column;
      align-items: stretch;
    }

    .stats {
      justify-content: center;
    }

    .bands-grid {
      grid-template-columns: 1fr;
    }

    .band-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.5rem;
    }

    .band-actions {
      flex-direction: column;
    }

    .view-button,
    .add-member-button,
    .edit-button,
    .delete-button {
      width: 100%;
    }
  }
</style>
