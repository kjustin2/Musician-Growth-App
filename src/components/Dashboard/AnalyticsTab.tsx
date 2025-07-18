import React, { useState, useEffect } from 'react';
import { MusicianProfile, PerformanceTrends, PracticeAnalysis, RecordingAnalysis } from '../../core/types';
import { analyticsService } from '../../services/analyticsService';

interface AnalyticsTabProps {
  profile: MusicianProfile;
}

const AnalyticsTab: React.FC<AnalyticsTabProps> = ({ profile }) => {
  const [performanceTrends, setPerformanceTrends] = useState<PerformanceTrends | null>(null);
  const [practiceAnalysis, setPracticeAnalysis] = useState<PracticeAnalysis | null>(null);
  const [recordingAnalysis, setRecordingAnalysis] = useState<RecordingAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [profile.id]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      // Load performance trends
      const perfTrends = await analyticsService.getPerformanceTrends(profile.id);
      setPerformanceTrends(perfTrends);

      // Load practice analysis
      const practiceData = await analyticsService.getPracticeAnalysis(profile.id);
      setPracticeAnalysis(practiceData);

      // Load recording analysis
      const recordingData = await analyticsService.getRecordingAnalysis(profile.id);
      setRecordingAnalysis(recordingData);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="analytics-tab">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading analytics...</span>
          </div>
          <p className="mt-2 text-muted">Analyzing your music data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-tab">
      {/* Quick Stats */}
      <div className="quick-stats-section mb-4">
        <h5 className="mb-3">Quick Stats</h5>
        <div className="row">
          <div className="col-md-3 col-6">
            <div className="quick-stat-card text-center p-3 bg-light rounded">
              <div className="stat-value h3 mb-1 text-primary">
                {profile.shows?.length || 0}
              </div>
              <div className="stat-label small text-muted">Total Shows</div>
            </div>
          </div>
          <div className="col-md-3 col-6">
            <div className="quick-stat-card text-center p-3 bg-light rounded">
              <div className="stat-value h3 mb-1 text-info">
                {profile.practiceLog?.length || 0}
              </div>
              <div className="stat-label small text-muted">Practice Sessions</div>
            </div>
          </div>
          <div className="col-md-3 col-6">
            <div className="quick-stat-card text-center p-3 bg-light rounded">
              <div className="stat-value h3 mb-1 text-warning">
                {profile.recordings?.length || 0}
              </div>
              <div className="stat-label small text-muted">Recordings</div>
            </div>
          </div>
          <div className="col-md-3 col-6">
            <div className="quick-stat-card text-center p-3 bg-light rounded">
              <div className="stat-value h3 mb-1 text-success">
                {profile.goals?.filter(g => g.status === 'active').length || 0}
              </div>
              <div className="stat-label small text-muted">Active Goals</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Summary */}
      <div className="recent-summary-section mb-4">
        <h5 className="mb-3">This Week</h5>
        <div className="row">
          <div className="col-md-4">
            <div className="summary-card p-3 border rounded">
              <div className="d-flex align-items-center">
                <div className="summary-icon me-3">
                  <i className="fas fa-music text-primary"></i>
                </div>
                <div>
                  <div className="summary-title">Shows</div>
                  <div className="summary-value">
                    {profile.shows?.filter(show => {
                      const showDate = new Date(show.date);
                      const weekAgo = new Date();
                      weekAgo.setDate(weekAgo.getDate() - 7);
                      return showDate > weekAgo;
                    }).length || 0}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="summary-card p-3 border rounded">
              <div className="d-flex align-items-center">
                <div className="summary-icon me-3">
                  <i className="fas fa-drum text-info"></i>
                </div>
                <div>
                  <div className="summary-title">Practice Hours</div>
                  <div className="summary-value">
                    {Math.round((profile.practiceLog?.filter(session => {
                      const sessionDate = new Date(session.date);
                      const weekAgo = new Date();
                      weekAgo.setDate(weekAgo.getDate() - 7);
                      return sessionDate > weekAgo;
                    }).reduce((total, session) => total + session.duration, 0) || 0) / 60)}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="summary-card p-3 border rounded">
              <div className="d-flex align-items-center">
                <div className="summary-icon me-3">
                  <i className="fas fa-target text-success"></i>
                </div>
                <div>
                  <div className="summary-title">Goals Completed</div>
                  <div className="summary-value">
                    {profile.goals?.filter(goal => {
                      const completedDate = new Date(goal.createdAt);
                      const weekAgo = new Date();
                      weekAgo.setDate(weekAgo.getDate() - 7);
                      return goal.status === 'completed' && completedDate > weekAgo;
                    }).length || 0}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Performance Analytics */}
        <div className="col-lg-6 mb-4">
          <div className="card analytics-card">
            <div className="card-header">
              <h5 className="card-title mb-0">
                <i className="fas fa-music me-2"></i>Performance Trends
              </h5>
            </div>
            <div className="card-body">
              {performanceTrends ? (
                <div className="analytics-content">
                  <div className="row">
                    <div className="col-6">
                      <div className="stat-item">
                        <div className="stat-value">{performanceTrends.averageAudienceSize}</div>
                        <div className="stat-label">Avg Audience Size</div>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="stat-item">
                        <div className="stat-value">${performanceTrends.totalEarnings}</div>
                        <div className="stat-label">Total Earnings</div>
                      </div>
                    </div>
                  </div>
                  <div className="row mt-3">
                    <div className="col-6">
                      <div className="trend-indicator">
                        <span className={`trend-icon ${performanceTrends.showFrequency === 'increasing' ? 'text-success' : 
                          performanceTrends.showFrequency === 'decreasing' ? 'text-danger' : 'text-warning'}`}>
                          <i className={`fas fa-${performanceTrends.showFrequency === 'increasing' ? 'arrow-up' : 
                            performanceTrends.showFrequency === 'decreasing' ? 'arrow-down' : 'minus'}`}></i>
                        </span>
                        <span className="trend-label">Show Frequency</span>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="trend-indicator">
                        <span className={`trend-icon ${performanceTrends.venueProgression === 'improving' ? 'text-success' : 
                          performanceTrends.venueProgression === 'declining' ? 'text-danger' : 'text-warning'}`}>
                          <i className={`fas fa-${performanceTrends.venueProgression === 'improving' ? 'arrow-up' : 
                            performanceTrends.venueProgression === 'declining' ? 'arrow-down' : 'minus'}`}></i>
                        </span>
                        <span className="trend-label">Venue Quality</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-3 text-muted">
                  <i className="fas fa-chart-line fa-2x mb-2"></i>
                  <p>No performance data available</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Practice Analytics */}
        <div className="col-lg-6 mb-4">
          <div className="card analytics-card">
            <div className="card-header">
              <h5 className="card-title mb-0">
                <i className="fas fa-drum me-2"></i>Practice Analysis
              </h5>
            </div>
            <div className="card-body">
              {practiceAnalysis ? (
                <div className="analytics-content">
                  <div className="row">
                    <div className="col-12">
                      <div className="stat-item text-center">
                        <div className="stat-value">{practiceAnalysis.weeklyAverage}h</div>
                        <div className="stat-label">Weekly Average</div>
                      </div>
                    </div>
                  </div>
                  <div className="row mt-3">
                    <div className="col-6">
                      <div className="consistency-indicator">
                        <span className={`consistency-badge badge ${
                          practiceAnalysis.consistency === 'excellent' ? 'bg-success' :
                          practiceAnalysis.consistency === 'good' ? 'bg-warning' : 'bg-danger'
                        }`}>
                          {practiceAnalysis.consistency}
                        </span>
                        <div className="consistency-label">Consistency</div>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="recommendation-indicator">
                        <span className={`recommendation-badge badge ${
                          practiceAnalysis.recommendedAdjustment === 'increase' ? 'bg-primary' :
                          practiceAnalysis.recommendedAdjustment === 'decrease' ? 'bg-secondary' : 'bg-success'
                        }`}>
                          {practiceAnalysis.recommendedAdjustment}
                        </span>
                        <div className="recommendation-label">Recommended</div>
                      </div>
                    </div>
                  </div>
                  {practiceAnalysis.suggestProfessionalLessons && (
                    <div className="mt-3">
                      <div className="alert alert-info py-2">
                        <i className="fas fa-lightbulb me-2"></i>
                        Consider professional lessons to accelerate your progress
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-3 text-muted">
                  <i className="fas fa-drum fa-2x mb-2"></i>
                  <p>No practice data available</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recording Analytics */}
        <div className="col-lg-12 mb-4">
          <div className="card analytics-card">
            <div className="card-header">
              <h5 className="card-title mb-0">
                <i className="fas fa-microphone me-2"></i>Recording Analysis
              </h5>
            </div>
            <div className="card-body">
              {recordingAnalysis ? (
                <div className="analytics-content">
                  <div className="row">
                    <div className="col-md-3">
                      <div className="stat-item">
                        <div className="stat-value">{recordingAnalysis.totalSongs}</div>
                        <div className="stat-label">Total Songs</div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="stat-item">
                        <div className="stat-value">{recordingAnalysis.totalPlays.toLocaleString()}</div>
                        <div className="stat-label">Total Plays</div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="stat-item">
                        <div className="stat-value">${recordingAnalysis.totalRevenue}</div>
                        <div className="stat-label">Total Revenue</div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="stat-item">
                        <div className="stat-value">${recordingAnalysis.averageRevenuePerSong}</div>
                        <div className="stat-label">Avg per Song</div>
                      </div>
                    </div>
                  </div>
                  <div className="row mt-3">
                    <div className="col-md-6">
                      <div className="trend-indicator">
                        <span className={`trend-icon ${recordingAnalysis.recordingFrequency === 'increasing' ? 'text-success' : 
                          recordingAnalysis.recordingFrequency === 'decreasing' ? 'text-danger' : 'text-warning'}`}>
                          <i className={`fas fa-${recordingAnalysis.recordingFrequency === 'increasing' ? 'arrow-up' : 
                            recordingAnalysis.recordingFrequency === 'decreasing' ? 'arrow-down' : 'minus'}`}></i>
                        </span>
                        <span className="trend-label">Recording Frequency</span>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="efficiency-indicator">
                        <span className={`efficiency-badge badge ${
                          recordingAnalysis.costEfficiency === 'excellent' ? 'bg-success' :
                          recordingAnalysis.costEfficiency === 'good' ? 'bg-warning' : 'bg-danger'
                        }`}>
                          {recordingAnalysis.costEfficiency}
                        </span>
                        <div className="efficiency-label">Cost Efficiency</div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-3 text-muted">
                  <i className="fas fa-microphone fa-2x mb-2"></i>
                  <p>No recording data available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsTab;