import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import BulkPerformanceEntry from './BulkPerformanceEntry';
import BulkPracticeEntry from './BulkPracticeEntry';
import './BulkEntry.css';

type BulkEntryType = 'performance' | 'practice';

const BulkEntry: React.FC = () => {
  const { state, dispatch } = useApp();
  const [activeTab, setActiveTab] = useState<BulkEntryType>('performance');

  const handleBack = () => {
    dispatch({ type: 'SET_PAGE', payload: 'dashboard' });
  };

  const renderContent = () => {
    if (!state.musicianProfile) {
      return (
        <div className="bulk-error">
          <h3>No Profile Selected</h3>
          <p>Please select a profile to bulk enter activities.</p>
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
        return <BulkPerformanceEntry profile={state.musicianProfile} />;
      case 'practice':
        return <BulkPracticeEntry profile={state.musicianProfile} />;
      default:
        return null;
    }
  };

  return (
    <div className="bulk-entry">
      <div className="bulk-header">
        <button 
          className="btn btn-outline-secondary"
          onClick={handleBack}
        >
          ← Back to Dashboard
        </button>
        <h1>Bulk Entry</h1>
        <p>Quickly add multiple activities to catch up on your tracking</p>
      </div>

      <div className="bulk-tabs">
        <button 
          className={`tab-button ${activeTab === 'performance' ? 'active' : ''}`}
          onClick={() => setActiveTab('performance')}
        >
          🎤 Bulk Add Performances
        </button>
        <button 
          className={`tab-button ${activeTab === 'practice' ? 'active' : ''}`}
          onClick={() => setActiveTab('practice')}
        >
          🎵 Bulk Add Practice Sessions
        </button>
      </div>

      <div className="bulk-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default BulkEntry;