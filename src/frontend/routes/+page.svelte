<script lang="ts">
  import AuthPage from '$lib/components/auth/AuthPage.svelte';
  import Dashboard from '$lib/components/dashboard/Dashboard.svelte';
  import { createAuthLogic } from '$lib/logic/authLogic';
  import { onMount } from 'svelte';

  const authLogic = createAuthLogic();
  const { authState, logout, initialize } = authLogic;

  onMount(() => {
    initialize();
  });

  function handleLogout(): void {
    logout();
  }
</script>

<svelte:head>
  <title>ChordLine - Musician Growth App</title>
  <meta
    name="description"
    content="Track your musical progress and achieve your goals with ChordLine"
  />
</svelte:head>

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
  @import '$lib/styles/components/loading.css';

  main {
    width: 100%;
    min-height: 100vh;
  }
</style>
