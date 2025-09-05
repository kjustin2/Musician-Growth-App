<script lang="ts">
  import { page } from '$app/stores';
  import BandSelector from './BandSelector.svelte';
  import type { User } from '../../../../backend/database/types.js';

  export let user: User;
  export let selectedBandId: number | null = null;
  export let onBandChange: (bandId: number | null) => void;
  export let onLogout: () => void;

  let isLoggingOut = false;

  interface NavItem {
    href: string;
    label: string;
    icon: string;
  }

  const navItems: NavItem[] = [
    { href: '/', label: 'Dashboard', icon: '🏠' },
    { href: '/gigs', label: 'Gigs', icon: '🎤' },
    { href: '/practice', label: 'Practice', icon: '🎵' },
    { href: '/songs', label: 'Songs', icon: '🎶' },
    { href: '/bands', label: 'Bands', icon: '👥' },
    { href: '/analytics', label: 'Analytics', icon: '📊' },
  ];

  function isActive(href: string): boolean {
    if (href === '/') {
      return $page.url.pathname === '/';
    }
    return $page.url.pathname.startsWith(href);
  }

  async function handleLogout(): Promise<void> {
    try {
      isLoggingOut = true;
      onLogout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      isLoggingOut = false;
    }
  }
</script>

<nav class="main-navigation">
  <div class="nav-container">
    <div class="nav-brand">
      <h1 class="app-title">ChordLine</h1>
      <span class="user-greeting">
        {user.email.split('@')[0]}
      </span>
    </div>

    <div class="nav-links">
      {#each navItems as item}
        <a
          href={item.href}
          class="nav-link"
          class:active={isActive(item.href)}
          data-sveltekit-preload-data="hover"
        >
          <span class="nav-icon">{item.icon}</span>
          <span class="nav-label">{item.label}</span>
        </a>
      {/each}
    </div>

    <div class="nav-controls">
      <BandSelector {user} {selectedBandId} {onBandChange} />

      <button class="logout-button" on:click={handleLogout} disabled={isLoggingOut}>
        {isLoggingOut ? 'Signing Out...' : 'Sign Out'}
      </button>
    </div>
  </div>
</nav>

<style>
  .main-navigation {
    background: var(--bg-primary, white);
    border-bottom: 1px solid var(--border-color, #e5e7eb);
    padding: 0.75rem 1rem;
    position: sticky;
    top: 0;
    z-index: 10;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  }

  .nav-container {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 2rem;
  }

  .nav-brand {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-shrink: 0;
  }

  .app-title {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--primary-color, #3b82f6);
    margin: 0;
  }

  .user-greeting {
    font-size: 0.875rem;
    color: var(--text-secondary, #666);
    font-weight: 500;
  }

  .nav-links {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-grow: 1;
    justify-content: center;
  }

  .nav-link {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    text-decoration: none;
    color: var(--text-secondary, #666);
    font-weight: 500;
    font-size: 0.875rem;
    transition: all 0.2s ease;
    white-space: nowrap;
  }

  .nav-link:hover {
    background: var(--bg-hover, #f3f4f6);
    color: var(--text-primary, #374151);
  }

  .nav-link.active {
    background: var(--primary-color, #3b82f6);
    color: white;
  }

  .nav-link.active:hover {
    background: var(--primary-hover, #2563eb);
  }

  .nav-icon {
    font-size: 1rem;
  }

  .nav-label {
    font-size: 0.875rem;
  }

  .nav-controls {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-shrink: 0;
  }

  .logout-button {
    padding: 0.5rem 1rem;
    background: var(--bg-secondary, #f3f4f6);
    border: 1px solid var(--border-color, #d1d5db);
    border-radius: 0.375rem;
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--text-primary, #374151);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .logout-button:hover:not(:disabled) {
    background: var(--bg-hover, #e5e7eb);
    border-color: var(--border-hover, #9ca3af);
  }

  .logout-button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  /* Mobile responsiveness */
  @media (max-width: 768px) {
    .nav-container {
      flex-wrap: wrap;
      gap: 1rem;
    }

    .nav-brand {
      flex: 1;
      min-width: 200px;
    }

    .nav-links {
      order: 3;
      flex-basis: 100%;
      justify-content: flex-start;
      gap: 0.25rem;
      overflow-x: auto;
      padding: 0.5rem 0;
    }

    .nav-controls {
      flex-shrink: 0;
      gap: 0.75rem;
    }

    .user-greeting {
      display: none;
    }
  }

  @media (max-width: 480px) {
    .nav-link .nav-label {
      display: none;
    }

    .nav-link {
      padding: 0.5rem;
      min-width: 2.5rem;
      justify-content: center;
    }
  }

  /* Dark mode support */
  @media (prefers-color-scheme: dark) {
    .main-navigation {
      background: var(--bg-primary, #1f2937);
      border-color: var(--border-color, #374151);
    }

    .nav-link:hover {
      background: var(--bg-hover, #374151);
      color: var(--text-primary, #f3f4f6);
    }

    .logout-button {
      background: var(--bg-secondary, #374151);
      border-color: var(--border-color, #4b5563);
      color: var(--text-primary, #f3f4f6);
    }

    .logout-button:hover:not(:disabled) {
      background: var(--bg-hover, #4b5563);
      border-color: var(--border-hover, #6b7280);
    }
  }
</style>
