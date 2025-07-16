import React, { useState, useEffect } from 'react';
import { MusicianProfile, PerformanceRecord, PracticeSession, Goal } from '../../core/types';
import { useApp } from '../../context/AppContext';
import { storageService } from '../../services/storageService';
import { analyticsService } from '../../services/analyticsService';
import { generateRecommendations } from '../../core/recommendationEngine';
import DashboardMetrics from './DashboardMetrics';
import RecentActivities from './RecentActivities';
import GoalProgress from './GoalProgress';
import QuickActions from './QuickActions';
import DashboardCharts from './DashboardCharts';
import NotificationCenter from '../common/NotificationCenter';
import AchievementDisplay from '../common/AchievementDisplay';
import OnboardingFlow from '../common/OnboardingFlow';
import { achievementService } from '../../services/achievementService';
import './Dashboard.css';

interface DashboardProps {
  profile: MusicianProfile;
}

const Dashboard: React.FC<DashboardProps> = ({ profile }) => {
  const { dispatch } = useApp();
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [dashboardData, setDashboardData] = useState<{
    recentPerformances: PerformanceRecord[];
    recentPractice: PracticeSession[];
    activeGoals: Goal[];
    allPerformances: PerformanceRecord[];
    allPractices: PracticeSession[];
    allGoals: Goal[];
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

      // Check for new achievements
      await achievementService.checkAchievements(profile.id, performances, practiceSessions, goals);

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

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'add-show':
        dispatch({ type: 'SET_PAGE', payload: 'activity-entry' });
        break;
      case 'log-practice':
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
      
      // Navigate to recommendations page
      dispatch({ type: 'SET_PAGE', payload: 'results' });
    } catch (error) {
      console.error('Error generating recommendations:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to generate recommendations. Please try again.' });
    }
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
          <NotificationCenter profileId={profile.id} />
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-section">
          <DashboardMetrics metrics={dashboardData.metrics} />
        </div>

        <div className="dashboard-section">
          <QuickActions onAction={handleQuickAction} />
        </div>

        <div className="dashboard-section">
          <RecentActivities 
            performances={dashboardData.recentPerformances}
            practices={dashboardData.recentPractice}
          />
        </div>

        <div className="dashboard-section">
          <GoalProgress 
            goals={dashboardData.activeGoals}
            onGoalClick={() => dispatch({ type: 'SET_PAGE', payload: 'goal-management' })}
          />
        </div>

        <div className="dashboard-section recommendation-card">
          <h3>Your Personalized Recommendations</h3>
          <p className="recommendation-description">
            Get updated advice based on your latest activities and progress. Our AI analyzes your performance data and practice habits to provide tailored guidance.
          </p>
          <div className="recommendation-actions">
            <button 
              className="btn btn-primary btn-large"
              onClick={handleViewRecommendations}
              type="button"
            >
              <span className="action-icon">💡</span>
              View My Recommendations
            </button>
            <div className="recommendation-hint">
              <small>Updated based on your recent activities</small>
            </div>
          </div>
        </div>
      </div>

      <DashboardCharts 
        performances={dashboardData.allPerformances}
        practices={dashboardData.allPractices}
        goals={dashboardData.allGoals}
      />

      <AchievementDisplay profileId={profile.id} showProgress={true} />

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