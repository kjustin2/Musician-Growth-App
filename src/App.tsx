import React, { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import LandingPage from '@/components/LandingPage/LandingPage';
import MusicianForm from '@/components/MusicianForm/MusicianForm';
import RecommendationsList from '@/components/Recommendation/RecommendationsList';
import Dashboard from '@/components/Dashboard/Dashboard';
import ProfileSelection from '@/components/ProfileSelection/ProfileSelection';
import ActivityTracking from '@/components/ActivityTracking/ActivityTracking';
import GoalManagement from '@/components/GoalManagement/GoalManagement';
import BulkEntry from '@/components/BulkEntry/BulkEntry';
import { SettingsPage } from '@/components/Settings';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { initializationService } from '@/services/initializationService';
import { loggingService } from '@/services/loggingService';
import './App.css';

function App() {
  const { state, dispatch } = useApp();
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        loggingService.info('Starting application initialization');
        dispatch({ type: 'SET_LOADING', payload: true });
        
        const result = await initializationService.initializeApp({
          validateProfiles: true,
          repairCorruptedData: true,
          createMissingStructures: true,
          logDetailedResults: true
        });

        if (result.success) {
          loggingService.info('Application initialized successfully');
          setIsInitialized(true);
        } else {
          const errorMessage = `Initialization failed: ${result.errors.join(', ')}`;
          loggingService.error('Application initialization failed', new Error(errorMessage));
          setInitError(errorMessage);
        }
      } catch (error) {
        const errorMessage = `Critical initialization error: ${(error as Error).message}`;
        loggingService.error('Critical initialization error', error as Error);
        setInitError(errorMessage);
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initializeApp();
  }, [dispatch]);

  // Show loading screen during initialization
  if (!isInitialized && !initError) {
    return (
      <div className="App">
        <div className="initialization-loading">
          <div className="loading-spinner">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
          <h3>Initializing Application...</h3>
          <p>Setting up your music growth tracker</p>
        </div>
      </div>
    );
  }

  // Show error screen if initialization failed
  if (initError) {
    return (
      <div className="App">
        <div className="initialization-error">
          <div className="error-icon">
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <h3>Initialization Failed</h3>
          <p>{initError}</p>
          <button 
            className="btn btn-primary"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const renderCurrentPage = () => {
    switch (state.currentPage) {
      case 'landing':
        return <LandingPage />;
      case 'profile-selection':
        return <ProfileSelection />;
      case 'profile-creation':
        return <MusicianForm />;
      case 'dashboard':
        return state.musicianProfile ? <Dashboard profile={state.musicianProfile} /> : <ProfileSelection />;
      case 'activity-entry':
        return <ActivityTracking />;
      case 'goal-management':
        return <GoalManagement />;
      case 'bulk-entry':
        return <BulkEntry />;
      case 'settings':
        return state.musicianProfile ? (
          <SettingsPage 
            profile={state.musicianProfile}
            onSave={() => {}} // This will be handled internally by the component
            onCancel={() => {}} // This will be handled internally by the component
          />
        ) : <ProfileSelection />;
      case 'form':
        return <MusicianForm />;
      case 'results':
        return <RecommendationsList />;
      default:
        return <LandingPage />;
    }
  };

  return (
    <ErrorBoundary>
      <div className="App">
        {renderCurrentPage()}
      </div>
    </ErrorBoundary>
  );
}

export default App;