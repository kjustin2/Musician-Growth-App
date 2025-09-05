<script lang="ts">
  import type { Song } from '../../../../backend/database/types.js';

  export let songs: Song[];
  export let isLoading: boolean;
  export let onEdit: (song: Song) => void;
  export let onDelete: (song: Song) => void;

  let filter: 'all' | 'learning' | 'ready' | 'mastered' = 'all';
  let sortBy: 'title' | 'artist' | 'status' | 'dateAdded' = 'title';
  let sortOrder: 'asc' | 'desc' = 'asc';
  let searchQuery = '';

  $: filteredSongs = songs
    .filter(song => {
      // Filter by status
      if (filter !== 'all' && song.status !== filter) {
        return false;
      }

      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          song.title.toLowerCase().includes(query) ||
          song.artist?.toLowerCase().includes(query) ||
          song.genre?.toLowerCase().includes(query)
        );
      }

      return true;
    })
    .sort((a, b) => {
      let aValue: string | number | Date;
      let bValue: string | number | Date;

      switch (sortBy) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'artist':
          aValue = (a.artist || '').toLowerCase();
          bValue = (b.artist || '').toLowerCase();
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'dateAdded':
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        default:
          return 0;
      }

      if (aValue < bValue) {
        return sortOrder === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortOrder === 'asc' ? 1 : -1;
      }
      return 0;
    });

  function formatDuration(seconds?: number): string {
    if (!seconds) {
      return '';
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  function getStatusColor(status: string): string {
    switch (status) {
      case 'learning':
        return '#f59e0b';
      case 'ready':
        return '#3b82f6';
      case 'mastered':
        return '#10b981';
      default:
        return '#6b7280';
    }
  }

  function getStatusLabel(status: string): string {
    switch (status) {
      case 'learning':
        return 'Learning';
      case 'ready':
        return 'Ready';
      case 'mastered':
        return 'Mastered';
      default:
        return status;
    }
  }

  function handleEdit(song: Song): void {
    onEdit(song);
  }

  function handleDelete(song: Song): void {
    onDelete(song);
  }

  function toggleSort(newSortBy: typeof sortBy): void {
    if (sortBy === newSortBy) {
      sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      sortBy = newSortBy;
      sortOrder = 'asc';
    }
  }

  // Calculate stats for current filter
  $: statusCounts = songs.reduce(
    (counts, song) => {
      counts[song.status] = (counts[song.status] || 0) + 1;
      return counts;
    },
    {} as Record<string, number>
  );
</script>

<div class="song-list">
  <div class="list-header">
    <div class="header-content">
      <h2>Your Song Library</h2>

      <div class="stats">
        <div class="stat">
          <span class="stat-value">{songs.length}</span>
          <span class="stat-label">Total Songs</span>
        </div>
        <div class="stat">
          <span class="stat-value">{statusCounts.mastered || 0}</span>
          <span class="stat-label">Mastered</span>
        </div>
      </div>
    </div>

    <div class="controls">
      <div class="search-box">
        <input
          type="text"
          placeholder="Search songs, artists, or genres..."
          bind:value={searchQuery}
          class="search-input"
        />
      </div>

      <div class="filter-controls">
        <button
          class="filter-button"
          class:active={filter === 'all'}
          on:click={() => (filter = 'all')}
        >
          All ({songs.length})
        </button>
        <button
          class="filter-button"
          class:active={filter === 'learning'}
          on:click={() => (filter = 'learning')}
        >
          Learning ({statusCounts.learning || 0})
        </button>
        <button
          class="filter-button"
          class:active={filter === 'ready'}
          on:click={() => (filter = 'ready')}
        >
          Ready ({statusCounts.ready || 0})
        </button>
        <button
          class="filter-button"
          class:active={filter === 'mastered'}
          on:click={() => (filter = 'mastered')}
        >
          Mastered ({statusCounts.mastered || 0})
        </button>
      </div>
    </div>
  </div>

  <div class="list-content">
    {#if isLoading}
      <div class="loading-state">
        <p>Loading songs...</p>
      </div>
    {:else if filteredSongs.length === 0}
      <div class="empty-state">
        {#if searchQuery}
          <p>No songs match your search</p>
          <p class="empty-subtitle">Try different keywords or clear the search.</p>
        {:else if filter === 'all'}
          <p>No songs yet</p>
          <p class="empty-subtitle">Add your first song to start building your library!</p>
        {:else}
          <p>No {filter} songs</p>
          <p class="empty-subtitle">Try changing the filter or add some songs.</p>
        {/if}
      </div>
    {:else}
      <div class="table-container">
        <table class="songs-table">
          <thead>
            <tr>
              <th
                class="sortable"
                class:active={sortBy === 'title'}
                on:click={() => toggleSort('title')}
              >
                Title
                {#if sortBy === 'title'}
                  <span class="sort-indicator">{sortOrder === 'asc' ? '▲' : '▼'}</span>
                {/if}
              </th>
              <th
                class="sortable"
                class:active={sortBy === 'artist'}
                on:click={() => toggleSort('artist')}
              >
                Artist
                {#if sortBy === 'artist'}
                  <span class="sort-indicator">{sortOrder === 'asc' ? '▲' : '▼'}</span>
                {/if}
              </th>
              <th>Genre</th>
              <th>Key</th>
              <th>Tempo</th>
              <th>Duration</th>
              <th
                class="sortable"
                class:active={sortBy === 'status'}
                on:click={() => toggleSort('status')}
              >
                Status
                {#if sortBy === 'status'}
                  <span class="sort-indicator">{sortOrder === 'asc' ? '▲' : '▼'}</span>
                {/if}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {#each filteredSongs as song (song.id)}
              <tr>
                <td class="song-title">
                  <div>
                    {song.title}
                    {#if song.recordingUrl}
                      <a
                        href={song.recordingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        class="recording-link"
                      >
                        🎵
                      </a>
                    {/if}
                  </div>
                </td>
                <td>{song.artist || '-'}</td>
                <td>{song.genre || '-'}</td>
                <td>{song.key || '-'}</td>
                <td>{song.tempo ? `${song.tempo} BPM` : '-'}</td>
                <td>{formatDuration(song.duration) || '-'}</td>
                <td>
                  <span
                    class="status-badge"
                    style="background-color: {getStatusColor(
                      song.status
                    )}22; color: {getStatusColor(song.status)}"
                  >
                    {getStatusLabel(song.status)}
                  </span>
                </td>
                <td class="actions">
                  <button class="edit-button" on:click={() => handleEdit(song)}> Edit </button>
                  <button class="delete-button" on:click={() => handleDelete(song)}>
                    Delete
                  </button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </div>
</div>

<style>
  .song-list {
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

  .controls {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .search-box {
    display: flex;
  }

  .search-input {
    width: 300px;
    padding: 0.5rem 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
    font-size: 0.875rem;
  }

  .search-input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
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

  .table-container {
    overflow-x: auto;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    background: white;
  }

  .songs-table {
    width: 100%;
    border-collapse: collapse;
  }

  .songs-table th,
  .songs-table td {
    padding: 0.75rem;
    text-align: left;
    border-bottom: 1px solid #f3f4f6;
  }

  .songs-table th {
    background: #f8f9fa;
    font-weight: 600;
    color: #374151;
    font-size: 0.875rem;
  }

  .songs-table td {
    font-size: 0.875rem;
    color: #6b7280;
  }

  .sortable {
    cursor: pointer;
    user-select: none;
    position: relative;
  }

  .sortable:hover {
    background: #f1f5f9;
  }

  .sortable.active {
    background: #e0e7ff;
    color: #3b82f6;
  }

  .sort-indicator {
    margin-left: 0.25rem;
    font-size: 0.75rem;
  }

  .song-title {
    font-weight: 500;
    color: #374151;
  }

  .recording-link {
    margin-left: 0.5rem;
    text-decoration: none;
    font-size: 0.875rem;
  }

  .recording-link:hover {
    opacity: 0.7;
  }

  .status-badge {
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .actions {
    white-space: nowrap;
  }

  .edit-button,
  .delete-button {
    padding: 0.375rem 0.75rem;
    border: none;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    margin-right: 0.5rem;
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
    .song-list {
      padding: 1rem;
    }

    .header-content {
      flex-direction: column;
      align-items: stretch;
    }

    .stats {
      justify-content: center;
    }

    .search-input {
      width: 100%;
    }

    .filter-controls {
      justify-content: center;
    }

    .table-container {
      font-size: 0.75rem;
    }

    .songs-table th,
    .songs-table td {
      padding: 0.5rem 0.25rem;
    }

    /* Hide less important columns on mobile */
    .songs-table th:nth-child(3),
    .songs-table td:nth-child(3),
    .songs-table th:nth-child(4),
    .songs-table td:nth-child(4),
    .songs-table th:nth-child(5),
    .songs-table td:nth-child(5),
    .songs-table th:nth-child(6),
    .songs-table td:nth-child(6) {
      display: none;
    }
  }
</style>
