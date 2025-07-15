import React from 'react';
import { formatCurrency, formatDuration } from '../../utils';

interface DashboardMetricsProps {
  metrics: {
    totalShows: number;
    totalPracticeTime: number;
    averagePayment: number;
    goalsCompleted: number;
  };
}

const DashboardMetrics: React.FC<DashboardMetricsProps> = ({ metrics }) => {
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