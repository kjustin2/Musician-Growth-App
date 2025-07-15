import React, { useState, useEffect } from 'react';
import { MusicianProfile, PerformanceRecord, PracticeSession } from '../../core/types';
import { storageService } from '../../services/storageService';
import { analyticsService } from '../../services/analyticsService';
import { formatDate, formatCurrency, formatDuration, sortByDate } from '../../utils';

interface ActivityHistoryProps {
  profile: MusicianProfile;
}

const ActivityHistory: React.FC<ActivityHistoryProps> = ({ profile }) => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'performances' | 'practice' | 'analytics'>('performances');
  const [performances, setPerformances] = useState<PerformanceRecord[]>([]);
  const [practiceSessions, setPracticeSessions] = useState<PracticeSession[]>([]);
  const [analytics, setAnalytics] = useState<{
    performanceTrends: any;
    practiceAnalysis: any;
    totalStats: any;
  } | null>(null);

  useEffect(() => {
    loadActivityData();
  }, [profile.id]);

  const loadActivityData = async () => {
    try {
      setLoading(true);
      
      const [performanceData, practiceData] = await Promise.all([
        storageService.getPerformances(profile.id),
        storageService.getPracticeSessions(profile.id)
      ]);

      setPerformances(performanceData);
      setPracticeSessions(practiceData);

      // Calculate analytics
      const performanceTrends = analyticsService.analyzePerformanceTrends(performanceData);
      const practiceAnalysis = analyticsService.analyzePracticeHabits(practiceData);
      const totalStats = {
        totalShows: performanceData.length,
        totalPracticeTime: analyticsService.calculateTotalPracticeTime(practiceData),
        totalEarnings: performanceTrends.totalEarnings,
        averagePayment: analyticsService.calculateAverageShowPayment(performanceData),
        topVenues: analyticsService.getTopVenueTypes(performanceData),
        topSkills: analyticsService.getMostPracticedSkills(practiceData)
      };

      setAnalytics({
        performanceTrends,
        practiceAnalysis,
        totalStats
      });

    } catch (error) {
      console.error('Error loading activity data:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderPerformances = () => {
    if (performances.length === 0) {
      return (
        <div className="empty-state">
          <h3>No performances recorded</h3>
          <p>Start tracking your shows to see your performance history!</p>
        </div>
      );
    }

    const sortedPerformances = sortByDate(performances);

    return (
      <div className="activity-list">
        <div className="list-header">
          <h3>Performance History ({performances.length} shows)</h3>
        </div>
        <div className="activity-items">
          {sortedPerformances.map((performance) => (
            <div key={performance.id} className="activity-item performance-item">
              <div className="activity-icon">🎤</div>
              <div className="activity-content">
                <div className="activity-title">{performance.venueName}</div>
                <div className="activity-subtitle">
                  {performance.venueType.replace('_', ' ')} • {formatDate(performance.date)}
                </div>
                <div className="activity-stats">
                  <span className="stat">
                    👥 {performance.audienceSize} people
                  </span>
                  <span className="stat">
                    ⏱️ {formatDuration(performance.duration)}
                  </span>
                  <span className="stat">
                    💰 {formatCurrency(performance.payment)}
                  </span>
                </div>
                {performance.setlist && (
                  <div className="activity-setlist">
                    <strong>Setlist:</strong> {performance.setlist.join(', ')}
                  </div>
                )}
                {performance.notes && (
                  <div className="activity-notes">{performance.notes}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderPractice = () => {
    if (practiceSessions.length === 0) {
      return (
        <div className="empty-state">
          <h3>No practice sessions recorded</h3>
          <p>Start logging your practice to track your improvement!</p>
        </div>
      );
    }

    const sortedSessions = sortByDate(practiceSessions);

    return (
      <div className="activity-list">
        <div className="list-header">
          <h3>Practice History ({practiceSessions.length} sessions)</h3>
        </div>
        <div className="activity-items">
          {sortedSessions.map((session) => (
            <div key={session.id} className="activity-item practice-item">
              <div className="activity-icon">🎵</div>
              <div className="activity-content">
                <div className="activity-title">Practice Session</div>
                <div className="activity-subtitle">
                  {formatDate(session.date)} • {formatDuration(session.duration)}
                </div>
                <div className="activity-tags">
                  <div className="tag-group">
                    <strong>Focus Areas:</strong>
                    {session.focusAreas.map((area, index) => (
                      <span key={index} className="tag tag-focus">{area}</span>
                    ))}
                  </div>
                  {session.skillsWorkedOn.length > 0 && (
                    <div className="tag-group">
                      <strong>Skills:</strong>
                      {session.skillsWorkedOn.map((skill, index) => (
                        <span key={index} className="tag tag-skill">{skill}</span>
                      ))}
                    </div>
                  )}
                </div>
                {session.notes && (
                  <div className="activity-notes">{session.notes}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderAnalytics = () => {
    if (!analytics) return null;

    const { performanceTrends, practiceAnalysis, totalStats } = analytics;

    return (
      <div className="analytics-view">
        <div className="analytics-grid">
          <div className="analytics-card">
            <h3>Performance Overview</h3>
            <div className="analytics-stats">
              <div className="stat-item">
                <span className="stat-value">{totalStats.totalShows}</span>
                <span className="stat-label">Total Shows</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{formatCurrency(totalStats.totalEarnings)}</span>
                <span className="stat-label">Total Earnings</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{formatCurrency(totalStats.averagePayment)}</span>
                <span className="stat-label">Average Payment</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{Math.round(performanceTrends.averageAudienceSize)}</span>
                <span className="stat-label">Avg Audience</span>
              </div>
            </div>
            <div className="analytics-trends">
              <div className="trend-item">
                <span className="trend-label">Show Frequency:</span>
                <span className={`trend-value trend-${performanceTrends.showFrequency}`}>
                  {performanceTrends.showFrequency}
                </span>
              </div>
              <div className="trend-item">
                <span className="trend-label">Venue Progression:</span>
                <span className={`trend-value trend-${performanceTrends.venueProgression}`}>
                  {performanceTrends.venueProgression}
                </span>
              </div>
            </div>
          </div>

          <div className="analytics-card">
            <h3>Practice Overview</h3>
            <div className="analytics-stats">
              <div className="stat-item">
                <span className="stat-value">{totalStats.totalShows}</span>
                <span className="stat-label">Total Sessions</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{formatDuration(totalStats.totalPracticeTime)}</span>
                <span className="stat-label">Total Time</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{formatDuration(Math.round(practiceAnalysis.weeklyAverage))}</span>
                <span className="stat-label">Weekly Average</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{practiceAnalysis.consistency}</span>
                <span className="stat-label">Consistency</span>
              </div>
            </div>
            <div className="analytics-recommendation">
              <div className="recommendation-item">
                <span className="recommendation-label">Suggested Adjustment:</span>
                <span className={`recommendation-value rec-${practiceAnalysis.recommendedAdjustment}`}>
                  {practiceAnalysis.recommendedAdjustment} practice time
                </span>
              </div>
              {practiceAnalysis.suggestProfessionalLessons && (
                <div className="recommendation-item">
                  <span className="recommendation-label">💡 Consider professional lessons to improve consistency</span>
                </div>
              )}
            </div>
          </div>

          {totalStats.topVenues.length > 0 && (
            <div className="analytics-card">
              <h3>Top Venue Types</h3>
              <div className="top-list">
                {totalStats.topVenues.slice(0, 5).map((venue: any, index: number) => (
                  <div key={index} className="top-item">
                    <span className="top-name">{venue.type.replace('_', ' ')}</span>
                    <span className="top-count">{venue.count} shows</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {totalStats.topSkills.length > 0 && (
            <div className="analytics-card">
              <h3>Most Practiced Skills</h3>
              <div className="top-list">
                {totalStats.topSkills.slice(0, 5).map((skill: any, index: number) => (
                  <div key={index} className="top-item">
                    <span className="top-name">{skill.skill}</span>
                    <span className="top-count">{skill.count} sessions</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="activity-loading">
        <div className="spinner"></div>
        <p>Loading activity history...</p>
      </div>
    );
  }

  return (
    <div className="activity-history">
      <div className="history-header">
        <h2>Activity History</h2>
        <div className="history-tabs">
          <button 
            className={`tab-button ${activeTab === 'performances' ? 'active' : ''}`}
            onClick={() => setActiveTab('performances')}
          >
            Performances
          </button>
          <button 
            className={`tab-button ${activeTab === 'practice' ? 'active' : ''}`}
            onClick={() => setActiveTab('practice')}
          >
            Practice
          </button>
          <button 
            className={`tab-button ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            Analytics
          </button>
        </div>
      </div>

      <div className="history-content">
        {activeTab === 'performances' && renderPerformances()}
        {activeTab === 'practice' && renderPractice()}
        {activeTab === 'analytics' && renderAnalytics()}
      </div>
    </div>
  );
};

export default ActivityHistory;