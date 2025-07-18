import React from 'react';

interface GoalMetric {
  id: string;
  name: string;
  description: string;
  currentValue: number;
  unit: string;
  autoUpdate: boolean;
}

interface MetricSummary {
  totalShows: number;
  totalPracticeTime: number;
  totalEarnings: number;
  totalRecordings: number;
}

interface GoalMetricSelectorProps {
  goalType: 'performance' | 'skill' | 'financial' | 'recording' | 'custom';
  onMetricSelect: (metric: GoalMetric) => void;
  currentMetrics: MetricSummary;
  selectedMetric?: string;
}

const GoalMetricSelector: React.FC<GoalMetricSelectorProps> = ({
  goalType,
  onMetricSelect,
  currentMetrics,
  selectedMetric
}) => {
  const getAvailableMetrics = (): GoalMetric[] => {
    switch (goalType) {
      case 'performance':
        return [
          {
            id: 'show_count',
            name: 'Number of Shows',
            description: 'Track total performances logged',
            currentValue: currentMetrics.totalShows,
            unit: 'shows',
            autoUpdate: true
          },
          {
            id: 'audience_size',
            name: 'Total Audience Reached',
            description: 'Sum of audience sizes across all shows',
            currentValue: 0, // Would be calculated from performance data
            unit: 'people',
            autoUpdate: true
          }
        ];
      case 'skill':
        return [
          {
            id: 'practice_time',
            name: 'Practice Time',
            description: 'Total time spent practicing',
            currentValue: currentMetrics.totalPracticeTime,
            unit: 'hours',
            autoUpdate: true
          },
          {
            id: 'practice_sessions',
            name: 'Practice Sessions',
            description: 'Number of practice sessions completed',
            currentValue: 0, // Would be calculated from practice data
            unit: 'sessions',
            autoUpdate: true
          }
        ];
      case 'financial':
        return [
          {
            id: 'total_earnings',
            name: 'Total Earnings',
            description: 'Sum of all performance and recording revenue',
            currentValue: currentMetrics.totalEarnings,
            unit: 'dollars',
            autoUpdate: true
          },
          {
            id: 'performance_earnings',
            name: 'Performance Earnings',
            description: 'Revenue from live performances only',
            currentValue: 0, // Would be calculated from performance data
            unit: 'dollars',
            autoUpdate: true
          }
        ];
      case 'recording':
        return [
          {
            id: 'recording_count',
            name: 'Number of Recordings',
            description: 'Total recording sessions completed',
            currentValue: currentMetrics.totalRecordings,
            unit: 'recordings',
            autoUpdate: true
          },
          {
            id: 'songs_recorded',
            name: 'Songs Recorded',
            description: 'Total number of individual songs recorded',
            currentValue: 0, // Would be calculated from recording data
            unit: 'songs',
            autoUpdate: true
          }
        ];
      case 'custom':
        return [
          {
            id: 'manual_tracking',
            name: 'Manual Tracking',
            description: 'Track progress manually - no automatic updates',
            currentValue: 0,
            unit: 'units',
            autoUpdate: false
          }
        ];
      default:
        return [];
    }
  };

  const availableMetrics = getAvailableMetrics();

  const handleMetricSelect = (metric: GoalMetric) => {
    onMetricSelect(metric);
  };

  if (goalType === 'custom') {
    return (
      <div className="goal-metric-selector">
        <div className="metric-info">
          <h6>Goal Tracking</h6>
          <p className="text-muted">
            Custom goals require manual progress updates. You'll need to update your progress manually as you work toward your goal.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="goal-metric-selector">
      <div className="metric-info mb-3">
        <h6>How will this goal be tracked?</h6>
        <p className="text-muted">
          Choose how you want to measure progress toward this goal. Linked metrics update automatically when you log activities.
        </p>
      </div>

      <div className="metrics-list">
        {availableMetrics.map((metric) => (
          <div
            key={metric.id}
            className={`metric-option ${selectedMetric === metric.id ? 'selected' : ''}`}
            onClick={() => handleMetricSelect(metric)}
          >
            <div className="metric-header">
              <div className="metric-name">
                <strong>{metric.name}</strong>
                {metric.autoUpdate && (
                  <span className="auto-update-badge">
                    <i className="fas fa-link me-1"></i>
                    Auto-updates
                  </span>
                )}
              </div>
              <div className="metric-current">
                Current: {metric.currentValue} {metric.unit}
              </div>
            </div>
            <div className="metric-description">
              {metric.description}
            </div>
          </div>
        ))}
      </div>

      {selectedMetric && (
        <div className="metric-explanation mt-3">
          <div className="alert alert-info">
            <i className="fas fa-info-circle me-2"></i>
            <strong>How automatic updates work:</strong> When you log activities that relate to this metric, 
            your goal progress will be updated automatically. You can always manually adjust the progress if needed.
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalMetricSelector;