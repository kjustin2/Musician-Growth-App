import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import PerformanceEntry from './PerformanceEntry';
import PracticeEntry from './PracticeEntry';
import ActivityHistory from './ActivityHistory';
import './ActivityTracking.css';

type ActivityType = 'performance' | 'practice' | 'history';

const ActivityTracking: React.FC = () => {
  const { state, dispatch } = useApp();
  const [activeTab, setActiveTab] = useState<ActivityType>('performance');

  const handleBack = () => {
    dispatch({ type: 'SET_PAGE', payload: 'dashboard' });
  };

  const renderContent = () => {
    if (!state.musicianProfile) {
      return (
        <div className="activity-error">
          <h3>No Profile Selected</h3>
          <p>Please select a profile to track activities.</p>
          <button 
            className="btn btn-primary"
            onClick={() => dispatch({ type: 'SET_PAGE', payload: 'profile-selection' })}
          >
            Select Profile
          </button>
        </div>
      );
    }

    switch (activeTab) {
      case 'performance':
        return <PerformanceEntry profile={state.musicianProfile} />;
      case 'practice':
        return <PracticeEntry profile={state.musicianProfile} />;
      case 'history':
        return <ActivityHistory profile={state.musicianProfile} />;
      default:
        return null;
    }
  };

  return (
    <div className="activity-tracking">
      <div className="activity-header">
        <button 
          className="btn btn-outline-secondary"
          onClick={handleBack}
        >
          ← Back to Dashboard
        </button>
        <h1>Activity Tracking</h1>
        <p>Log your performances and practice sessions</p>
      </div>

      <div className="activity-tabs">
        <button 
          className={`tab-button ${activeTab === 'performance' ? 'active' : ''}`}
          onClick={() => setActiveTab('performance')}
          type="button"
          role="button"
        >
          🎤 Add Performance
        </button>
        <button 
          className={`tab-button ${activeTab === 'practice' ? 'active' : ''}`}
          onClick={() => setActiveTab('practice')}
          type="button"
          role="button"
        >
          🎵 Log Practice
        </button>
        <button 
          className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
          type="button"
          role="button"
        >
          📊 View History
        </button>
      </div>

      <div className="activity-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default ActivityTracking;