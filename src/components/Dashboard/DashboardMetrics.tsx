import React from 'react';
import { formatCurrency, formatDuration } from '../../utils';

import { MusicianProfile } from '../../core/types';
import { loggingService } from '../../services/loggingService';

interface DashboardMetricsProps {
  profile: MusicianProfile;
}

const DashboardMetrics: React.FC<DashboardMetricsProps> = ({ profile }) => {
  // Calculate metrics from profile data with null safety
  const calculateMetrics = () => {
    try {
      const shows = profile?.shows || [];
      const practiceLog = profile?.practiceLog || [];
      const goals = profile?.goals || [];
      
      const totalShows = shows.length;
      const totalPracticeTime = practiceLog.reduce((sum, session) => sum + (session.duration || 0), 0);
      const totalPayment = shows.reduce((sum, show) => sum + (show.payment || 0), 0);
      const averagePayment = totalShows > 0 ? totalPayment / totalShows : 0;
      const goalsCompleted = goals.filter(goal => goal.status === 'completed').length;

      return {
        totalShows,
        totalPracticeTime,
        averagePayment,
        goalsCompleted
      };
    } catch (error) {
      loggingService.error('Error calculating dashboard metrics', error as Error, { profileId: profile?.id });
      return {
        totalShows: 0,
        totalPracticeTime: 0,
        averagePayment: 0,
        goalsCompleted: 0
      };
    }
  };

  const metrics = calculateMetrics();
  const metricCards = [
    {
      title: 'Total Shows',
      value: metrics.totalShows.toString(),
      icon: '🎤',
      color: 'primary'
    },
    {
      title: 'Practice Time',
      value: formatDuration(metrics.totalPracticeTime),
      icon: '⏰',
      color: 'success'
    },
    {
      title: 'Avg Payment',
      value: metrics.averagePayment > 0 ? formatCurrency(metrics.averagePayment) : '$0',
      icon: '💰',
      color: 'warning'
    },
    {
      title: 'Goals Completed',
      value: metrics.goalsCompleted.toString(),
      icon: '🎯',
      color: 'info'
    }
  ];

  return (
    <div className="dashboard-metrics">
      <h3>Your Stats</h3>
      <div className="metrics-grid">
        {metricCards.map((metric, index) => (
          <div key={index} className={`metric-card metric-${metric.color}`}>
            <div className="metric-icon">{metric.icon}</div>
            <div className="metric-content">
              <div className="metric-value">{metric.value}</div>
              <div className="metric-title">{metric.title}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardMetrics;