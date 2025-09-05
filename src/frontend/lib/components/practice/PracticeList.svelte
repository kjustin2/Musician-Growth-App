<script lang="ts">
  import type { Practice } from '../../../../backend/database/types.js';

  export let practices: Practice[];
  export let isLoading: boolean;
  export let onEdit: (practice: Practice) => void;
  export let onDelete: (practice: Practice) => void;

  let filter: 'all' | 'recent' | 'this-month' | 'rated-high' = 'all';

  $: filteredPractices = practices.filter(practice => {
    const practiceDate = new Date(practice.date);
    const now = new Date();
    
    switch (filter) {
      case 'recent':
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 7);
        return practiceDate >= sevenDaysAgo;
      
      case 'this-month':
        return practiceDate.getMonth() === now.getMonth() && 
               practiceDate.getFullYear() === now.getFullYear();
      
      case 'rated-high':
        return (practice.rating || 0) >= 4;
      
      default:
        return true;
    }
  });

  function formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(date));
  }

  function formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  }

  function getRatingStars(rating?: number): string {
    if (!rating) return '';
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  }

  function getRatingColor(rating?: number): string {
    if (!rating) return '#9ca3af';
    if (rating >= 4) return '#10b981';
    if (rating >= 3) return '#f59e0b';
    return '#ef4444';
  }

  function handleEdit(practice: Practice): void {
    onEdit(practice);
  }

  function handleDelete(practice: Practice): void {
    onDelete(practice);
  }

  // Calculate total practice time for current filter
  $: totalTime = filteredPractices.reduce((sum, practice) => sum + practice.duration, 0);
  $: averageRating = filteredPractices.length > 0 
    ? filteredPractices.reduce((sum, practice) => sum + (practice.rating || 0), 0) / filteredPractices.length
    : 0;
</script>

<div class="practice-list">
  <div class="list-header">
    <div class="header-content">
      <h2>Your Practice Sessions</h2>
      
      <div class="stats">
        <div class="stat">
          <span class="stat-value">{formatDuration(totalTime)}</span>
          <span class="stat-label">Total Time</span>
        </div>
        {#if averageRating > 0}
          <div class="stat">
            <span class="stat-value">{averageRating.toFixed(1)}</span>
            <span class="stat-label">Avg Rating</span>
          </div>
        {/if}
      </div>
    </div>

    <div class="filter-controls">
      <button
        class="filter-button"
        class:active={filter === 'all'}
        on:click={() => (filter = 'all')}
      >
        All ({practices.length})
      </button>
      <button
        class="filter-button"
        class:active={filter === 'recent'}
        on:click={() => (filter = 'recent')}
      >
        Recent ({practices.filter(p => {
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          return new Date(p.date) >= sevenDaysAgo;
        }).length})
      </button>
      <button
        class="filter-button"
        class:active={filter === 'this-month'}
        on:click={() => (filter = 'this-month')}
      >
        This Month ({practices.filter(p => {
          const now = new Date();
          const practiceDate = new Date(p.date);
          return practiceDate.getMonth() === now.getMonth() && 
                 practiceDate.getFullYear() === now.getFullYear();
        }).length})
      </button>
      <button
        class="filter-button"
        class:active={filter === 'rated-high'}
        on:click={() => (filter = 'rated-high')}
      >
        High Rated ({practices.filter(p => (p.rating || 0) >= 4).length})
      </button>
    </div>
  </div>

  <div class="list-content">
    {#if isLoading}
      <div class="loading-state">
        <p>Loading practice sessions...</p>
      </div>
    {:else if filteredPractices.length === 0}
      <div class="empty-state">
        {#if filter === 'all'}
          <p>No practice sessions yet</p>
          <p class="empty-subtitle">Start logging your practice to track your progress!</p>
        {:else}
          <p>No {filter.replace('-', ' ')} practice sessions</p>
          <p class="empty-subtitle">Try changing the filter or log a new practice session.</p>
        {/if}
      </div>
    {:else}
      <div class="practices-grid">
        {#each filteredPractices as practice (practice.id)}
          <div class="practice-card">
            <div class="practice-header">
              <div class="practice-date">{formatDate(practice.date)}</div>
              <div class="practice-duration">{formatDuration(practice.duration)}</div>
            </div>

            <div class="practice-details">
              <div class="focus-areas">
                <strong>Focus:</strong>
                {#each practice.focusAreas as area, index}
                  <span class="focus-tag">{area}</span>
                  {#if index < practice.focusAreas.length - 1}<span class="separator">, </span>{/if}
                {/each}
              </div>

              {#if practice.rating}
                <div class="practice-rating">
                  <span class="rating-stars" style="color: {getRatingColor(practice.rating)}">
                    {getRatingStars(practice.rating)}
                  </span>
                  <span class="rating-text">{practice.rating}/5</span>
                </div>
              {/if}

              {#if practice.notes}
                <div class="practice-notes">
                  📝 {practice.notes}
                </div>
              {/if}
            </div>

            <div class="practice-actions">
              <button class="edit-button" on:click={() => handleEdit(practice)}>
                Edit
              </button>
              <button class="delete-button" on:click={() => handleDelete(practice)}>
                Delete
              </button>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>

<style>
  .practice-list {
    padding: 1.5rem;
  }

  .list-header {
    margin-bottom: 1.5rem;
  }

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .header-content h2 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: #333;
  }

  .stats {
    display: flex;
    gap: 2rem;
  }

  .stat {
    text-align: center;
  }

  .stat-value {
    display: block;
    font-size: 1.25rem;
    font-weight: 600;
    color: #3b82f6;
  }

  .stat-label {
    font-size: 0.75rem;
    color: #6b7280;
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

  .practices-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 1.5rem;
  }

  .practice-card {
    background: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 8px;
    padding: 1.5rem;
    transition: all 0.2s;
  }

  .practice-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-color: #dee2e6;
  }

  .practice-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .practice-date {
    font-size: 1rem;
    font-weight: 600;
    color: #333;
  }

  .practice-duration {
    font-size: 1rem;
    font-weight: 600;
    color: #3b82f6;
  }

  .practice-details {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .focus-areas {
    font-size: 0.875rem;
    color: #374151;
  }

  .focus-tag {
    background: #e5e7eb;
    padding: 0.125rem 0.5rem;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 500;
    color: #374151;
  }

  .separator {
    color: #9ca3af;
  }

  .practice-rating {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .rating-stars {
    font-size: 1rem;
  }

  .rating-text {
    font-size: 0.875rem;
    color: #6b7280;
    font-weight: 500;
  }

  .practice-notes {
    font-size: 0.875rem;
    color: #666;
    font-style: italic;
    background: white;
    padding: 0.5rem;
    border-radius: 4px;
    border-left: 3px solid #e9ecef;
  }

  .practice-actions {
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
    .practice-list {
      padding: 1rem;
    }

    .header-content {
      flex-direction: column;
      align-items: stretch;
    }

    .stats {
      justify-content: center;
    }

    .filter-controls {
      justify-content: center;
    }

    .practices-grid {
      grid-template-columns: 1fr;
    }

    .practice-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.5rem;
    }

    .practice-actions {
      justify-content: stretch;
    }

    .edit-button,
    .delete-button {
      flex: 1;
    }
  }
</style>