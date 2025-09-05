<script lang="ts">
  import type { Song } from '../../../../backend/database/types.js';

  export let songs: Song[];

  let stats = {
    totalSongs: 0,
    learningSongs: 0,
    readySongs: 0,
    masteredSongs: 0,
    genreDistribution: [] as Array<{ genre: string; count: number; percentage: number }>,
    recentProgress: [] as Array<{ title: string; status: string; progress: string }>
  };

  $: if (songs.length > 0) {
    calculateStats();
  }

  function calculateStats(): void {
    const totalSongs = songs.length;
    const learningSongs = songs.filter(song => song.status === 'learning').length;
    const readySongs = songs.filter(song => song.status === 'ready').length;
    const masteredSongs = songs.filter(song => song.status === 'mastered').length;

    // Calculate genre distribution
    const genreCounts: Record<string, number> = {};
    songs.forEach(song => {
      const genre = song.genre || 'Unspecified';
      genreCounts[genre] = (genreCounts[genre] || 0) + 1;
    });

    const genreDistribution = Object.entries(genreCounts)
      .map(([genre, count]) => ({
        genre,
        count,
        percentage: Math.round((count / totalSongs) * 100)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    // Calculate recent progress (songs updated in the last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentProgress = songs
      .filter(song => new Date(song.updatedAt) > thirtyDaysAgo)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5)
      .map(song => ({
        title: song.title,
        status: song.status,
        progress: getProgressText(song.status)
      }));

    stats = {
      totalSongs,
      learningSongs,
      readySongs,
      masteredSongs,
      genreDistribution,
      recentProgress
    };
  }

  function getProgressText(status: string): string {
    switch (status) {
      case 'learning':
        return 'In Progress';
      case 'ready':
        return 'Performance Ready';
      case 'mastered':
        return 'Mastered';
      default:
        return status;
    }
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

  // Calculate completion percentage
  $: completionPercentage = stats.totalSongs > 0 
    ? Math.round(((stats.readySongs + stats.masteredSongs) / stats.totalSongs) * 100)
    : 0;
</script>

<div class="song-progress">
  <h3>Song Library Progress</h3>

  <div class="progress-overview">
    <div class="progress-circle">
      <svg width="120" height="120" viewBox="0 0 42 42">
        <circle
          cx="21"
          cy="21"
          r="15.5"
          fill="transparent"
          stroke="#e5e7eb"
          stroke-width="3"
        />
        <circle
          cx="21"
          cy="21"
          r="15.5"
          fill="transparent"
          stroke="#10b981"
          stroke-width="3"
          stroke-dasharray="{(completionPercentage / 100) * 97.389} 97.389"
          stroke-dashoffset="0"
          transform="rotate(-90 21 21)"
          class="progress-ring"
        />
      </svg>
      <div class="progress-text">
        <div class="progress-percentage">{completionPercentage}%</div>
        <div class="progress-label">Ready</div>
      </div>
    </div>

    <div class="progress-breakdown">
      <div class="breakdown-item">
        <div class="breakdown-dot learning"></div>
        <span class="breakdown-text">Learning: {stats.learningSongs}</span>
      </div>
      <div class="breakdown-item">
        <div class="breakdown-dot ready"></div>
        <span class="breakdown-text">Ready: {stats.readySongs}</span>
      </div>
      <div class="breakdown-item">
        <div class="breakdown-dot mastered"></div>
        <span class="breakdown-text">Mastered: {stats.masteredSongs}</span>
      </div>
    </div>
  </div>

  {#if stats.genreDistribution.length > 0}
    <div class="section">
      <h4>Genre Distribution</h4>
      <div class="genre-chart">
        {#each stats.genreDistribution as genre}
          <div class="genre-item">
            <span class="genre-name">{genre.genre}</span>
            <div class="genre-bar">
              <div 
                class="genre-fill" 
                style="width: {genre.percentage}%"
              ></div>
            </div>
            <span class="genre-count">{genre.count} ({genre.percentage}%)</span>
          </div>
        {/each}
      </div>
    </div>
  {/if}

  {#if stats.recentProgress.length > 0}
    <div class="section">
      <h4>Recent Progress</h4>
      <div class="recent-list">
        {#each stats.recentProgress as item}
          <div class="recent-item">
            <div class="recent-song">
              <span class="song-title">{item.title}</span>
            </div>
            <div class="recent-status" style="color: {getStatusColor(item.status)}">
              {item.progress}
            </div>
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>

<style>
  .song-progress {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .song-progress h3 {
    margin: 0 0 1.5rem 0;
    font-size: 1.125rem;
    font-weight: 600;
    color: #111827;
  }

  .progress-overview {
    display: flex;
    align-items: center;
    gap: 2rem;
    margin-bottom: 2rem;
  }

  .progress-circle {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .progress-ring {
    transition: stroke-dasharray 0.6s ease;
  }

  .progress-text {
    position: absolute;
    text-align: center;
  }

  .progress-percentage {
    font-size: 1.5rem;
    font-weight: 700;
    color: #10b981;
    line-height: 1;
  }

  .progress-label {
    font-size: 0.75rem;
    color: #6b7280;
    font-weight: 500;
  }

  .progress-breakdown {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .breakdown-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .breakdown-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
  }

  .breakdown-dot.learning {
    background: #f59e0b;
  }

  .breakdown-dot.ready {
    background: #3b82f6;
  }

  .breakdown-dot.mastered {
    background: #10b981;
  }

  .breakdown-text {
    font-size: 0.875rem;
    color: #374151;
    font-weight: 500;
  }

  .section {
    margin-bottom: 2rem;
  }

  .section:last-child {
    margin-bottom: 0;
  }

  .section h4 {
    margin: 0 0 1rem 0;
    font-size: 1rem;
    font-weight: 600;
    color: #374151;
  }

  .genre-chart {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .genre-item {
    display: grid;
    grid-template-columns: 100px 1fr 80px;
    align-items: center;
    gap: 1rem;
  }

  .genre-name {
    font-size: 0.875rem;
    font-weight: 500;
    color: #374151;
  }

  .genre-bar {
    height: 8px;
    background: #e5e7eb;
    border-radius: 4px;
    overflow: hidden;
  }

  .genre-fill {
    height: 100%;
    background: #8b5cf6;
    transition: width 0.3s ease;
  }

  .genre-count {
    font-size: 0.75rem;
    color: #6b7280;
    text-align: right;
  }

  .recent-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .recent-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem;
    background: #f8f9fa;
    border-radius: 6px;
  }

  .recent-song {
    flex-grow: 1;
  }

  .song-title {
    font-size: 0.875rem;
    font-weight: 500;
    color: #374151;
  }

  .recent-status {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  @media (max-width: 768px) {
    .progress-overview {
      flex-direction: column;
      gap: 1.5rem;
      text-align: center;
    }

    .genre-item {
      grid-template-columns: 80px 1fr 60px;
      gap: 0.5rem;
    }

    .genre-name {
      font-size: 0.75rem;
    }

    .recent-item {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.5rem;
    }

    .recent-status {
      align-self: flex-end;
    }
  }
</style>