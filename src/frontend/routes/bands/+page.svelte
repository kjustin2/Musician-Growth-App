<script lang="ts">
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';
  import { bandService, bandMembershipService, type User } from '../../../backend/database/db.js';
  import type { Band, CreateBand, UpdateBand, CreateBandMembership } from '../../../backend/database/types.js';
  import { userStore } from '../../lib/logic/authLogic.js';
  import Navigation from '../../lib/components/shared/Navigation.svelte';
  import BandForm from '../../lib/components/bands/BandForm.svelte';
  import BandMemberForm from '../../lib/components/bands/BandMemberForm.svelte';
  import BandList from '../../lib/components/bands/BandList.svelte';
  import BandDetails from '../../lib/components/bands/BandDetails.svelte';

  let user: User | null = null;
  let selectedBandId: number | null = null;
  let bands: Band[] = [];
  let isLoading = false;
  let showBandForm = false;
  let showMemberForm = false;
  let showBandDetails = false;
  let editingBand: Band | null = null;
  let selectedBand: Band | null = null;

  onMount(async () => {
    user = get(userStore);
    if (user) {
      await loadBands();
    }
  });

  async function loadBands(): Promise<void> {
    if (!user) return;
    
    try {
      isLoading = true;
      bands = await bandService.findByUserId(user.id!);
    } catch (error) {
      console.error('Failed to load bands:', error);
    } finally {
      isLoading = false;
    }
  }

  async function handleSaveBand(bandData: CreateBand | UpdateBand): Promise<void> {
    if (!user) return;

    try {
      if (editingBand) {
        await bandService.update(editingBand.id!, bandData as UpdateBand);
      } else {
        await bandService.create(bandData as CreateBand);
      }
      
      await loadBands();
      handleCancelBandForm();
    } catch (error) {
      console.error('Failed to save band:', error);
      throw error;
    }
  }

  async function handleSaveMember(membershipData: CreateBandMembership): Promise<void> {
    try {
      await bandMembershipService.create(membershipData);
      handleCancelMemberForm();
      
      // Refresh the details view if it's open
      if (showBandDetails && selectedBand) {
        // The BandDetails component will handle its own refresh
      }
    } catch (error) {
      console.error('Failed to save member:', error);
      throw error;
    }
  }

  function handleEditBand(band: Band): void {
    editingBand = band;
    showBandForm = true;
    showBandDetails = false;
  }

  async function handleDeleteBand(band: Band): Promise<void> {
    if (confirm(`Are you sure you want to delete "${band.name}"? This will also remove all members.`)) {
      try {
        // First remove all memberships
        if (band.id) {
          const memberships = await bandMembershipService.findByBandId(band.id);
          for (const membership of memberships) {
            await bandMembershipService.delete(membership.id!);
          }
        }
        
        // Then delete the band
        await bandService.delete(band.id!);
        await loadBands();
      } catch (error) {
        console.error('Failed to delete band:', error);
      }
    }
  }

  function handleAddMember(band: Band): void {
    selectedBand = band;
    showMemberForm = true;
    showBandDetails = false;
  }

  function handleViewDetails(band: Band): void {
    selectedBand = band;
    showBandDetails = true;
  }

  function handleNewBand(): void {
    editingBand = null;
    showBandForm = true;
  }

  function handleCancelBandForm(): void {
    showBandForm = false;
    editingBand = null;
  }

  function handleCancelMemberForm(): void {
    showMemberForm = false;
    selectedBand = null;
  }

  function handleCloseBandDetails(): void {
    showBandDetails = false;
    selectedBand = null;
  }

  function handleBandChange(bandId: number | null): void {
    selectedBandId = bandId;
    // Bands page doesn't filter by selected band like other pages
  }
</script>

<svelte:head>
  <title>Bands - ChordLine</title>
</svelte:head>

{#if user}
  <Navigation {user} {selectedBandId} onBandChange={handleBandChange} />
  
  <main class="bands-page">
    <div class="page-header">
      <h1>Band Management</h1>
      <button class="new-button" on:click={handleNewBand} disabled={isLoading}>
        + New Band
      </button>
    </div>

    {#if showBandForm}
      <BandForm
        {user}
        band={editingBand}
        onSave={handleSaveBand}
        onCancel={handleCancelBandForm}
      />
    {/if}

    {#if showMemberForm && selectedBand}
      <BandMemberForm
        band={selectedBand}
        onSave={handleSaveMember}
        onCancel={handleCancelMemberForm}
      />
    {/if}

    <BandList
      {bands}
      {isLoading}
      onEdit={handleEditBand}
      onDelete={handleDeleteBand}
      onAddMember={handleAddMember}
      onViewDetails={handleViewDetails}
    />
  </main>

  {#if showBandDetails && selectedBand}
    <BandDetails
      band={selectedBand}
      onClose={handleCloseBandDetails}
      onEditBand={handleEditBand}
      onAddMember={handleAddMember}
    />
  {/if}
{:else}
  <div class="auth-required">
    <h1>Authentication Required</h1>
    <p>Please <a href="/login">log in</a> to manage your bands.</p>
  </div>
{/if}

<style>
  .bands-page {
    min-height: calc(100vh - 60px);
    background: #f8f9fa;
  }

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 2rem 1.5rem 0;
    max-width: 1200px;
    margin: 0 auto;
  }

  .page-header h1 {
    margin: 0;
    font-size: 2rem;
    font-weight: 700;
    color: #111827;
  }

  .new-button {
    padding: 0.75rem 1.5rem;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .new-button:hover {
    background: #2563eb;
    transform: translateY(-1px);
  }

  .new-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  .auth-required {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 2rem;
    text-align: center;
  }

  .auth-required h1 {
    font-size: 2rem;
    color: #111827;
    margin-bottom: 1rem;
  }

  .auth-required p {
    font-size: 1.125rem;
    color: #6b7280;
  }

  .auth-required a {
    color: #3b82f6;
    text-decoration: none;
    font-weight: 500;
  }

  .auth-required a:hover {
    text-decoration: underline;
  }

  @media (max-width: 768px) {
    .page-header {
      flex-direction: column;
      gap: 1rem;
      align-items: stretch;
    }

    .new-button {
      width: 100%;
    }
  }
</style>