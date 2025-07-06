export interface MusicianProfile {
  instrument: string;
  performanceFrequency: 'never' | 'yearly' | 'monthly' | 'weekly' | 'multiple';
  crowdSize: '1-10' | '10-50' | '50-100' | '100-500' | '500+';
  yearsOfExperience: number;
  marketingEfforts: string[];
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  category: 'marketing' | 'performance' | 'networking' | 'skill';
  priority: 'high' | 'medium' | 'low';
}

export type PageState = 'landing' | 'form' | 'results';

export interface AppState {
  currentPage: PageState;
  musicianProfile: MusicianProfile | null;
  recommendations: Recommendation[];
  isLoading: boolean;
}

export type AppAction =
  | { type: 'SET_PAGE'; payload: PageState }
  | { type: 'SET_PROFILE'; payload: MusicianProfile }
  | { type: 'SET_RECOMMENDATIONS'; payload: Recommendation[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'RESET' };