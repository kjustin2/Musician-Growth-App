<script lang="ts">
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';
  import {
    practiceService,
    gigService,
    songService,
    type User,
  } from '../../../backend/database/db.js';
  import type { Practice, Gig, Song } from '../../../backend/database/types.js';
  import { userStore, logout } from '../../lib/logic/authLogic.js';
  import Navigation from '../../lib/components/shared/Navigation.svelte';
  import PracticeStats from '../../lib/components/analytics/PracticeStats.svelte';
  import GigStats from '../../lib/components/analytics/GigStats.svelte';
  import SongProgress from '../../lib/components/analytics/SongProgress.svelte';

  let user: User | null = null;
  let selectedBandId: number | null = null;
  let practices: Practice[] = [];
  let gigs: Gig[] = [];
  let songs: Song[] = [];
  let isLoading = false;

  onMount(async () => {
    user = get(userStore);
    if (user) {
      await loadAllData();
    }
  });

  async function loadAllData(): Promise<void> {
    if (!user) {
      return;
    }

    try {
      isLoading = true;
      await Promise.all([loadPractices(), loadGigs(), loadSongs()]);
    } catch (error) {
      console.error('Failed to load analytics data:', error);
    } finally {
      isLoading = false;
    }
  }

  async function loadPractices(): Promise<void> {
    if (!user) {
      return;
    }

    try {
      if (selectedBandId) {
        practices = await practiceService.findByBandId(selectedBandId);
      } else {
        practices = await practiceService.findByUserId(user.id!);
      }
    } catch (error) {
      console.error('Failed to load practices:', error);
      practices = [];
    }
  }

  async function loadGigs(): Promise<void> {
    if (!user) {
      return;
    }

    try {
      if (selectedBandId) {
        gigs = await gigService.findByBandId(selectedBandId);
      } else {
        gigs = await gigService.findByUserId(user.id!);
      }
    } catch (error) {
      console.error('Failed to load gigs:', error);
      gigs = [];
    }
  }

  async function loadSongs(): Promise<void> {
    if (!user) {
      return;
    }

    try {
      if (selectedBandId) {
        songs = await songService.findByBandId(selectedBandId);
      } else {
        songs = await songService.findByUserId(user.id!);
      }
    } catch (error) {
      console.error('Failed to load songs:', error);
      songs = [];
    }
  }

  function handleBandChange(bandId: number | null): void {
    selectedBandId = bandId;
    loadAllData();
  }

  function handleLogout(): void {
    logout();
  }

  // Calculate summary stats
  $: totalPracticeHours = practices.reduce((sum, practice) => sum + practice.duration, 0) / 60;
  $: totalEarnings = gigs
    .filter(gig => gig.status === 'completed')
    .reduce((sum, gig) => sum + (gig.earnings || 0), 0);
  $: masteredSongs = songs.filter(song => song.status === 'mastered').length;
  $: upcomingGigs = gigs.filter(
    gig => gig.status === 'scheduled' && new Date(gig.date) > new Date()
  ).length;
</script>

<svelte:head>
  <title>Analytics - ChordLine</title>
</svelte:head>

{#if user}
  <Navigation {user} {selectedBandId} onBandChange={handleBandChange} onLogout={handleLogout} />

  <main class="analytics-page">
    <div class="page-header">
      <h1>Your Musical Journey</h1>
      <div class="context-info">
        {#if selectedBandId}
          <span class="context-badge">Band View</span>
        {:else}
          <span class="context-badge">Personal View</span>
        {/if}
      </div>
    </div>

    {#if isLoading}
      <div class="loading-state">
        <p>Loading your analytics...</p>
      </div>
    {:else}
      <div class="summary-cards">
        <div class="summary-card">
          <div class="summary-icon">🎵</div>
          <div class="summary-content">
            <div class="summary-value">{Math.round(totalPracticeHours * 10) / 10}h</div>
            <div class="summary-label">Total Practice</div>
          </div>
        </div>

        <div class="summary-card">
          <div class="summary-icon">💰</div>
          <div class="summary-content">
            <div class="summary-value">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
              }).format(totalEarnings)}
            </div>
            <div class="summary-label">Total Earnings</div>
          </div>
        </div>

        <div class="summary-card">
          <div class="summary-icon">🏆</div>
          <div class="summary-content">
            <div class="summary-value">{masteredSongs}</div>
            <div class="summary-label">Songs Mastered</div>
          </div>
        </div>

        <div class="summary-card">
          <div class="summary-icon">📅</div>
          <div class="summary-content">
            <div class="summary-value">{upcomingGigs}</div>
            <div class="summary-label">Upcoming Gigs</div>
          </div>
        </div>
      </div>

      <div class="analytics-grid">
        {#if practices.length > 0}
          <PracticeStats {practices} />
        {:else}
          <div class="empty-section">
            <h3>Practice Statistics</h3>
            <p>
              No practice sessions logged yet. <a href="/practice">Start tracking your practice!</a>
            </p>
          </div>
        {/if}

        {#if gigs.length > 0}
          <GigStats {gigs} />
        {:else}
          <div class="empty-section">
            <h3>Gig Statistics</h3>
            <p>No gigs recorded yet. <a href="/gigs">Add your first gig!</a></p>
          </div>
        {/if}

        {#if songs.length > 0}
          <SongProgress {songs} />
        {:else}
          <div class="empty-section">
            <h3>Song Library Progress</h3>
            <p>No songs in your library yet. <a href="/songs">Build your repertoire!</a></p>
          </div>
        {/if}
      </div>
    {/if}
  </main>
{:else}
  <div class="auth-required">
    <h1>Authentication Required</h1>
    <p>Please <a href="/login">log in</a> to view your analytics.</p>
  </div>
{/if}

<style>
  .analytics-page {
    min-height: calc(100vh - 60px);
    background: #f8f9fa;
    padding: 0 1.5rem 2rem;
    max-width: 1200px;
    margin: 0 auto;
  }

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 2rem 0 1rem;
  }

  .page-header h1 {
    margin: 0;
    font-size: 2rem;
    font-weight: 700;
    color: #111827;
  }

  .context-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .context-badge {
    padding: 0.5rem 1rem;
    background: #e0e7ff;
    color: #3730a3;
    border-radius: 20px;
    font-size: 0.875rem;
    font-weight: 500;
  }

  .loading-state {
    text-align: center;
    padding: 3rem 1rem;
    color: #6b7280;
  }

  .summary-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .summary-card {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 1.5rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    transition: all 0.2s;
  }

  .summary-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    border-color: #d1d5db;
  }

  .summary-icon {
    font-size: 2rem;
    opacity: 0.8;
  }

  .summary-content {
    flex-grow: 1;
  }

  .summary-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: #111827;
    margin-bottom: 0.25rem;
  }

  .summary-label {
    font-size: 0.875rem;
    color: #6b7280;
    font-weight: 500;
  }

  .analytics-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 0;
  }

  .empty-section {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 2rem;
    text-align: center;
    margin-bottom: 1.5rem;
  }

  .empty-section h3 {
    margin: 0 0 1rem 0;
    font-size: 1.125rem;
    font-weight: 600;
    color: #111827;
  }

  .empty-section p {
    margin: 0;
    color: #6b7280;
  }

  .empty-section a {
    color: #3b82f6;
    text-decoration: none;
    font-weight: 500;
  }

  .empty-section a:hover {
    text-decoration: underline;
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
    .analytics-page {
      padding: 0 1rem 2rem;
    }

    .page-header {
      flex-direction: column;
      gap: 1rem;
      align-items: flex-start;
    }

    .summary-cards {
      grid-template-columns: repeat(2, 1fr);
    }

    .summary-card {
      flex-direction: column;
      text-align: center;
      gap: 0.5rem;
    }

    .summary-icon {
      font-size: 1.5rem;
    }

    .summary-value {
      font-size: 1.25rem;
    }
  }
</style>
