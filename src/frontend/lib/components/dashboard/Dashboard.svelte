<script lang="ts">
  import { onMount } from 'svelte';
  import Navigation from '../shared/Navigation.svelte';
  import { formatUserGreeting } from '$lib/logic/uiUtils';
  import { gigService, practiceService } from '../../../../backend/database/db.js';
  import type { User, Gig, Practice } from '../../../../backend/database/types.js';

  export let user: User;
  export let onLogout: () => void;

  let selectedBandId: number | null = null;
  let upcomingGigs: Gig[] = [];
  let recentPractices: Practice[] = [];
  let totalEarnings = 0;
  let practiceStreak = 0;
  let isLoading = true;

  onMount(async () => {
    await loadDashboardData();
  });

  async function loadDashboardData(): Promise<void> {
    try {
      isLoading = true;
      await Promise.all([loadUpcomingGigs(), loadRecentPractices(), loadStats()]);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      isLoading = false;
    }
  }

  async function loadUpcomingGigs(): Promise<void> {
    upcomingGigs = await gigService.findUpcoming(user.id!, selectedBandId);
  }

  async function loadRecentPractices(): Promise<void> {
    const allPractices = await practiceService.findByUserAndBand(user.id!, selectedBandId);
    recentPractices = allPractices.slice(0, 5);
  }

  async function loadStats(): Promise<void> {
    totalEarnings = await gigService.getTotalEarnings(user.id!, selectedBandId);
    practiceStreak = await practiceService.getPracticeStreak(user.id!, selectedBandId);
  }

  function handleBandChange(bandId: number | null): void {
    selectedBandId = bandId;
    void loadDashboardData();
  }

  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }

  function formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  }
</script>

<div class="dashboard">
  <Navigation {user} {selectedBandId} onBandChange={handleBandChange} {onLogout} />

  <main class="dashboard-main">
    <div class="main-content">
      <div class="welcome-section">
        <h2>{formatUserGreeting(user.email)}</h2>
        <p>
          {#if selectedBandId}
            Viewing data for your selected band.
          {:else}
            Viewing your personal musical data.
          {/if}
        </p>
      </div>

      {#if isLoading}
        <div class="loading-state">
          <p>Loading your dashboard...</p>
        </div>
      {:else}
        <div class="dashboard-grid">
          <!-- Stats Overview -->
          <div class="stats-section">
            <div class="stat-card earnings">
              <h3>Total Earnings</h3>
              <div class="stat-value">{formatCurrency(totalEarnings)}</div>
              <p class="stat-subtitle">From completed gigs</p>
            </div>

            <div class="stat-card streak">
              <h3>Practice Streak</h3>
              <div class="stat-value">{practiceStreak}</div>
              <p class="stat-subtitle">
                {practiceStreak === 1 ? 'day' : 'days'} in a row
              </p>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="quick-actions-card">
            <h3>Quick Actions</h3>
            <div class="actions-grid">
              <a href="/gigs" class="action-button">
                <span class="action-icon">🎤</span>
                <span>Log Gig</span>
              </a>
              <a href="/practice" class="action-button">
                <span class="action-icon">🎵</span>
                <span>Log Practice</span>
              </a>
              <a href="/songs" class="action-button">
                <span class="action-icon">🎶</span>
                <span>Add Song</span>
              </a>
              <a href="/bands" class="action-button">
                <span class="action-icon">👥</span>
                <span>Manage Bands</span>
              </a>
            </div>
          </div>

          <!-- Upcoming Gigs -->
          <div class="upcoming-gigs-card">
            <h3>Upcoming Gigs</h3>
            {#if upcomingGigs.length > 0}
              <div class="gigs-list">
                {#each upcomingGigs.slice(0, 3) as gig}
                  <div class="gig-item">
                    <div class="gig-title">{gig.title}</div>
                    <div class="gig-date">{formatDate(gig.date)}</div>
                    <div class="gig-venue">{gig.venueName || 'Venue TBD'}</div>
                  </div>
                {/each}
              </div>
              <a href="/gigs" class="view-all-link">View all gigs</a>
            {:else}
              <div class="empty-state">
                <p>No upcoming gigs scheduled</p>
                <a href="/gigs" class="cta-link">Schedule your first gig</a>
              </div>
            {/if}
          </div>

          <!-- Recent Practice -->
          <div class="recent-practice-card">
            <h3>Recent Practice Sessions</h3>
            {#if recentPractices.length > 0}
              <div class="practices-list">
                {#each recentPractices as practice}
                  <div class="practice-item">
                    <div class="practice-date">{formatDate(practice.date)}</div>
                    <div class="practice-duration">{practice.duration} min</div>
                    <div class="practice-focus">
                      {practice.focusAreas.slice(0, 2).join(', ')}
                      {#if practice.focusAreas.length > 2}
                        +{practice.focusAreas.length - 2} more
                      {/if}
                    </div>
                  </div>
                {/each}
              </div>
              <a href="/practice" class="view-all-link">View all sessions</a>
            {:else}
              <div class="empty-state">
                <p>No practice sessions logged yet</p>
                <a href="/practice" class="cta-link">Log your first practice</a>
              </div>
            {/if}
          </div>
        </div>
      {/if}
    </div>
  </main>
</div>

<style>
  @import '$lib/styles/components/dashboard.css';
</style>
