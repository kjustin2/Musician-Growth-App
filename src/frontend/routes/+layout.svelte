<script>
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import '$lib/styles/app.css';
  import { initialize, isAuthenticated } from '$lib/logic/authLogic';

  onMount(() => {
    // Initialize auth state on app start
    initialize();
  });

  // Reactive statement to handle routing based on auth state
  $: if (typeof window !== 'undefined') {
    const currentPath = $page.url.pathname;
    const isAuthPage =
      currentPath === '/' || currentPath === '/login' || currentPath === '/register';

    // If not authenticated and not on an auth page, redirect to home
    if (!$isAuthenticated && !isAuthPage) {
      goto('/');
    }
  }
</script>

<slot />
