import React, { useState, useEffect } from 'react';
import { MusicianProfile } from '../../core/types';
import { useApp } from '../../context/AppContext';
import { storageService } from '../../services/storageService';
import { formatDate } from '../../utils';
import './ProfileSelection.css';

const ProfileSelection: React.FC = () => {
  const { state, dispatch } = useApp();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      setLoading(true);
      await storageService.init();
      const profiles = await storageService.getAllProfiles();
      dispatch({ type: 'SET_AVAILABLE_PROFILES', payload: profiles });
    } catch (err) {
      console.error('Error loading profiles:', err);
      setError('Failed to load profiles');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProfile = async (profile: MusicianProfile) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Load complete profile data
      const fullProfile = await storageService.loadProfile(profile.id);
      if (fullProfile) {
        dispatch({ type: 'SET_PROFILE', payload: fullProfile });
        dispatch({ type: 'SET_PAGE', payload: 'dashboard' });
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      setError('Failed to load profile');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const handleCreateNewProfile = () => {
    dispatch({ type: 'SET_PAGE', payload: 'profile-creation' });
  };

  const handleDeleteProfile = async (profileId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (window.confirm('Are you sure you want to delete this profile? This action cannot be undone.')) {
      try {
        await storageService.deleteProfile(profileId);
        await loadProfiles(); // Refresh the list
      } catch (err) {
        console.error('Error deleting profile:', err);
        setError('Failed to delete profile');
      }
    }
  };

  if (loading) {
    return (
      <div className="profile-selection-loading">
        <div className="spinner"></div>
        <p>Loading your profiles...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-selection-error">
        <h2>Error</h2>
        <p>{error}</p>
        <button className="btn btn-primary" onClick={loadProfiles}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="profile-selection">
      <div className="profile-selection-header">
        <h1>Choose Your Profile</h1>
        <p>Select an existing profile or create a new one to get started</p>
      </div>

      <div className="profile-selection-content">
        {state.availableProfiles.length === 0 ? (
          <div className="no-profiles">
            <div className="no-profiles-icon">🎵</div>
            <h3>No profiles found</h3>
            <p>Create your first musician profile to start tracking your musical journey!</p>
            <button className="btn btn-primary btn-lg" onClick={handleCreateNewProfile}>
              Create New Profile
            </button>
          </div>
        ) : (
          <>
            <div className="profiles-grid">
              {state.availableProfiles.map((profile) => (
                <div 
                  key={profile.id}
                  className="profile-card"
                  onClick={() => handleSelectProfile(profile)}
                >
                  <div className="profile-card-header">
                    <div className="profile-avatar">
                      {profile.name ? profile.name.charAt(0).toUpperCase() : '🎵'}
                    </div>
                    <button 
                      className="profile-delete-btn"
                      onClick={(e) => handleDeleteProfile(profile.id, e)}
                      aria-label="Delete profile"
                    >
                      ×
                    </button>
                  </div>
                  
                  <div className="profile-card-content">
                    <h3>{profile.name || 'Unnamed Profile'}</h3>
                    <div className="profile-details">
                      <span className="profile-instrument">{profile.instrument}</span>
                      <span className="profile-experience">{profile.yearsOfExperience} years</span>
                    </div>
                    <div className="profile-stats">
                      <div className="stat">
                        <span className="stat-number">{profile.shows?.length || 0}</span>
                        <span className="stat-label">Shows</span>
                      </div>
                      <div className="stat">
                        <span className="stat-number">{profile.goals?.length || 0}</span>
                        <span className="stat-label">Goals</span>
                      </div>
                      <div className="stat">
                        <span className="stat-number">{profile.practiceLog?.length || 0}</span>
                        <span className="stat-label">Sessions</span>
                      </div>
                    </div>
                    <div className="profile-last-updated">
                      Last updated: {formatDate(profile.lastUpdated)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="profile-selection-actions">
              <button className="btn btn-outline-primary" onClick={handleCreateNewProfile}>
                Create New Profile
              </button>
            </div>
          </>
        )}
      </div>

      <div className="profile-selection-footer">
        <p>
          <small>
            All data is stored locally on your device. No account required.
          </small>
        </p>
      </div>
    </div>
  );
};

export default ProfileSelection;