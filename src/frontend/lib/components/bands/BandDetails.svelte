<script lang="ts">
  import { onMount } from 'svelte';
  import type { Band, BandMembership } from '../../../../backend/database/types.js';
  import { bandMembershipService } from '../../../../backend/database/db.js';

  export let band: Band;
  export let onClose: () => void;
  export let onEditBand: (band: Band) => void;
  export let onAddMember: (band: Band) => void;

  let members: Array<BandMembership & { role: string; instrument: string }> = [];
  let isLoading = true;

  onMount(async () => {
    await loadMembers();
  });

  async function loadMembers(): Promise<void> {
    try {
      isLoading = true;
      if (band.id) {
        members = await bandMembershipService.findByBandId(band.id);
      }
    } catch (error) {
      console.error('Failed to load band members:', error);
    } finally {
      isLoading = false;
    }
  }

  async function handleRemoveMember(membership: BandMembership): Promise<void> {
    if (confirm('Are you sure you want to remove this member from the band?')) {
      try {
        await bandMembershipService.delete(membership.id!);
        await loadMembers();
      } catch (error) {
        console.error('Failed to remove member:', error);
      }
    }
  }

  function formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(date));
  }

  function handleClose(): void {
    onClose();
  }

  function handleEditBand(): void {
    onEditBand(band);
  }

  function handleAddMember(): void {
    onAddMember(band);
  }
</script>

<div class="band-details-modal">
  <div class="modal-backdrop" on:click={handleClose}></div>

  <div class="modal-content">
    <div class="modal-header">
      <h2>{band.name}</h2>
      <button class="close-button" on:click={handleClose}>×</button>
    </div>

    <div class="modal-body">
      <div class="band-info">
        <div class="info-item">
          <span class="info-label">Created:</span>
          <span class="info-value">{formatDate(band.createdAt)}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Members:</span>
          <span class="info-value">{members.length}</span>
        </div>
      </div>

      <div class="members-section">
        <div class="section-header">
          <h3>Band Members</h3>
          <button class="add-member-button" on:click={handleAddMember}> + Add Member </button>
        </div>

        {#if isLoading}
          <div class="loading-state">
            <p>Loading members...</p>
          </div>
        {:else if members.length === 0}
          <div class="empty-state">
            <p>No members added yet</p>
            <p class="empty-subtitle">Add members to start collaborating!</p>
          </div>
        {:else}
          <div class="members-list">
            {#each members as member (member.id)}
              <div class="member-card">
                <div class="member-info">
                  <div class="member-role">{member.role}</div>
                  <div class="member-instrument">{member.instrument}</div>
                  <div class="member-joined">
                    Joined {formatDate(member.joinedAt)}
                  </div>
                </div>
                <div class="member-actions">
                  <button class="remove-button" on:click={() => handleRemoveMember(member)}>
                    Remove
                  </button>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    </div>

    <div class="modal-footer">
      <button class="edit-band-button" on:click={handleEditBand}> Edit Band </button>
      <button class="close-footer-button" on:click={handleClose}> Close </button>
    </div>
  </div>
</div>

<style>
  .band-details-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
  }

  .modal-backdrop {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
  }

  .modal-content {
    position: relative;
    background: white;
    border-radius: 8px;
    width: 100%;
    max-width: 600px;
    max-height: 90vh;
    overflow: hidden;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem 2rem;
    border-bottom: 1px solid #e5e7eb;
    background: #f8f9fa;
  }

  .modal-header h2 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
    color: #111827;
  }

  .close-button {
    background: none;
    border: none;
    font-size: 1.5rem;
    color: #6b7280;
    cursor: pointer;
    padding: 0.25rem;
    line-height: 1;
  }

  .close-button:hover {
    color: #374151;
  }

  .modal-body {
    padding: 2rem;
    max-height: 60vh;
    overflow-y: auto;
  }

  .band-info {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 6px;
  }

  .info-item {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .info-label {
    font-size: 0.75rem;
    font-weight: 500;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .info-value {
    font-size: 1rem;
    font-weight: 600;
    color: #111827;
  }

  .members-section {
    margin-bottom: 1rem;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .section-header h3 {
    margin: 0;
    font-size: 1.125rem;
    font-weight: 600;
    color: #111827;
  }

  .add-member-button {
    padding: 0.5rem 1rem;
    background: #10b981;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .add-member-button:hover {
    background: #059669;
  }

  .loading-state,
  .empty-state {
    text-align: center;
    padding: 2rem 1rem;
    color: #6b7280;
  }

  .empty-subtitle {
    font-size: 0.875rem;
    color: #9ca3af;
    margin-top: 0.5rem;
  }

  .members-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .member-card {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 6px;
  }

  .member-info {
    flex-grow: 1;
  }

  .member-role {
    font-size: 1rem;
    font-weight: 600;
    color: #111827;
    margin-bottom: 0.25rem;
  }

  .member-instrument {
    font-size: 0.875rem;
    color: #6b7280;
    margin-bottom: 0.25rem;
  }

  .member-joined {
    font-size: 0.75rem;
    color: #9ca3af;
  }

  .member-actions {
    margin-left: 1rem;
  }

  .remove-button {
    padding: 0.375rem 0.75rem;
    background: #ef4444;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .remove-button:hover {
    background: #dc2626;
  }

  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    padding: 1.5rem 2rem;
    border-top: 1px solid #e5e7eb;
    background: #f8f9fa;
  }

  .edit-band-button,
  .close-footer-button {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 4px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .edit-band-button {
    background: #3b82f6;
    color: white;
  }

  .edit-band-button:hover {
    background: #2563eb;
  }

  .close-footer-button {
    background: #f3f4f6;
    color: #374151;
  }

  .close-footer-button:hover {
    background: #e5e7eb;
  }

  @media (max-width: 768px) {
    .modal-content {
      margin: 0;
      height: 100vh;
      max-height: 100vh;
      border-radius: 0;
    }

    .modal-header,
    .modal-footer {
      padding: 1rem;
    }

    .modal-body {
      padding: 1rem;
    }

    .band-info {
      grid-template-columns: 1fr;
    }

    .section-header {
      flex-direction: column;
      gap: 1rem;
      align-items: stretch;
    }

    .member-card {
      flex-direction: column;
      align-items: flex-start;
      gap: 1rem;
    }

    .member-actions {
      margin-left: 0;
      align-self: flex-end;
    }

    .modal-footer {
      flex-direction: column;
    }

    .edit-band-button,
    .close-footer-button {
      width: 100%;
    }
  }
</style>
