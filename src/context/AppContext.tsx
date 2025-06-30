import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { AppState, AppAction, PageState, MusicianProfile, Recommendation } from '@/core/types';

const initialState: AppState = {
  currentPage: 'landing',
  musicianProfile: null,
  recommendations: [],
  isLoading: false,
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
    case 'SET_RECOMMENDATIONS':
      return { ...state, recommendations: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
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