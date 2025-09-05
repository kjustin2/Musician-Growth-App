<script lang="ts">
  import { onMount } from 'svelte';
  import type { Practice } from '../../../../backend/database/types.js';

  export let practices: Practice[];

  let stats = {
    totalSessions: 0,
    totalHours: 0,
    averageSession: 0,
    averageRating: 0,
    topFocusAreas: [] as Array<{ area: string; count: number }>,
    monthlyTrend: [] as Array<{ month: string; sessions: number; hours: number }>
  };

  $: if (practices.length > 0) {
    calculateStats();
  }

  function calculateStats(): void {
    const totalSessions = practices.length;
    const totalMinutes = practices.reduce((sum, practice) => sum + practice.duration, 0);
    const totalHours = Math.round((totalMinutes / 60) * 10) / 10;
    const averageSession = totalSessions > 0 ? Math.round((totalMinutes / totalSessions)) : 0;
    
    // Calculate average rating
    const ratingsSum = practices.reduce((sum, practice) => sum + (practice.rating || 0), 0);
    const averageRating = totalSessions > 0 ? Math.round((ratingsSum / totalSessions) * 10) / 10 : 0;

    // Calculate focus areas
    const focusAreaCounts: Record<string, number> = {};
    practices.forEach(practice => {
      practice.focusAreas.forEach(area => {
        focusAreaCounts[area] = (focusAreaCounts[area] || 0) + 1;
      });
    });
    
    const topFocusAreas = Object.entries(focusAreaCounts)
      .map(([area, count]) => ({ area, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Calculate monthly trend (last 6 months)
    const monthlyData: Record<string, { sessions: number; minutes: number }> = {};
    const now = new Date();
    
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      monthlyData[key] = { sessions: 0, minutes: 0 };
    }

    practices.forEach(practice => {
      const practiceDate = new Date(practice.date);
      const key = practiceDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      if (monthlyData[key]) {
        monthlyData[key].sessions += 1;
        monthlyData[key].minutes += practice.duration;
      }
    });

    const monthlyTrend = Object.entries(monthlyData).map(([month, data]) => ({
      month,
      sessions: data.sessions,
      hours: Math.round((data.minutes / 60) * 10) / 10
    }));

    stats = {
      totalSessions,
      totalHours,
      averageSession,
      averageRating,
      topFocusAreas,
      monthlyTrend
    };
  }
</script>

<div class="practice-stats">
  <h3>Practice Statistics</h3>

  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-value">{stats.totalSessions}</div>
      <div class="stat-label">Total Sessions</div>
    </div>

    <div class="stat-card">
      <div class="stat-value">{stats.totalHours}h</div>
      <div class="stat-label">Total Practice</div>
    </div>

    <div class="stat-card">
      <div class="stat-value">{stats.averageSession}m</div>
      <div class="stat-label">Avg Session</div>
    </div>

    <div class="stat-card">
      <div class="stat-value">{stats.averageRating}/5</div>
      <div class="stat-label">Avg Rating</div>
    </div>
  </div>

  {#if stats.topFocusAreas.length > 0}
    <div class="section">
      <h4>Top Focus Areas</h4>
      <div class="focus-areas">
        {#each stats.topFocusAreas as item}
          <div class="focus-item">
            <span class="focus-name">{item.area}</span>
            <div class="focus-bar">
              <div 
                class="focus-fill" 
                style="width: {(item.count / stats.totalSessions) * 100}%"
              ></div>
            </div>
            <span class="focus-count">{item.count}</span>
          </div>
        {/each}
      </div>
    </div>
  {/if}

  {#if stats.monthlyTrend.length > 0}
    <div class="section">
      <h4>Monthly Trend</h4>
      <div class="trend-chart">
        {#each stats.monthlyTrend as month}
          <div class="trend-month">
            <div class="trend-bar">
              <div 
                class="trend-fill" 
                style="height: {month.sessions > 0 ? Math.min((month.sessions / Math.max(...stats.monthlyTrend.map(m => m.sessions))) * 100, 100) : 0}%"
                title="{month.sessions} sessions, {month.hours}h"
              ></div>
            </div>
            <div class="trend-label">{month.month}</div>
            <div class="trend-values">
              <div>{month.sessions} sessions</div>
              <div>{month.hours}h</div>
            </div>
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>

<style>
  .practice-stats {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .practice-stats h3 {
    margin: 0 0 1.5rem 0;
    font-size: 1.125rem;
    font-weight: 600;
    color: #111827;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .stat-card {
    text-align: center;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 6px;
  }

  .stat-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: #3b82f6;
    margin-bottom: 0.25rem;
  }

  .stat-label {
    font-size: 0.75rem;
    color: #6b7280;
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

  .focus-areas {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .focus-item {
    display: grid;
    grid-template-columns: 120px 1fr 40px;
    align-items: center;
    gap: 1rem;
  }

  .focus-name {
    font-size: 0.875rem;
    font-weight: 500;
    color: #374151;
  }

  .focus-bar {
    height: 8px;
    background: #e5e7eb;
    border-radius: 4px;
    overflow: hidden;
  }

  .focus-fill {
    height: 100%;
    background: #3b82f6;
    transition: width 0.3s ease;
  }

  .focus-count {
    font-size: 0.875rem;
    color: #6b7280;
    text-align: right;
  }

  .trend-chart {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
    gap: 0.5rem;
    align-items: end;
  }

  .trend-month {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }

  .trend-bar {
    height: 80px;
    width: 20px;
    background: #e5e7eb;
    border-radius: 2px;
    overflow: hidden;
    display: flex;
    align-items: end;
    cursor: pointer;
  }

  .trend-fill {
    width: 100%;
    background: #10b981;
    transition: height 0.3s ease;
    border-radius: 2px 2px 0 0;
  }

  .trend-label {
    font-size: 0.75rem;
    color: #6b7280;
    font-weight: 500;
  }

  .trend-values {
    font-size: 0.625rem;
    color: #9ca3af;
    text-align: center;
    line-height: 1.2;
  }

  @media (max-width: 768px) {
    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .focus-item {
      grid-template-columns: 80px 1fr 30px;
      gap: 0.5rem;
    }

    .focus-name {
      font-size: 0.75rem;
    }

    .trend-chart {
      gap: 0.25rem;
    }

    .trend-bar {
      height: 60px;
      width: 16px;
    }
  }
</style>