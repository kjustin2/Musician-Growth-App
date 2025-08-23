<script lang="ts">
  import { formatUserGreeting, getLoadingButtonText } from '$lib/logic/uiUtils';
  import type { User } from '../../../../backend/database/types.js';

  export let user: User;
  export let onLogout: () => void;

  let isLoggingOut = false;

  function handleLogout(): void {
    try {
      isLoggingOut = true;
      onLogout();
    } catch (error) {
      // Log error for debugging but don't show to user since logout should always work
      // eslint-disable-next-line no-console
      console.error('Logout failed:', error);
    } finally {
      isLoggingOut = false;
    }
  }
</script>

<div class="dashboard">
  <header class="dashboard-header">
    <div class="header-content">
      <div class="header-left">
        <h1 class="dashboard-app-title">ChordLine</h1>
        <span class="user-greeting">{formatUserGreeting(user.email)}</span>
      </div>
      <div class="header-right">
        <button class="logout-button" on:click={handleLogout} disabled={isLoggingOut}>
          {getLoadingButtonText(isLoggingOut, 'Sign Out', 'Signing Out...')}
        </button>
      </div>
    </div>
  </header>

  <main class="dashboard-main">
    <div class="main-content">
      <div class="welcome-section">
        <h2>Your Musical Journey Starts Here</h2>
        <p>
          Welcome to ChordLine! This is your dashboard where you'll be able to track your musical
          progress, manage your bands, log gigs and practice sessions, and much more.
        </p>
        <div class="coming-soon">
          <h3>Coming Soon:</h3>
          <ul>
            <li>Band management and switching</li>
            <li>Song library and set list creation</li>
            <li>Gig and practice logging</li>
            <li>Progress tracking and goals</li>
            <li>Achievement system</li>
          </ul>
        </div>
      </div>

      <div class="placeholder-sections">
        <div class="placeholder-card">
          <h3>Quick Actions</h3>
          <p>Add songs, log gigs, track practice sessions</p>
        </div>

        <div class="placeholder-card">
          <h3>Progress Overview</h3>
          <p>View your musical progress and statistics</p>
        </div>

        <div class="placeholder-card">
          <h3>Recent Activity</h3>
          <p>See your latest gigs and practice sessions</p>
        </div>
      </div>
    </div>
  </main>
</div>

<style>
  @import '$lib/styles/components/dashboard.css';
</style>
