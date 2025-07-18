import React, { useState, useCallback } from 'react';
import { MusicianProfile, SurveyResponse } from '@/core/types';
import { useApp, useSetPage } from '@/context/AppContext';
import { INSTRUMENTS, MARKETING_OPTIONS } from '@/core/constants';
import { storageService } from '@/services/storageService';
import './SettingsPage.css';

interface SettingsPageProps {
  profile: MusicianProfile;
  onSave: (updatedResponses: SurveyResponse) => void;
  onCancel: () => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ profile, onSave, onCancel }) => {
  const { dispatch } = useApp();
  const setPage = useSetPage();
  
  // Initialize form state with current profile data
  const [formData, setFormData] = useState({
    instrument: profile.instrument,
    performanceFrequency: profile.performanceFrequency,
    crowdSize: profile.crowdSize,
    yearsOfExperience: profile.yearsOfExperience,
    marketingEfforts: profile.marketingEfforts || []
  });
  
  const [customInstrument, setCustomInstrument] = useState({
    isOther: !INSTRUMENTS.includes(profile.instrument as any),
    value: !INSTRUMENTS.includes(profile.instrument as any) ? profile.instrument : ''
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const handleInstrumentChange = useCallback((instrument: string) => {
    if (instrument === 'Other') {
      setCustomInstrument({ isOther: true, value: '' });
      setFormData(prev => ({ ...prev, instrument: '' }));
    } else {
      setCustomInstrument({ isOther: false, value: '' });
      setFormData(prev => ({ ...prev, instrument }));
    }
  }, []);

  const handleCustomInstrumentChange = useCallback((value: string) => {
    setCustomInstrument(prev => ({ ...prev, value }));
    setFormData(prev => ({ ...prev, instrument: value }));
  }, []);

  const handleMarketingToggle = useCallback((optionId: string) => {
    setFormData(prev => ({
      ...prev,
      marketingEfforts: prev.marketingEfforts.includes(optionId)
        ? prev.marketingEfforts.filter(id => id !== optionId)
        : [...prev.marketingEfforts, optionId]
    }));
  }, []);

  const handleSave = useCallback(async () => {
    if (isSaving) return;
    
    try {
      setIsSaving(true);
      setSaveMessage(null);
      
      // Validate required fields
      const instrument = customInstrument.isOther ? customInstrument.value : formData.instrument;
      if (!instrument?.trim() || !formData.performanceFrequency || !formData.crowdSize || 
          typeof formData.yearsOfExperience !== 'number' || !formData.marketingEfforts.length) {
        setSaveMessage('Please fill in all required fields.');
        return;
      }

      // Create updated survey response
      const updatedResponse: SurveyResponse = {
        id: `survey_${Date.now()}`,
        profileId: profile.id,
        responses: {
          instrument: instrument.trim(),
          performanceFrequency: formData.performanceFrequency,
          crowdSize: formData.crowdSize,
          yearsOfExperience: formData.yearsOfExperience,
          marketingEfforts: formData.marketingEfforts
        },
        updatedAt: new Date()
      };

      // Update profile with new survey data
      const updatedProfile: MusicianProfile = {
        ...profile,
        instrument: instrument.trim(),
        performanceFrequency: formData.performanceFrequency,
        crowdSize: formData.crowdSize,
        yearsOfExperience: formData.yearsOfExperience,
        marketingEfforts: formData.marketingEfforts,
        surveyResponseHistory: [...(profile.surveyResponseHistory || []), updatedResponse],
        lastUpdated: new Date()
      };

      // Save to storage
      await storageService.saveProfile(updatedProfile);
      
      // Update context
      dispatch({ type: 'SET_PROFILE', payload: updatedProfile });
      dispatch({ type: 'UPDATE_SURVEY_RESPONSES', payload: updatedResponse });

      // Call the onSave callback
      onSave(updatedResponse);
      
      setSaveMessage('Settings saved successfully!');
      
      // Auto-navigate back to dashboard after a short delay
      setTimeout(() => {
        setPage('dashboard');
      }, 1500);
      
    } catch (error) {
      console.error('Failed to save settings:', error);
      setSaveMessage('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [formData, customInstrument, profile, onSave, dispatch, setPage, isSaving]);

  const handleCancel = useCallback(() => {
    onCancel();
    setPage('dashboard');
  }, [onCancel, setPage]);

  return (
    <div className="settings-page">
      <div className="container">
        <div className="settings-container">
          <div className="settings-header">
            <h1>Settings</h1>
            <p className="text-muted">Update your profile information and preferences</p>
          </div>

          <div className="settings-content">
            {/* Survey Response Editor Section */}
            <div className="settings-section">
              <h3>Profile Information</h3>
              <p className="section-description">
                Update your survey responses to get more relevant recommendations.
              </p>

              <div className="form-group mb-4">
                <label htmlFor="instrument" className="form-label">
                  Primary Instrument <span className="text-danger">*</span>
                </label>
                <select
                  id="instrument"
                  className="form-select"
                  value={customInstrument.isOther ? 'Other' : formData.instrument}
                  onChange={(e) => handleInstrumentChange(e.target.value)}
                >
                  <option value="">Select an instrument</option>
                  {INSTRUMENTS.map(instrument => (
                    <option key={instrument} value={instrument}>
                      {instrument}
                    </option>
                  ))}
                </select>
                
                {customInstrument.isOther && (
                  <input
                    type="text"
                    className="form-control mt-2"
                    placeholder="Enter your instrument"
                    value={customInstrument.value}
                    onChange={(e) => handleCustomInstrumentChange(e.target.value)}
                  />
                )}
              </div>

              <div className="form-group mb-4">
                <label className="form-label">
                  How often do you perform? <span className="text-danger">*</span>
                </label>
                <select
                  className="form-select"
                  value={formData.performanceFrequency}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    performanceFrequency: e.target.value as any 
                  }))}
                >
                  <option value="">Select frequency</option>
                  <option value="never">Never</option>
                  <option value="yearly">A few times a year</option>
                  <option value="monthly">Monthly</option>
                  <option value="weekly">Weekly</option>
                  <option value="multiple">Multiple times per week</option>
                </select>
              </div>

              <div className="form-group mb-4">
                <label className="form-label">
                  What's your typical crowd size? <span className="text-danger">*</span>
                </label>
                <select
                  className="form-select"
                  value={formData.crowdSize}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    crowdSize: e.target.value as any 
                  }))}
                >
                  <option value="">Select crowd size</option>
                  <option value="1-10">1-10 people</option>
                  <option value="10-50">10-50 people</option>
                  <option value="50-100">50-100 people</option>
                  <option value="100-500">100-500 people</option>
                  <option value="500+">500+ people</option>
                </select>
              </div>

              <div className="form-group mb-4">
                <label htmlFor="experience" className="form-label">
                  Years of Experience <span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  id="experience"
                  className="form-control"
                  min="0"
                  max="50"
                  value={formData.yearsOfExperience}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    yearsOfExperience: parseInt(e.target.value) || 0 
                  }))}
                />
              </div>

              <div className="form-group mb-4">
                <label className="form-label">
                  How do you currently market yourself? <span className="text-danger">*</span>
                </label>
                <p className="form-text text-muted mb-3">Select all that apply</p>
                <div className="checkbox-group">
                  {MARKETING_OPTIONS.map(option => (
                    <div key={option.id} className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`marketing-${option.id}`}
                        checked={formData.marketingEfforts.includes(option.id)}
                        onChange={() => handleMarketingToggle(option.id)}
                      />
                      <label className="form-check-label" htmlFor={`marketing-${option.id}`}>
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Notification Preferences Section */}
            <div className="settings-section">
              <h3>Notification Preferences</h3>
              <p className="section-description">
                Manage how you receive updates and reminders.
              </p>
              
              <div className="form-check mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="practiceReminders"
                  checked={profile.preferences?.practiceReminders ?? true}
                  onChange={() => {
                    // Practice reminders toggle - future implementation
                  }}
                />
                <label className="form-check-label" htmlFor="practiceReminders">
                  Practice reminders (Coming soon)
                </label>
              </div>
              
              <div className="form-check mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="goalDeadlines"
                  checked={profile.preferences?.goalDeadlineAlerts ?? true}
                  onChange={() => {
                    // Goal deadline alerts toggle - future implementation
                  }}
                />
                <label className="form-check-label" htmlFor="goalDeadlines">
                  Goal deadline alerts (Coming soon)
                </label>
              </div>
            </div>

            {/* Profile Management Section */}
            <div className="settings-section">
              <h3>Profile Management</h3>
              <p className="section-description">
                Manage your profile and data.
              </p>
              
              <div className="profile-info">
                <p><strong>Profile Name:</strong> {profile.name}</p>
                <p><strong>Created:</strong> {new Date(profile.createdAt).toLocaleDateString()}</p>
                <p><strong>Last Updated:</strong> {new Date(profile.lastUpdated).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Save Message */}
          {saveMessage && (
            <div className={`alert ${saveMessage.includes('success') ? 'alert-success' : 'alert-danger'} mt-3`}>
              {saveMessage}
            </div>
          )}

          {/* Form Actions */}
          <div className="settings-actions">
            <button
              type="button"
              className="btn btn-secondary me-3"
              onClick={handleCancel}
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;