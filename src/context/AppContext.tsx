import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import { AppState, AppAction, PageState, MusicianProfile, Recommendation } from '@/core/types';
import { generateRecommendations } from '@/core/recommendationEngine';
import { RECOMMENDATION_CONFIG } from '@/core/constants';
import { loggingService } from '../services/loggingService';

const initialState: AppState = {
  currentPage: 'landing',
  musicianProfile: null,
  availableProfiles: [],
  recommendations: [],
  isLoading: false,
  error: null,
  navigationContext: null,
};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | undefined>(undefined);

function appReducer(state: AppState, action: AppAction): AppState {
  // Log all state changes with context
  loggingService.debug(`AppContext action: ${action.type}`, {
    action: action.type,
    payload: 'payload' in action ? action.payload : undefined,
    currentPage: state.currentPage,
    hasProfile: !!state.musicianProfile,
    profileId: state.musicianProfile?.id
  });

  try {
    switch (action.type) {
      case 'SET_PAGE':
        loggingService.info(`Page navigation: ${state.currentPage} -> ${action.payload}`);
        return { ...state, currentPage: action.payload };
        
      case 'SET_PROFILE':
        loggingService.info('Profile set', {
          profileId: action.payload?.id,
          profileName: action.payload?.name,
          hasExistingProfile: !!state.musicianProfile
        });
        return { ...state, musicianProfile: action.payload };
        
      case 'SET_AVAILABLE_PROFILES':
        loggingService.info('Available profiles updated', {
          count: action.payload?.length || 0
        });
        return { ...state, availableProfiles: action.payload };
        
      case 'SET_RECOMMENDATIONS':
        loggingService.info('Recommendations updated', {
          count: action.payload?.length || 0,
          categories: action.payload?.map(r => r.category) || []
        });
        return { ...state, recommendations: action.payload };
        
      case 'SET_LOADING':
        loggingService.debug(`Loading state: ${action.payload}`);
        return { ...state, isLoading: action.payload };
        
      case 'SET_ERROR':
        if (action.payload) {
          loggingService.error('App error set', new Error(action.payload));
        } else {
          loggingService.debug('App error cleared');
        }
        return { ...state, error: action.payload };
        
      case 'SET_NAVIGATION_CONTEXT':
        loggingService.debug(`Navigation context: ${action.payload}`);
        return { ...state, navigationContext: action.payload };
        
      case 'ADD_PERFORMANCE':
        if (!state.musicianProfile) {
          loggingService.warn('Attempted to add performance without profile');
          return state;
        }
        loggingService.info('Performance added', {
          profileId: state.musicianProfile.id,
          performanceId: action.payload.id,
          venue: action.payload.venueName,
          date: action.payload.date
        });
        return {
          ...state,
          musicianProfile: {
            ...state.musicianProfile,
            shows: [...(state.musicianProfile.shows || []), action.payload],
            lastUpdated: new Date()
          }
        };
        
      case 'ADD_PRACTICE_SESSION':
        if (!state.musicianProfile) {
          loggingService.warn('Attempted to add practice session without profile');
          return state;
        }
        loggingService.info('Practice session added', {
          profileId: state.musicianProfile.id,
          sessionId: action.payload.id,
          duration: action.payload.duration,
          date: action.payload.date
        });
        return {
          ...state,
          musicianProfile: {
            ...state.musicianProfile,
            practiceLog: [...(state.musicianProfile.practiceLog || []), action.payload],
            lastUpdated: new Date()
          }
        };
        
      case 'ADD_GOAL':
        if (!state.musicianProfile) {
          loggingService.warn('Attempted to add goal without profile');
          return state;
        }
        loggingService.info('Goal added', {
          profileId: state.musicianProfile.id,
          goalId: action.payload.id,
          goalTitle: action.payload.title,
          goalType: action.payload.type
        });
        return {
          ...state,
          musicianProfile: {
            ...state.musicianProfile,
            goals: [...(state.musicianProfile.goals || []), action.payload],
            lastUpdated: new Date()
          }
        };
        
      case 'UPDATE_GOAL':
        if (!state.musicianProfile) {
          loggingService.warn('Attempted to update goal without profile');
          return state;
        }
        loggingService.info('Goal updated', {
          profileId: state.musicianProfile.id,
          goalId: action.payload.id,
          updates: Object.keys(action.payload.updates)
        });
        return {
          ...state,
          musicianProfile: {
            ...state.musicianProfile,
            goals: (state.musicianProfile.goals || []).map(goal =>
              goal.id === action.payload.id ? { ...goal, ...action.payload.updates } : goal
            ),
            lastUpdated: new Date()
          }
        };
        
      case 'ADD_ACHIEVEMENT':
        if (!state.musicianProfile) {
          loggingService.warn('Attempted to add achievement without profile');
          return state;
        }
        loggingService.info('Achievement added', {
          profileId: state.musicianProfile.id,
          achievementId: action.payload.id
        });
        return {
          ...state,
          musicianProfile: {
            ...state.musicianProfile,
            achievements: [...(state.musicianProfile.achievements || []), action.payload],
            lastUpdated: new Date()
          }
        };
        
      case 'ADD_RECORDING':
        if (!state.musicianProfile) {
          loggingService.warn('Attempted to add recording without profile');
          return state;
        }
        loggingService.info('Recording added', {
          profileId: state.musicianProfile.id,
          recordingId: action.payload.id,
          location: action.payload.location,
          songCount: action.payload.songs?.length || 0
        });
        return {
          ...state,
          musicianProfile: {
            ...state.musicianProfile,
            recordings: [...(state.musicianProfile.recordings || []), action.payload],
            lastUpdated: new Date()
          }
        };
        
      case 'UPDATE_RECORDING':
        if (!state.musicianProfile) {
          loggingService.warn('Attempted to update recording without profile');
          return state;
        }
        loggingService.info('Recording updated', {
          profileId: state.musicianProfile.id,
          recordingId: action.payload.id,
          updates: Object.keys(action.payload.updates)
        });
        return {
          ...state,
          musicianProfile: {
            ...state.musicianProfile,
            recordings: (state.musicianProfile.recordings || []).map(recording =>
              recording.id === action.payload.id ? { ...recording, ...action.payload.updates } : recording
            ),
            lastUpdated: new Date()
          }
        };
        
      case 'UPDATE_SURVEY_RESPONSES':
        if (!state.musicianProfile) {
          loggingService.warn('Attempted to update survey responses without profile');
          return state;
        }
        loggingService.info('Survey responses updated', {
          profileId: state.musicianProfile.id,
          responseId: action.payload.id
        });
        return {
          ...state,
          musicianProfile: {
            ...state.musicianProfile,
            surveyResponseHistory: [...(state.musicianProfile.surveyResponseHistory || []), action.payload],
            lastUpdated: new Date()
          }
        };
        
      case 'RESET':
        loggingService.info('App state reset');
        return initialState;
        
      default:
        loggingService.warn('Unknown action type', { actionType: (action as any).type });
        return state;
    }
  } catch (error) {
    loggingService.error('Error in appReducer', error as Error, {
      actionType: action.type,
      payload: 'payload' in action ? action.payload : undefined
    });
    return state;
  }
}

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

// Convenience hooks
export function useSetPage() {
  const { dispatch } = useApp();
  return (page: PageState) => dispatch({ type: 'SET_PAGE', payload: page });
}

export function useSetProfile() {
  const { dispatch } = useApp();
  return (profile: MusicianProfile) => dispatch({ type: 'SET_PROFILE', payload: profile });
}

export function useSetRecommendations() {
  const { dispatch } = useApp();
  return (recommendations: Recommendation[]) => dispatch({ type: 'SET_RECOMMENDATIONS', payload: recommendations });
}

export function useSetLoading() {
  const { dispatch } = useApp();
  return (loading: boolean) => dispatch({ type: 'SET_LOADING', payload: loading });
}

export function useReset() {
  const { dispatch } = useApp();
  return () => dispatch({ type: 'RESET' });
}

export function useSubmitProfile() {
  const { dispatch } = useApp();
  return useCallback(async (profile: MusicianProfile) => {
    loggingService.info('Profile submission started', { profileId: profile.id, profileName: profile.name });
    
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Import storage service dynamically to avoid circular dependency
      const { storageService } = await import('../services/storageService');
      
      // Initialize storage if not already done
      loggingService.debug('Initializing storage service');
      await storageService.init();
      
      // Save profile to storage
      loggingService.debug('Saving profile to storage', { profileId: profile.id });
      await storageService.saveProfile(profile);
      
      // Set profile in context
      dispatch({ type: 'SET_PROFILE', payload: profile });
      
      // Generate recommendations
      loggingService.debug('Generating recommendations');
      const recommendations = generateRecommendations(profile);
      dispatch({ type: 'SET_RECOMMENDATIONS', payload: recommendations });
      
      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, RECOMMENDATION_CONFIG.LOADING_DELAY_MS));
      
      // Always navigate to dashboard for new profiles after survey completion
      // This gives users immediate access to their profile and features
      dispatch({ type: 'SET_PAGE', payload: 'dashboard' });
      
      loggingService.info('Profile submission completed successfully', { 
        profileId: profile.id,
        recommendationCount: recommendations.length 
      });
    } catch (error) {
      loggingService.error('Profile submission failed', error as Error, { profileId: profile.id });
      dispatch({ type: 'SET_ERROR', payload: 'Failed to save profile' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [dispatch]);
}

export function useQuickRecommendations() {
  const { dispatch } = useApp();
  return useCallback(async (profile: MusicianProfile) => {
    loggingService.info('Quick recommendations started', { profileName: profile.name });
    
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Generate recommendations without saving profile (for quick recommendations)
      loggingService.debug('Generating quick recommendations');
      const recommendations = generateRecommendations(profile);
      dispatch({ type: 'SET_RECOMMENDATIONS', payload: recommendations });
      
      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, RECOMMENDATION_CONFIG.LOADING_DELAY_MS));
      
      // Set navigation context for onboarding flow
      dispatch({ type: 'SET_NAVIGATION_CONTEXT', payload: 'onboarding' });
      
      // Navigate to results page for quick recommendations
      dispatch({ type: 'SET_PAGE', payload: 'results' });
      
      loggingService.info('Quick recommendations completed successfully', { 
        recommendationCount: recommendations.length 
      });
    } catch (error) {
      loggingService.error('Quick recommendations failed', error as Error, { profileName: profile.name });
      dispatch({ type: 'SET_ERROR', payload: 'Failed to generate recommendations' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [dispatch]);
}