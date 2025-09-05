<script lang="ts">
  import type { Gig } from '../../../../backend/database/types.js';

  export let gigs: Gig[];

  let stats = {
    totalGigs: 0,
    totalEarnings: 0,
    averageEarnings: 0,
    upcomingGigs: 0,
    completedGigs: 0,
    monthlyEarnings: [] as Array<{ month: string; earnings: number; gigs: number }>,
    topVenues: [] as Array<{ venue: string; gigs: number; earnings: number }>
  };

  $: if (gigs.length > 0) {
    calculateStats();
  }

  function calculateStats(): void {
    const totalGigs = gigs.length;
    const completedGigs = gigs.filter(gig => gig.status === 'completed').length;
    const upcomingGigs = gigs.filter(gig => gig.status === 'scheduled' && new Date(gig.date) > new Date()).length;
    
    // Calculate earnings only from completed gigs
    const completedGigsWithEarnings = gigs.filter(gig => gig.status === 'completed' && gig.earnings);
    const totalEarnings = completedGigsWithEarnings.reduce((sum, gig) => sum + (gig.earnings || 0), 0);
    const averageEarnings = completedGigsWithEarnings.length > 0 ? Math.round((totalEarnings / completedGigsWithEarnings.length) * 100) / 100 : 0;

    // Calculate monthly earnings trend (last 6 months)
    const monthlyData: Record<string, { earnings: number; gigs: number }> = {};
    const now = new Date();
    
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      monthlyData[key] = { earnings: 0, gigs: 0 };
    }

    gigs
      .filter(gig => gig.status === 'completed')
      .forEach(gig => {
        const gigDate = new Date(gig.date);
        const key = gigDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        
        if (monthlyData[key]) {
          monthlyData[key].gigs += 1;
          monthlyData[key].earnings += gig.earnings || 0;
        }
      });

    const monthlyEarnings = Object.entries(monthlyData).map(([month, data]) => ({
      month,
      earnings: Math.round(data.earnings * 100) / 100,
      gigs: data.gigs
    }));

    // Calculate top venues
    const venueData: Record<string, { gigs: number; earnings: number }> = {};
    
    gigs
      .filter(gig => gig.status === 'completed')
      .forEach(gig => {
        const venue = gig.venueName || 'Unknown Venue';
        if (!venueData[venue]) {
          venueData[venue] = { gigs: 0, earnings: 0 };
        }
        venueData[venue].gigs += 1;
        venueData[venue].earnings += gig.earnings || 0;
      });

    const topVenues = Object.entries(venueData)
      .map(([venue, data]) => ({
        venue,
        gigs: data.gigs,
        earnings: Math.round(data.earnings * 100) / 100
      }))
      .sort((a, b) => b.earnings - a.earnings)
      .slice(0, 5);

    stats = {
      totalGigs,
      totalEarnings: Math.round(totalEarnings * 100) / 100,
      averageEarnings,
      upcomingGigs,
      completedGigs,
      monthlyEarnings,
      topVenues
    };
  }

  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }
</script>

<div class="gig-stats">
  <h3>Gig Statistics</h3>

  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-value">{stats.totalGigs}</div>
      <div class="stat-label">Total Gigs</div>
    </div>

    <div class="stat-card">
      <div class="stat-value">{formatCurrency(stats.totalEarnings)}</div>
      <div class="stat-label">Total Earnings</div>
    </div>

    <div class="stat-card">
      <div class="stat-value">{formatCurrency(stats.averageEarnings)}</div>
      <div class="stat-label">Avg Per Gig</div>
    </div>

    <div class="stat-card">
      <div class="stat-value">{stats.upcomingGigs}</div>
      <div class="stat-label">Upcoming</div>
    </div>
  </div>

  {#if stats.monthlyEarnings.length > 0}
    <div class="section">
      <h4>Monthly Earnings</h4>
      <div class="earnings-chart">
        {#each stats.monthlyEarnings as month}
          <div class="earnings-month">
            <div class="earnings-bar">
              <div 
                class="earnings-fill" 
                style="height: {month.earnings > 0 ? Math.min((month.earnings / Math.max(...stats.monthlyEarnings.map(m => m.earnings))) * 100, 100) : 0}%"
                title="{formatCurrency(month.earnings)} from {month.gigs} gigs"
              ></div>
            </div>
            <div class="earnings-label">{month.month}</div>
            <div class="earnings-values">
              <div>{formatCurrency(month.earnings)}</div>
              <div>{month.gigs} gigs</div>
            </div>
          </div>
        {/each}
      </div>
    </div>
  {/if}

  {#if stats.topVenues.length > 0}
    <div class="section">
      <h4>Top Venues by Earnings</h4>
      <div class="venues-list">
        {#each stats.topVenues as venue}
          <div class="venue-item">
            <div class="venue-info">
              <span class="venue-name">{venue.venue}</span>
              <span class="venue-gigs">{venue.gigs} {venue.gigs === 1 ? 'gig' : 'gigs'}</span>
            </div>
            <div class="venue-earnings">{formatCurrency(venue.earnings)}</div>
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>

<style>
  .gig-stats {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .gig-stats h3 {
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
    font-size: 1.25rem;
    font-weight: 700;
    color: #10b981;
    margin-bottom: 0.25rem;
    word-break: break-all;
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

  .earnings-chart {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
    gap: 0.5rem;
    align-items: end;
  }

  .earnings-month {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }

  .earnings-bar {
    height: 80px;
    width: 24px;
    background: #e5e7eb;
    border-radius: 2px;
    overflow: hidden;
    display: flex;
    align-items: end;
    cursor: pointer;
  }

  .earnings-fill {
    width: 100%;
    background: #10b981;
    transition: height 0.3s ease;
    border-radius: 2px 2px 0 0;
  }

  .earnings-label {
    font-size: 0.75rem;
    color: #6b7280;
    font-weight: 500;
  }

  .earnings-values {
    font-size: 0.625rem;
    color: #9ca3af;
    text-align: center;
    line-height: 1.2;
  }

  .venues-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .venue-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem;
    background: #f8f9fa;
    border-radius: 6px;
  }

  .venue-info {
    flex-grow: 1;
  }

  .venue-name {
    font-size: 0.875rem;
    font-weight: 500;
    color: #374151;
    display: block;
  }

  .venue-gigs {
    font-size: 0.75rem;
    color: #6b7280;
  }

  .venue-earnings {
    font-size: 0.875rem;
    font-weight: 600;
    color: #10b981;
  }

  @media (max-width: 768px) {
    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .stat-value {
      font-size: 1rem;
    }

    .earnings-chart {
      gap: 0.25rem;
    }

    .earnings-bar {
      height: 60px;
      width: 20px;
    }

    .venue-item {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.5rem;
    }

    .venue-earnings {
      align-self: flex-end;
    }
  }
</style>