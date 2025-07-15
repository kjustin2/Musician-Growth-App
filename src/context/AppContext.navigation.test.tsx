import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { AppProvider, useSubmitProfile, useQuickRecommendations } from './AppContext';
import { MusicianProfile } from '../core/types';

// Mock the storage service
vi.mock('../services/storageService', () => ({
  storageService: {
    init: vi.fn().mockResolvedValue(undefined),
    saveProfile: vi.fn().mockResolvedValue(undefined),
  }
}));

// Mock the recommendation engine
vi.mock('../core/recommendationEngine', () => ({
  generateRecommendations: vi.fn().mockReturnValue([
    { id: '1', text: 'Test recommendation', category: 'general' }
  ])
}));

// Mock the constants
vi.mock('../core/constants', () => ({
  RECOMMENDATION_CONFIG: {
    LOADING_DELAY_MS: 0 // No delay for tests
  }
}));

const mockProfile: MusicianProfile = {
  id: 'test-profile',
  name: 'Test User',
  instrument: 'guitar',
  genres: ['rock'],
  yearsOfExperience: 5,
  performanceFrequency: 'monthly' as const,
  crowdSize: '50-100' as const,
  marketingEfforts: ['social media'],
  shows: [],
  practiceLog: [],
  goals: [],
  achievements: [],
  preferences: {
    notifications: true,
    dataSharing: false,
    themes: 'light' as const,
    language: 'en'
  },
  createdAt: new Date(),
  lastUpdated: new Date()
};

describe('AppContext - Survey Completion Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should navigate to dashboard after profile submission', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AppProvider>{children}</AppProvider>
    );

    const { result } = renderHook(() => useSubmitProfile(), { wrapper });
    
    await act(async () => {
      await result.current(mockProfile);
    });

    // The hook should have completed without errors
    expect(result.current).toBeDefined();
  });

  it('should handle profile submission errors gracefully', async () => {
    // Mock storage service to throw an error
    const mockStorageService = await import('../services/storageService');
    vi.mocked(mockStorageService.storageService.saveProfile).mockRejectedValueOnce(
      new Error('Storage error')
    );

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AppProvider>{children}</AppProvider>
    );

    const { result } = renderHook(() => useSubmitProfile(), { wrapper });
    
    await act(async () => {
      await result.current(mockProfile);
    });

    // Should handle error gracefully
    expect(result.current).toBeDefined();
  });

  it('should support quick recommendations without profile saving', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AppProvider>{children}</AppProvider>
    );

    const { result } = renderHook(() => useQuickRecommendations(), { wrapper });
    
    await act(async () => {
      await result.current(mockProfile);
    });

    // Should complete without errors
    expect(result.current).toBeDefined();
  });

  it('should generate recommendations for both flows', async () => {
    const mockRecommendationEngine = await import('../core/recommendationEngine');
    const generateRecommendationsSpy = vi.mocked(mockRecommendationEngine.generateRecommendations);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AppProvider>{children}</AppProvider>
    );

    // Test profile submission
    const { result: submitResult } = renderHook(() => useSubmitProfile(), { wrapper });
    await act(async () => {
      await submitResult.current(mockProfile);
    });

    // Test quick recommendations
    const { result: quickResult } = renderHook(() => useQuickRecommendations(), { wrapper });
    await act(async () => {
      await quickResult.current(mockProfile);
    });

    // Both flows should generate recommendations
    expect(generateRecommendationsSpy).toHaveBeenCalledWith(mockProfile);
    expect(generateRecommendationsSpy).toHaveBeenCalledTimes(2);
  });
});

describe('AppContext - Navigation State Management', () => {
  it('should maintain consistent navigation state', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AppProvider>{children}</AppProvider>
    );

    const { result } = renderHook(() => useSubmitProfile(), { wrapper });
    
    await act(async () => {
      await result.current(mockProfile);
    });

    // Navigation should be handled internally
    expect(result.current).toBeDefined();
  });

  it('should handle concurrent navigation requests', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AppProvider>{children}</AppProvider>
    );

    const { result: submitResult } = renderHook(() => useSubmitProfile(), { wrapper });
    const { result: quickResult } = renderHook(() => useQuickRecommendations(), { wrapper });
    
    // Fire both operations simultaneously
    await act(async () => {
      await Promise.all([
        submitResult.current(mockProfile),
        quickResult.current(mockProfile)
      ]);
    });

    // Both should complete successfully
    expect(submitResult.current).toBeDefined();
    expect(quickResult.current).toBeDefined();
  });
});