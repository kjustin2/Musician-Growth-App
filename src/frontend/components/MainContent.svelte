<script>
  export let newItemName;
  export let newItemDescription;
  export let loading;
  export let items;
  export let addItem;
  export let deleteItem;
</script>

<main>
  <h1>Svelte + Dexie.js Demo</h1>

  <div class="card">
    <h2>Add New Item</h2>
    <form on:submit|preventDefault={addItem}>
      <div>
        <input bind:value={$newItemName} placeholder="Item name" required />
      </div>
      <div>
        <textarea bind:value={$newItemDescription} placeholder="Description (optional)" rows="3"
        ></textarea>
      </div>
      <button type="submit">Add Item</button>
    </form>
  </div>

  <div class="card">
    <h2>Items ({$items.length})</h2>

    {#if loading}
      <p>Loading...</p>
    {:else if $items.length === 0}
      <p>No items yet. Add one above!</p>
    {:else}
      <div class="items-list">
        {#each $items as item (item.id)}
          <div class="item">
            <h3>{item.name}</h3>
            {#if item.description}
              <p>{item.description}</p>
            {/if}
            <small>Created: {new Date(item.createdAt).toLocaleString()}</small>
            <button on:click={() => deleteItem(item.id)} class="delete-btn"> Delete </button>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</main>
