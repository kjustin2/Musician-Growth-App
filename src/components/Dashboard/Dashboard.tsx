import React, { useState, useEffect } from 'react';
import { MusicianProfile, PerformanceRecord, PracticeSession, Goal, RecordingSession } from '../../core/types';
import { useApp } from '../../context/AppContext';
import { storageService } from '../../services/storageService';
import { analyticsService } from '../../services/analyticsService';
import { generateRecommendations } from '../../core/recommendationEngine';
import DashboardTabs from './DashboardTabs';
import NotificationCenter from '../common/NotificationCenter';
import OnboardingFlow from '../common/OnboardingFlow';
import { achievementService } from '../../services/achievementService';
import './Dashboard.css';

interface DashboardProps {
  profile: MusicianProfile;
}

const Dashboard: React.FC<DashboardProps> = ({ profile }) => {
  const { dispatch } = useApp();
  const [loading, setLoading] = useState(true);
  const [_recordingsLoading, setRecordingsLoading] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  // Simple cache for recordings data
  const [recordingsCache, setRecordingsCache] = useState<{
    data: RecordingSession[];
    timestamp: number;
  } | null>(null);
  const [_dashboardData, setDashboardData] = useState<{
    recentPerformances: PerformanceRecord[];
    recentPractice: PracticeSession[];
    activeGoals: Goal[];
    allPerformances: PerformanceRecord[];
    allPractices: PracticeSession[];
    allGoals: Goal[];
    recordings: RecordingSession[];
    metrics: {
      totalShows: number;
      totalPracticeTime: number;
      averagePayment: number;
      goalsCompleted: number;
    };
  }>({
    recentPerformances: [],
    recentPractice: [],
    activeGoals: [],
    allPerformances: [],
    allPractices: [],
    allGoals: [],
    recordings: [],
    metrics: {
      totalShows: 0,
      totalPracticeTime: 0,
      averagePayment: 0,
      goalsCompleted: 0
    }
  });

  useEffect(() => {
    loadDashboardData();
  }, [profile.id]);

  const loadRecordingsWithCache = async (): Promise<RecordingSession[]> => {
    const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
    const now = Date.now();
    
    // Check if we have valid cached data
    if (recordingsCache && (now - recordingsCache.timestamp) < CACHE_DURATION) {
      return recordingsCache.data;
    }
    
    // Load fresh data
    setRecordingsLoading(true);
    try {
      const recordings = await storageService.getRecordingSessions(profile.id);
      
      // Update cache
      setRecordingsCache({
        data: recordings,
        timestamp: now
      });
      
      return recordings;
    } catch (error) {
      console.error('Error loading recordings:', error);
      // Return cached data if available, otherwise empty array
      return recordingsCache?.data || [];
    } finally {
      setRecordingsLoading(false);
    }
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load recent performances
      const performances = await storageService.getPerformances(profile.id);
      const recentPerformances = performances
        .sort((a, b) => b.date.getTime() - a.date.getTime())
        .slice(0, 5);

      // Load recent practice sessions
      const practiceSessions = await storageService.getPracticeSessions(profile.id);
      const recentPractice = practiceSessions
        .sort((a, b) => b.date.getTime() - a.date.getTime())
        .slice(0, 5);

      // Load active goals
      const goals = await storageService.getGoals(profile.id);
      const activeGoals = goals.filter(goal => goal.status === 'active');

      // Load recordings with caching
      const recordings = await loadRecordingsWithCache();
      
      // Check for new achievements
      await achievementService.checkAchievements(profile.id, performances, practiceSessions, goals, recordings);

      // Check if user is new (no activities logged yet)
      const isNewUser = performances.length === 0 && practiceSessions.length === 0 && goals.length === 0;
      const hasSeenOnboarding = localStorage.getItem(`onboarding_${profile.id}`);
      
      if (isNewUser && !hasSeenOnboarding) {
        setShowOnboarding(true);
      }

      // Calculate metrics
      const metrics = {
        totalShows: performances.length,
        totalPracticeTime: analyticsService.calculateTotalPracticeTime(practiceSessions),
        averagePayment: analyticsService.calculateAverageShowPayment(performances),
        goalsCompleted: goals.filter(goal => goal.status === 'completed').length
      };

      setDashboardData({
        recentPerformances,
        recentPractice,
        activeGoals,
        allPerformances: performances,
        allPractices: practiceSessions,
        allGoals: goals,
        recordings,
        metrics
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load dashboard data' });
    } finally {
      setLoading(false);
    }
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    localStorage.setItem(`onboarding_${profile.id}`, 'completed');
  };

  const _handleQuickAction = (action: string) => {
    switch (action) {
      case 'add-show':
        dispatch({ type: 'SET_PAGE', payload: 'activity-entry' });
        break;
      case 'log-practice':
        dispatch({ type: 'SET_PAGE', payload: 'activity-entry' });
        break;
      case 'record-song':
        dispatch({ type: 'SET_PAGE', payload: 'activity-entry' });
        break;
      case 'create-goal':
        dispatch({ type: 'SET_PAGE', payload: 'goal-management' });
        break;
      case 'bulk-entry':
        dispatch({ type: 'SET_PAGE', payload: 'bulk-entry' });
        break;
      case 'view-recommendations':
        handleViewRecommendations();
        break;
      default:
        break;
    }
  };

  const handleViewRecommendations = () => {
    try {
      // Generate updated recommendations based on current profile data
      const updatedProfile = { ...profile };
      const recommendations = generateRecommendations(updatedProfile);
      
      // Update recommendations in context
      dispatch({ type: 'SET_RECOMMENDATIONS', payload: recommendations });
      
      // Set navigation context for dashboard flow
      dispatch({ type: 'SET_NAVIGATION_CONTEXT', payload: 'dashboard' });
      
      // Navigate to recommendations page
      dispatch({ type: 'SET_PAGE', payload: 'results' });
    } catch (error) {
      console.error('Error generating recommendations:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to generate recommendations. Please try again.' });
    }
  };

  const handleProfileSwitch = () => {
    // Check for unsaved data (in a real implementation, this would check for unsaved forms)
    const hasUnsavedData = false; // This would be determined by checking form states
    
    if (hasUnsavedData) {
      const confirmSwitch = window.confirm(
        'You have unsaved changes. Are you sure you want to switch profiles? Your changes will be lost.'
      );
      if (!confirmSwitch) {
        return;
      }
    }
    
    // Navigate to profile selection
    dispatch({ type: 'SET_PAGE', payload: 'profile-selection' });
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="dashboard-header-content">
          <div className="dashboard-title">
            <h1>Welcome back, {profile.name || 'Musician'}!</h1>
            <p className="dashboard-subtitle">
              Here's your musical journey at a glance
            </p>
          </div>
          <div className="dashboard-header-actions">
            <button
              className="btn btn-outline-primary profile-switch-btn"
              onClick={() => handleProfileSwitch()}
              title="Switch Profile"
              type="button"
            >
              <i className="fas fa-user-circle me-2"></i>
              Switch Profile
            </button>
            <button
              className="btn btn-outline-secondary settings-btn"
              onClick={() => dispatch({ type: 'SET_PAGE', payload: 'settings' })}
              title="Settings"
              type="button"
            >
              <i className="fas fa-cog me-2"></i>
              Settings
            </button>
            <NotificationCenter profileId={profile.id} />
          </div>
        </div>
      </div>

      {/* New Tabbed Interface */}
      <DashboardTabs profile={profile} />

      {showOnboarding && (
        <OnboardingFlow 
          profile={profile} 
          onComplete={handleOnboardingComplete}
        />
      )}
    </div>
  );
};

export default Dashboard;