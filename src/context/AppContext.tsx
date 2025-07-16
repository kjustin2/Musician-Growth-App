import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import { AppState, AppAction, PageState, MusicianProfile, Recommendation } from '@/core/types';
import { generateRecommendations } from '@/core/recommendationEngine';
import { RECOMMENDATION_CONFIG } from '@/core/constants';

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
  switch (action.type) {
    case 'SET_PAGE':
      return { ...state, currentPage: action.payload };
    case 'SET_PROFILE':
      return { ...state, musicianProfile: action.payload };
    case 'SET_AVAILABLE_PROFILES':
      return { ...state, availableProfiles: action.payload };
    case 'SET_RECOMMENDATIONS':
      return { ...state, recommendations: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_NAVIGATION_CONTEXT':
      return { ...state, navigationContext: action.payload };
    case 'ADD_PERFORMANCE':
      if (!state.musicianProfile) return state;
      return {
        ...state,
        musicianProfile: {
          ...state.musicianProfile,
          shows: [...state.musicianProfile.shows, action.payload],
          lastUpdated: new Date()
        }
      };
    case 'ADD_PRACTICE_SESSION':
      if (!state.musicianProfile) return state;
      return {
        ...state,
        musicianProfile: {
          ...state.musicianProfile,
          practiceLog: [...state.musicianProfile.practiceLog, action.payload],
          lastUpdated: new Date()
        }
      };
    case 'ADD_GOAL':
      if (!state.musicianProfile) return state;
      return {
        ...state,
        musicianProfile: {
          ...state.musicianProfile,
          goals: [...state.musicianProfile.goals, action.payload],
          lastUpdated: new Date()
        }
      };
    case 'UPDATE_GOAL':
      if (!state.musicianProfile) return state;
      return {
        ...state,
        musicianProfile: {
          ...state.musicianProfile,
          goals: state.musicianProfile.goals.map(goal =>
            goal.id === action.payload.id ? { ...goal, ...action.payload.updates } : goal
          ),
          lastUpdated: new Date()
        }
      };
    case 'ADD_ACHIEVEMENT':
      if (!state.musicianProfile) return state;
      return {
        ...state,
        musicianProfile: {
          ...state.musicianProfile,
          achievements: [...state.musicianProfile.achievements, action.payload],
          lastUpdated: new Date()
        }
      };
    case 'RESET':
      return initialState;
    default:
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
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Import storage service dynamically to avoid circular dependency
      const { storageService } = await import('../services/storageService');
      
      // Initialize storage if not already done
      await storageService.init();
      
      // Save profile to storage
      await storageService.saveProfile(profile);
      
      // Set profile in context
      dispatch({ type: 'SET_PROFILE', payload: profile });
      
      // Generate recommendations
      const recommendations = generateRecommendations(profile);
      dispatch({ type: 'SET_RECOMMENDATIONS', payload: recommendations });
      
      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, RECOMMENDATION_CONFIG.LOADING_DELAY_MS));
      
      // Always navigate to dashboard for new profiles after survey completion
      // This gives users immediate access to their profile and features
      dispatch({ type: 'SET_PAGE', payload: 'dashboard' });
    } catch (error) {
      console.error('Profile submission error:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to save profile' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [dispatch]);
}

export function useQuickRecommendations() {
  const { dispatch } = useApp();
  return useCallback(async (profile: MusicianProfile) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Generate recommendations without saving profile (for quick recommendations)
      const recommendations = generateRecommendations(profile);
      dispatch({ type: 'SET_RECOMMENDATIONS', payload: recommendations });
      
      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, RECOMMENDATION_CONFIG.LOADING_DELAY_MS));
      
      // Set navigation context for onboarding flow
      dispatch({ type: 'SET_NAVIGATION_CONTEXT', payload: 'onboarding' });
      
      // Navigate to results page for quick recommendations
      dispatch({ type: 'SET_PAGE', payload: 'results' });
    } catch (error) {
      console.error('Quick recommendations error:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to generate recommendations' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [dispatch]);
}