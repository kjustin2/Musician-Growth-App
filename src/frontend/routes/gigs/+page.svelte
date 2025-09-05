<script lang="ts">
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';
  import Navigation from '$lib/components/shared/Navigation.svelte';
  import GigList from '$lib/components/gigs/GigList.svelte';
  import GigForm from '$lib/components/gigs/GigForm.svelte';
  import { gigService } from '../../../backend/database/db.js';
  import { userStore, logout } from '../../lib/logic/authLogic.js';
  import type { User, Gig } from '../../../backend/database/types.js';

  let user: User | null = null;
  let selectedBandId: number | null = null;
  let gigs: Gig[] = [];
  let showForm = false;
  let editingGig: Gig | null = null;
  let isLoading = true;

  onMount(async () => {
    user = get(userStore);
    if (user) {
      await loadGigs();
    }
  });

  async function loadGigs(): Promise<void> {
    if (!user) {
      return;
    }

    try {
      isLoading = true;
      gigs = await gigService.findByUserAndBand(user.id!, selectedBandId ?? undefined);
    } catch (error) {
      console.error('Failed to load gigs:', error);
    } finally {
      isLoading = false;
    }
  }

  function handleBandChange(bandId: number | null): void {
    selectedBandId = bandId;
    void loadGigs();
  }

  function handleNewGig(): void {
    editingGig = null;
    showForm = true;
  }

  function handleEditGig(gig: Gig): void {
    editingGig = gig;
    showForm = true;
  }

  function handleGigSaved(): void {
    showForm = false;
    editingGig = null;
    void loadGigs();
  }

  function handleFormCancel(): void {
    showForm = false;
    editingGig = null;
  }

  async function handleDeleteGig(gig: Gig): Promise<void> {
    if (confirm(`Are you sure you want to delete "${gig.title}"?`)) {
      try {
        await gigService.delete(gig.id!);
        await loadGigs();
      } catch (error) {
        console.error('Failed to delete gig:', error);
        alert('Failed to delete gig. Please try again.');
      }
    }
  }

  function handleLogout(): void {
    logout();
  }
</script>

<svelte:head>
  <title>Gigs - ChordLine</title>
</svelte:head>

{#if user}
  <div class="gigs-page">
    <Navigation {user} {selectedBandId} onBandChange={handleBandChange} onLogout={handleLogout} />

    <main class="gigs-main">
      <div class="page-header">
        <div class="header-content">
          <h1>Gigs</h1>
          <button class="new-gig-button" on:click={handleNewGig} disabled={showForm}>
            + New Gig
          </button>
        </div>
      </div>

      <div class="gigs-content">
        {#if showForm}
          <div class="form-section">
            <GigForm
              gig={editingGig}
              {user}
              bandId={selectedBandId}
              onSave={handleGigSaved}
              onCancel={handleFormCancel}
            />
          </div>
        {/if}

        <div class="list-section">
          <GigList {gigs} {isLoading} onEdit={handleEditGig} onDelete={handleDeleteGig} />
        </div>
      </div>
    </main>
  </div>
{:else}
  <div class="auth-required">
    <h1>Authentication Required</h1>
    <p>Please <a href="/">log in</a> to access your gigs.</p>
  </div>
{/if}

<style>
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
  .gigs-page {
    min-height: 100vh;
    background-color: #f8f9fa;
  }

  .gigs-main {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
  }

  .page-header {
    margin-bottom: 2rem;
  }

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: white;
    padding: 1.5rem 2rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .header-content h1 {
    margin: 0;
    font-size: 1.75rem;
    font-weight: 700;
    color: #333;
  }

  .new-gig-button {
    padding: 0.75rem 1.5rem;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 6px;
    font-weight: 600;
    font-size: 0.875rem;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .new-gig-button:hover:not(:disabled) {
    background: #2563eb;
  }

  .new-gig-button:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }

  .gigs-content {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .form-section {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .list-section {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  @media (max-width: 768px) {
    .gigs-main {
      padding: 1rem;
    }

    .header-content {
      flex-direction: column;
      gap: 1rem;
      text-align: center;
    }

    .header-content h1 {
      font-size: 1.5rem;
    }
  }
</style>
