import { onMount } from 'svelte';
import { createItemLogic } from './types/itemLogic.js';

export function createAppLogic(): ReturnType<typeof createItemLogic> & { loading: boolean } {
  let loading = false;

  // Delegate item-specific logic to itemLogic
  const itemLogic = createItemLogic();

  // Load all data when app mounts
  onMount(async () => {
    loading = true;
    try {
      // Load all entity types
      await itemLogic.itemEntity.load();
      // Add more entity loads here as they're created
    } finally {
      loading = false;
    }
  });

  return {
    // App-level state
    get loading(): boolean {
      return loading;
    },

    // Re-export item logic
    ...itemLogic,
  };
}
