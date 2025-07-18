import React, { useState, useEffect } from 'react';
import { MusicianProfile, RecordingSession } from '../../core/types';
import { formatDate, formatCurrency, formatDuration } from '../../utils';
import { storageService } from '../../services/storageService';
import { useSetPage } from '../../context/AppContext';

interface RecentActivitiesProps {
  profile: MusicianProfile;
}

const RecentActivities: React.FC<RecentActivitiesProps> = ({ profile }) => {
  const setPage = useSetPage();
  
  // Extract data from profile with null safety
  const performances = profile?.shows || [];
  const practices = profile?.practiceLog || [];
  const [recordings, setRecordings] = useState<RecordingSession[]>([]);
  const [recordingsLoading, setRecordingsLoading] = useState(false);
  
  // Get recent activities (last 5 of each type)
  const recentPerformances = performances
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);
  
  const recentPractices = practices
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const recentRecordings = recordings
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);
    
  const [activeTab, setActiveTab] = useState<'performances' | 'practice' | 'recordings'>('performances');

  // Load recordings when component mounts or profile changes
  useEffect(() => {
    loadRecordings();
  }, [profile.id]);

  const loadRecordings = async () => {
    try {
      setRecordingsLoading(true);
      const recordingSessions = await storageService.getRecordingSessions(profile.id);
      setRecordings(recordingSessions);
    } catch (error) {
      console.error('Error loading recordings:', error);
      setRecordings([]);
    } finally {
      setRecordingsLoading(false);
    }
  };

  const handleAddRecording = () => {
    setPage('activity-entry');
  };

  const renderPerformances = () => {
    if (recentPerformances.length === 0) {
      return (
        <div className="empty-state">
          <p>No recent performances</p>
          <small>Add your first show to track your progress!</small>
        </div>
      );
    }

    return (
      <div className="activities-list">
        {recentPerformances.map((performance) => (
          <div key={performance.id} className="activity-item">
            <div className="activity-icon">🎤</div>
            <div className="activity-content">
              <div className="activity-title">{performance.venueName || 'Unknown Venue'}</div>
              <div className="activity-details">
                <span>{formatDate(performance.date)}</span>
                <span>•</span>
                <span>{performance.audienceSize || 0} people</span>
                <span>•</span>
                <span>{formatCurrency(performance.payment || 0)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderPractice = () => {
    if (recentPractices.length === 0) {
      return (
        <div className="empty-state">
          <p>No recent practice sessions</p>
          <small>Log your practice to track improvement!</small>
        </div>
      );
    }

    return (
      <div className="activities-list">
        {recentPractices.map((practice) => (
          <div key={practice.id} className="activity-item">
            <div className="activity-icon">🎵</div>
            <div className="activity-content">
              <div className="activity-title">Practice Session</div>
              <div className="activity-details">
                <span>{formatDate(practice.date)}</span>
                <span>•</span>
                <span>{formatDuration(practice.duration || 0)}</span>
                {practice.focusAreas && practice.focusAreas.length > 0 && (
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

  const renderRecordings = () => {
    if (recordingsLoading) {
      return (
        <div className="loading-state">
          <div className="spinner-border spinner-border-sm me-2" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          Loading recordings...
        </div>
      );
    }

    if (recentRecordings.length === 0) {
      return (
        <div className="empty-state">
          <p>No recent recordings</p>
          <small>Start recording your music to track your creative progress!</small>
          <button
            onClick={handleAddRecording}
            className="btn btn-primary btn-sm mt-2"
          >
            <i className="fas fa-plus me-1"></i>
            Add Recording
          </button>
        </div>
      );
    }

    return (
      <div className="activities-list">
        {recentRecordings.map((recording) => (
          <div key={recording.id} className="activity-item">
            <div className="activity-icon">🎙️</div>
            <div className="activity-content">
              <div className="activity-title">{recording.location || 'Recording Session'}</div>
              <div className="activity-details">
                <span>{formatDate(recording.date)}</span>
                <span>•</span>
                <span>{recording.songs?.length || 0} song{(recording.songs?.length || 0) !== 1 ? 's' : ''}</span>
                {recording.totalRevenue && recording.totalRevenue > 0 && (
                  <>
                    <span>•</span>
                    <span>{formatCurrency(recording.totalRevenue)}</span>
                  </>
                )}
                {recording.totalPlays && recording.totalPlays > 0 && (
                  <>
                    <span>•</span>
                    <span>{recording.totalPlays.toLocaleString()} plays</span>
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
          <button 
            className={`tab-button ${activeTab === 'recordings' ? 'active' : ''}`}
            onClick={() => setActiveTab('recordings')}
          >
            Recordings
          </button>
        </div>
      </div>

      <div className="activities-content">
        {activeTab === 'performances' && renderPerformances()}
        {activeTab === 'practice' && renderPractice()}
        {activeTab === 'recordings' && renderRecordings()}
      </div>
    </div>
  );
};

export default RecentActivities;