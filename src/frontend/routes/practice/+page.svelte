<script lang="ts">
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';
  import { practiceService, type User } from '../../../backend/database/db.js';
  import type { Practice, CreatePractice } from '../../../backend/database/types.js';
  import { userStore, logout } from '../../lib/logic/authLogic.js';
  import Navigation from '../../lib/components/shared/Navigation.svelte';
  import PracticeForm from '../../lib/components/practice/PracticeForm.svelte';
  import PracticeList from '../../lib/components/practice/PracticeList.svelte';

  let user: User | null = null;
  let selectedBandId: number | null = null;
  let practices: Practice[] = [];
  let isLoading = false;
  let showForm = false;
  let editingPractice: Practice | null = null;

  onMount(async () => {
    user = get(userStore);
    if (user) {
      await loadPractices();
    }
  });

  async function loadPractices(): Promise<void> {
    if (!user) {
      return;
    }

    try {
      isLoading = true;
      if (selectedBandId) {
        practices = await practiceService.findByBandId(selectedBandId);
      } else {
        practices = await practiceService.findByUserId(user.id!);
      }
    } catch (error) {
      console.error('Failed to load practices:', error);
    } finally {
      isLoading = false;
    }
  }

  async function handleSavePractice(practiceData: CreatePractice): Promise<void> {
    if (!user) {
      return;
    }

    try {
      if (editingPractice) {
        await practiceService.update(editingPractice.id!, {
          ...practiceData,
          updatedAt: new Date(),
        });
      } else {
        await practiceService.create(practiceData);
      }

      await loadPractices();
      handleCancelForm();
    } catch (error) {
      console.error('Failed to save practice:', error);
      throw error;
    }
  }

  function handleEditPractice(practice: Practice): void {
    editingPractice = practice;
    showForm = true;
  }

  async function handleDeletePractice(practice: Practice): Promise<void> {
    if (confirm('Are you sure you want to delete this practice session?')) {
      try {
        await practiceService.delete(practice.id!);
        await loadPractices();
      } catch (error) {
        console.error('Failed to delete practice:', error);
      }
    }
  }

  function handleNewPractice(): void {
    editingPractice = null;
    showForm = true;
  }

  function handleCancelForm(): void {
    showForm = false;
    editingPractice = null;
  }

  function handleBandChange(bandId: number | null): void {
    selectedBandId = bandId;
    loadPractices();
  }

  function handleLogout(): void {
    logout();
  }
</script>

<svelte:head>
  <title>Practice Sessions - ChordLine</title>
</svelte:head>

{#if user}
  <Navigation {user} {selectedBandId} onBandChange={handleBandChange} onLogout={handleLogout} />

  <main class="practice-page">
    <div class="page-header">
      <h1>Practice Sessions</h1>
      <button class="new-button" on:click={handleNewPractice} disabled={isLoading}>
        + New Practice
      </button>
    </div>

    {#if showForm}
      <PracticeForm
        {user}
        {selectedBandId}
        onSave={handleSavePractice}
        onCancel={handleCancelForm}
      />
    {/if}

    <PracticeList
      {practices}
      {isLoading}
      onEdit={handleEditPractice}
      onDelete={handleDeletePractice}
    />
  </main>
{:else}
  <div class="auth-required">
    <h1>Authentication Required</h1>
    <p>Please <a href="/login">log in</a> to access your practice sessions.</p>
  </div>
{/if}

<style>
  .practice-page {
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
