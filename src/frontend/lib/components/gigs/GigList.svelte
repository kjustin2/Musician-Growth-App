<script lang="ts">
  import type { Gig } from '../../../../backend/database/types.js';

  export let gigs: Gig[];
  export let isLoading: boolean;
  export let onEdit: (gig: Gig) => void;
  export let onDelete: (gig: Gig) => void;

  let filter: 'all' | 'upcoming' | 'completed' | 'cancelled' = 'all';

  $: filteredGigs = gigs.filter(gig => {
    if (filter === 'all') {
      return true;
    }
    if (filter === 'upcoming') {
      return gig.status === 'scheduled' && new Date(gig.date) > new Date();
    }
    return gig.status === filter;
  });

  $: upcomingGigs = filteredGigs.filter(
    gig => gig.status === 'scheduled' && new Date(gig.date) > new Date()
  );
  $: pastGigs = filteredGigs.filter(
    gig => gig.status === 'completed' || new Date(gig.date) <= new Date()
  );

  function formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(date));
  }

  function formatCurrency(amount?: number): string {
    if (!amount) {
      return '$0';
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }

  function getStatusColor(status: string): string {
    switch (status) {
      case 'scheduled':
        return '#3b82f6';
      case 'completed':
        return '#10b981';
      case 'cancelled':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  }

  function getStatusLabel(status: string): string {
    switch (status) {
      case 'scheduled':
        return 'Scheduled';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  }

  function handleEdit(gig: Gig): void {
    onEdit(gig);
  }

  function handleDelete(gig: Gig): void {
    onDelete(gig);
  }
</script>

<div class="gig-list">
  <div class="list-header">
    <h2>Your Gigs</h2>

    <div class="filter-controls">
      <button
        class="filter-button"
        class:active={filter === 'all'}
        on:click={() => (filter = 'all')}
      >
        All ({gigs.length})
      </button>
      <button
        class="filter-button"
        class:active={filter === 'upcoming'}
        on:click={() => (filter = 'upcoming')}
      >
        Upcoming ({upcomingGigs.length})
      </button>
      <button
        class="filter-button"
        class:active={filter === 'completed'}
        on:click={() => (filter = 'completed')}
      >
        Completed ({gigs.filter(g => g.status === 'completed').length})
      </button>
      <button
        class="filter-button"
        class:active={filter === 'cancelled'}
        on:click={() => (filter = 'cancelled')}
      >
        Cancelled ({gigs.filter(g => g.status === 'cancelled').length})
      </button>
    </div>
  </div>

  <div class="list-content">
    {#if isLoading}
      <div class="loading-state">
        <p>Loading gigs...</p>
      </div>
    {:else if filteredGigs.length === 0}
      <div class="empty-state">
        {#if filter === 'all'}
          <p>No gigs yet</p>
          <p class="empty-subtitle">Create your first gig to start tracking your shows!</p>
        {:else}
          <p>No {filter} gigs</p>
          <p class="empty-subtitle">Try changing the filter or create a new gig.</p>
        {/if}
      </div>
    {:else}
      <div class="gigs-grid">
        {#each filteredGigs as gig (gig.id)}
          <div class="gig-card">
            <div class="gig-header">
              <div class="gig-title">{gig.title}</div>
              <div class="gig-status" style="background-color: {getStatusColor(gig.status)}">
                {getStatusLabel(gig.status)}
              </div>
            </div>

            <div class="gig-details">
              <div class="gig-date">
                📅 {formatDate(gig.date)}
                {#if gig.startTime}
                  at {gig.startTime}
                {/if}
              </div>

              {#if gig.venueName}
                <div class="gig-venue">
                  📍 {gig.venueName}
                </div>
              {/if}

              {#if gig.earnings}
                <div class="gig-earnings">
                  💰 {formatCurrency(gig.earnings)}
                </div>
              {/if}

              {#if gig.notes}
                <div class="gig-notes">
                  📝 {gig.notes}
                </div>
              {/if}
            </div>

            <div class="gig-actions">
              <button class="edit-button" on:click={() => handleEdit(gig)}> Edit </button>
              <button class="delete-button" on:click={() => handleDelete(gig)}> Delete </button>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>

<style>
  .gig-list {
    padding: 1.5rem;
  }

  .list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .list-header h2 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: #333;
  }

  .filter-controls {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .filter-button {
    padding: 0.5rem 1rem;
    background: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 6px;
    font-size: 0.875rem;
    font-weight: 500;
    color: #666;
    cursor: pointer;
    transition: all 0.2s;
  }

  .filter-button:hover {
    background: #e9ecef;
    border-color: #dee2e6;
  }

  .filter-button.active {
    background: #3b82f6;
    border-color: #3b82f6;
    color: white;
  }

  .list-content {
    min-height: 200px;
  }

  .loading-state,
  .empty-state {
    text-align: center;
    padding: 3rem 1rem;
    color: #666;
  }

  .empty-subtitle {
    font-size: 0.875rem;
    color: #888;
    margin-top: 0.5rem;
  }

  .gigs-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 1.5rem;
  }

  .gig-card {
    background: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 8px;
    padding: 1.5rem;
    transition: all 0.2s;
  }

  .gig-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-color: #dee2e6;
  }

  .gig-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;
    gap: 1rem;
  }

  .gig-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: #333;
    line-height: 1.3;
    flex-grow: 1;
  }

  .gig-status {
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 600;
    color: white;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    flex-shrink: 0;
  }

  .gig-details {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .gig-details > div {
    font-size: 0.875rem;
    color: #666;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .gig-earnings {
    font-weight: 600;
    color: #10b981;
  }

  .gig-notes {
    font-style: italic;
    background: white;
    padding: 0.5rem;
    border-radius: 4px;
    border-left: 3px solid #e9ecef;
  }

  .gig-actions {
    display: flex;
    gap: 0.75rem;
    justify-content: flex-end;
  }

  .edit-button,
  .delete-button {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .edit-button {
    background: #3b82f6;
    color: white;
  }

  .edit-button:hover {
    background: #2563eb;
  }

  .delete-button {
    background: #ef4444;
    color: white;
  }

  .delete-button:hover {
    background: #dc2626;
  }

  @media (max-width: 768px) {
    .gig-list {
      padding: 1rem;
    }

    .list-header {
      flex-direction: column;
      align-items: stretch;
    }

    .filter-controls {
      justify-content: center;
    }

    .gigs-grid {
      grid-template-columns: 1fr;
    }

    .gig-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.5rem;
    }

    .gig-status {
      align-self: flex-start;
    }

    .gig-actions {
      justify-content: stretch;
    }

    .edit-button,
    .delete-button {
      flex: 1;
    }
  }
</style>
