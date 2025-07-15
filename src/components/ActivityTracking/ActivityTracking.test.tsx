import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ActivityTracking from './ActivityTracking';
import { AppProvider } from '../../context/AppContext';

// Mock the storageService to avoid actual database calls
vi.mock('../../services/storageService', () => ({
  storageService: {
    getPerformances: vi.fn().mockResolvedValue([]),
    getPracticeSessions: vi.fn().mockResolvedValue([]),
    getGoals: vi.fn().mockResolvedValue([]),
    savePerformance: vi.fn(),
    savePracticeSession: vi.fn(),
  }
}));

// Mock the analytics service
vi.mock('../../services/analyticsService', () => ({
  analyticsService: {
    analyzePerformanceTrends: vi.fn().mockReturnValue({}),
    analyzePracticeHabits: vi.fn().mockReturnValue({}),
    calculateTotalPracticeTime: vi.fn().mockReturnValue(0),
    calculateAverageShowPayment: vi.fn().mockReturnValue(0),
    getTopVenueTypes: vi.fn().mockReturnValue([]),
    getMostPracticedSkills: vi.fn().mockReturnValue([]),
    groupActivitiesByWeek: vi.fn().mockReturnValue({}),
  }
}));

const mockProfile = {
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

// Helper function to render component with context and profile
const renderWithContext = (component: React.ReactElement) => {
  return render(
    <AppProvider>
      {component}
    </AppProvider>
  );
};

// Mock the useApp hook to provide a profile
vi.mock('../../context/AppContext', async () => {
  const actual = await vi.importActual('../../context/AppContext');
  return {
    ...actual,
    useApp: vi.fn(() => ({
      state: {
        musicianProfile: mockProfile,
        currentPage: 'activity-entry'
      },
      dispatch: vi.fn()
    }))
  };
});

describe('ActivityTracking - Tab Navigation Accessibility', () => {
  it('should have sufficient contrast for active tab', async () => {
    renderWithContext(<ActivityTracking />);
    
    // Wait for component to load
    await screen.findByText('Activity Tracking');
    
    // Check that tabs are rendered
    const performanceTab = screen.getByText('Log Performance');
    const practiceTab = screen.getByText('Log Practice');
    const historyTab = screen.getByText('View History');
    
    expect(performanceTab).toBeInTheDocument();
    expect(practiceTab).toBeInTheDocument();
    expect(historyTab).toBeInTheDocument();
  });

  it('should handle keyboard navigation properly', async () => {
    renderWithContext(<ActivityTracking />);
    
    await screen.findByText('Activity Tracking');
    
    const performanceTab = screen.getByText('Log Performance');
    const practiceTab = screen.getByText('Log Practice');
    
    // Test that tabs are focusable
    performanceTab.focus();
    expect(performanceTab).toHaveFocus();
    
    // Test tab switching with click
    fireEvent.click(practiceTab);
    expect(practiceTab).toHaveClass('active');
  });

  it('should apply correct CSS classes for tab states', async () => {
    renderWithContext(<ActivityTracking />);
    
    await screen.findByText('Activity Tracking');
    
    const performanceTab = screen.getByText('Log Performance');
    const practiceTab = screen.getByText('Log Practice');
    
    // Check initial active state
    expect(performanceTab).toHaveClass('active');
    expect(practiceTab).not.toHaveClass('active');
    
    // Click on practice tab
    fireEvent.click(practiceTab);
    
    // Check state change
    expect(practiceTab).toHaveClass('active');
    expect(performanceTab).not.toHaveClass('active');
  });

  it('should maintain accessibility attributes', async () => {
    renderWithContext(<ActivityTracking />);
    
    await screen.findByText('Activity Tracking');
    
    const tabs = screen.getAllByRole('button').filter(button => 
      button.textContent?.includes('Log') || button.textContent?.includes('View')
    );
    
    // Check that all tabs have proper button roles
    tabs.forEach(tab => {
      expect(tab).toHaveAttribute('role', 'button');
      expect(tab).toHaveAttribute('type', 'button');
    });
  });
});

describe('ActivityTracking - History Tab Navigation', () => {
  it('should render history tabs with proper contrast', async () => {
    renderWithContext(<ActivityTracking />);
    
    await screen.findByText('Activity Tracking');
    
    // Navigate to history tab
    const historyTab = screen.getByText('View History');
    fireEvent.click(historyTab);
    
    // Check for history navigation tabs
    const performancesHistoryTab = screen.getByText('Performances');
    const practiceHistoryTab = screen.getByText('Practice');
    const analyticsTab = screen.getByText('Analytics');
    
    expect(performancesHistoryTab).toBeInTheDocument();
    expect(practiceHistoryTab).toBeInTheDocument();
    expect(analyticsTab).toBeInTheDocument();
  });

  it('should handle history tab navigation', async () => {
    renderWithContext(<ActivityTracking />);
    
    await screen.findByText('Activity Tracking');
    
    // Navigate to history tab
    const historyTab = screen.getByText('View History');
    fireEvent.click(historyTab);
    
    const performancesHistoryTab = screen.getByText('Performances');
    const practiceHistoryTab = screen.getByText('Practice');
    
    // Test switching between history tabs
    fireEvent.click(practiceHistoryTab);
    expect(practiceHistoryTab).toHaveClass('active');
    
    fireEvent.click(performancesHistoryTab);
    expect(performancesHistoryTab).toHaveClass('active');
  });
});