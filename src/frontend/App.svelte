<script>
  import { onMount } from 'svelte';
  import AuthPage from './components/auth/AuthPage.svelte';
  import Dashboard from './components/dashboard/Dashboard.svelte';
  import { createAuthLogic } from './logic/authLogic.ts';

  const authLogic = createAuthLogic();
  const { authState, logout, initialize } = authLogic;

  onMount(async () => {
    console.log('App.svelte: onMount - initializing auth');
    await initialize();
    console.log('App.svelte: initialization complete');
  });

  // Add reactive logging for auth state changes
  $: {
    console.log('App.svelte: Auth state changed:', {
      isLoading: $authState.isLoading,
      isAuthenticated: $authState.isAuthenticated,
      hasUser: !!$authState.user,
      error: $authState.error,
    });
  }

  async function handleLogout() {
    await logout();
  }
</script>

<main>
  {#if $authState.isLoading}
    <div class="loading-screen">
      <div class="loading-spinner"></div>
      <p>Loading ChordLine...</p>
    </div>
  {:else if $authState.isAuthenticated && $authState.user}
    <Dashboard user={$authState.user} onLogout={handleLogout} />
  {:else}
    <AuthPage {authLogic} />
  {/if}
</main>

<style>
  @import './css/components/loading.css';

  main {
    width: 100%;
    min-height: 100vh;
  }
</style>
