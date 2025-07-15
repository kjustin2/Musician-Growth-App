import React, { useState } from 'react';
import { PerformanceRecord, PracticeSession } from '../../core/types';
import { formatDate, formatCurrency, formatDuration } from '../../utils';

interface RecentActivitiesProps {
  performances: PerformanceRecord[];
  practices: PracticeSession[];
}

const RecentActivities: React.FC<RecentActivitiesProps> = ({ performances, practices }) => {
  const [activeTab, setActiveTab] = useState<'performances' | 'practice'>('performances');

  const renderPerformances = () => {
    if (performances.length === 0) {
      return (
        <div className="empty-state">
          <p>No recent performances</p>
          <small>Add your first show to track your progress!</small>
        </div>
      );
    }

    return (
      <div className="activities-list">
        {performances.map((performance) => (
          <div key={performance.id} className="activity-item">
            <div className="activity-icon">🎤</div>
            <div className="activity-content">
              <div className="activity-title">{performance.venueName}</div>
              <div className="activity-details">
                <span>{formatDate(performance.date)}</span>
                <span>•</span>
                <span>{performance.audienceSize} people</span>
                <span>•</span>
                <span>{formatCurrency(performance.payment)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderPractice = () => {
    if (practices.length === 0) {
      return (
        <div className="empty-state">
          <p>No recent practice sessions</p>
          <small>Log your practice to track improvement!</small>
        </div>
      );
    }

    return (
      <div className="activities-list">
        {practices.map((practice) => (
          <div key={practice.id} className="activity-item">
            <div className="activity-icon">🎵</div>
            <div className="activity-content">
              <div className="activity-title">Practice Session</div>
              <div className="activity-details">
                <span>{formatDate(practice.date)}</span>
                <span>•</span>
                <span>{formatDuration(practice.duration)}</span>
                {practice.focusAreas.length > 0 && (
                  <>
                    <span>•</span>
                    <span>{practice.focusAreas.join(', ')}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="recent-activities">
      <div className="activities-header">
        <h3>Recent Activities</h3>
        <div className="activities-tabs">
          <button 
            className={`tab-button ${activeTab === 'performances' ? 'active' : ''}`}
            onClick={() => setActiveTab('performances')}
          >
            Shows
          </button>
          <button 
            className={`tab-button ${activeTab === 'practice' ? 'active' : ''}`}
            onClick={() => setActiveTab('practice')}
          >
            Practice
          </button>
        </div>
      </div>

      <div className="activities-content">
        {activeTab === 'performances' ? renderPerformances() : renderPractice()}
      </div>
    </div>
  );
};

export default RecentActivities;