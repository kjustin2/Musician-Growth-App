<script lang="ts">
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';
  import { songService, type User } from '../../../backend/database/db.js';
  import type { Song, CreateSong, UpdateSong } from '../../../backend/database/types.js';
  import { userStore } from '../../lib/logic/authLogic.js';
  import Navigation from '../../lib/components/shared/Navigation.svelte';
  import SongForm from '../../lib/components/songs/SongForm.svelte';
  import SongList from '../../lib/components/songs/SongList.svelte';

  let user: User | null = null;
  let selectedBandId: number | null = null;
  let songs: Song[] = [];
  let isLoading = false;
  let showForm = false;
  let editingSong: Song | null = null;

  onMount(async () => {
    user = get(userStore);
    if (user) {
      await loadSongs();
    }
  });

  async function loadSongs(): Promise<void> {
    if (!user) return;
    
    try {
      isLoading = true;
      if (selectedBandId) {
        songs = await songService.findByBandId(selectedBandId);
      } else {
        songs = await songService.findByUserId(user.id!);
      }
    } catch (error) {
      console.error('Failed to load songs:', error);
    } finally {
      isLoading = false;
    }
  }

  async function handleSaveSong(songData: CreateSong | UpdateSong): Promise<void> {
    if (!user) return;

    try {
      if (editingSong) {
        await songService.update(editingSong.id!, songData as UpdateSong);
      } else {
        await songService.create(songData as CreateSong);
      }
      
      await loadSongs();
      handleCancelForm();
    } catch (error) {
      console.error('Failed to save song:', error);
      throw error;
    }
  }

  function handleEditSong(song: Song): void {
    editingSong = song;
    showForm = true;
  }

  async function handleDeleteSong(song: Song): Promise<void> {
    if (confirm(`Are you sure you want to delete "${song.title}"?`)) {
      try {
        await songService.delete(song.id!);
        await loadSongs();
      } catch (error) {
        console.error('Failed to delete song:', error);
      }
    }
  }

  function handleNewSong(): void {
    editingSong = null;
    showForm = true;
  }

  function handleCancelForm(): void {
    showForm = false;
    editingSong = null;
  }

  function handleBandChange(bandId: number | null): void {
    selectedBandId = bandId;
    loadSongs();
  }
</script>

<svelte:head>
  <title>Songs - ChordLine</title>
</svelte:head>

{#if user}
  <Navigation {user} {selectedBandId} onBandChange={handleBandChange} />
  
  <main class="songs-page">
    <div class="page-header">
      <h1>Song Library</h1>
      <button class="new-button" on:click={handleNewSong} disabled={isLoading}>
        + Add Song
      </button>
    </div>

    {#if showForm}
      <SongForm
        {user}
        {selectedBandId}
        song={editingSong}
        onSave={handleSaveSong}
        onCancel={handleCancelForm}
      />
    {/if}

    <SongList
      {songs}
      {isLoading}
      onEdit={handleEditSong}
      onDelete={handleDeleteSong}
    />
  </main>
{:else}
  <div class="auth-required">
    <h1>Authentication Required</h1>
    <p>Please <a href="/login">log in</a> to access your song library.</p>
  </div>
{/if}

<style>
  .songs-page {
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