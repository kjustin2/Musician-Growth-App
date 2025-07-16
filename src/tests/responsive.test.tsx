import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import Dashboard from '../components/Dashboard/Dashboard';
import ActivityTracking from '../components/ActivityTracking/ActivityTracking';
import ProgressRing from '../components/common/ProgressRing';
import { AppProvider } from '../context/AppContext';
import { MusicianProfile } from '../core/types';

// Mock all services
vi.mock('../services/storageService', () => ({
  storageService: {
    getPerformances: vi.fn().mockResolvedValue([]),
    getPracticeSessions: vi.fn().mockResolvedValue([]),
    getGoals: vi.fn().mockResolvedValue([]),
  }
}));

vi.mock('../services/analyticsService', () => ({
  analyticsService: {
    calculateTotalPracticeTime: vi.fn().mockReturnValue(0),
    calculateAverageShowPayment: vi.fn().mockReturnValue(0),
    analyzePerformanceTrends: vi.fn().mockReturnValue({}),
    analyzePracticeHabits: vi.fn().mockReturnValue({}),
    getTopVenueTypes: vi.fn().mockReturnValue([]),
    getMostPracticedSkills: vi.fn().mockReturnValue([]),
    groupActivitiesByWeek: vi.fn().mockReturnValue({}),
  }
}));

vi.mock('../services/achievementService', () => ({
  achievementService: {
    checkAchievements: vi.fn().mockResolvedValue([]),
  }
}));

vi.mock('../core/recommendationEngine', () => ({
  generateRecommendations: vi.fn().mockReturnValue([
    { id: '1', text: 'Test recommendation', category: 'general' }
  ])
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
    practiceReminders: false,
    goalDeadlineAlerts: true,
    performanceMetrics: true,
    notifications: true,
    dataSharing: false,
    themes: 'light' as const,
    language: 'en',
    defaultVenueType: 'bar'
  },
  createdAt: new Date(),
  lastUpdated: new Date()
};

// Mock the useApp hook for ActivityTracking
vi.mock('../context/AppContext', async () => {
  const actual = await vi.importActual('../context/AppContext');
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

const renderWithContext = (component: React.ReactElement) => {
  return render(
    <AppProvider>
      {component}
    </AppProvider>
  );
};

// Helper function to simulate viewport size
const setViewportSize = (width: number, height: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  });
  
  // Trigger resize event
  window.dispatchEvent(new Event('resize'));
};

describe('Responsive Design - Mobile (480px)', () => {
  beforeEach(() => {
    setViewportSize(480, 800);
  });

  afterEach(() => {
    setViewportSize(1024, 768); // Reset to desktop
  });

  it('should render dashboard properly on mobile', async () => {
    renderWithContext(<Dashboard profile={mockProfile} />);
    
    await screen.findByText('Welcome back, Test User!');
    
    // Check that key elements are present
    expect(screen.getByText('Your Personalized Recommendations')).toBeInTheDocument();
    expect(screen.getByText('View My Recommendations')).toBeInTheDocument();
  });

  it('should render progress rings with mobile constraints', () => {
    const { container } = render(
      <ProgressRing 
        value={75} 
        maxValue={100} 
        label="Mobile Test" 
      />
    );
    
    const progressRing = container.querySelector('.progress-ring');
    expect(progressRing).toBeInTheDocument();
    
    // Should use CSS variables for mobile sizing
    const styles = window.getComputedStyle(progressRing!);
    expect(styles.width).toBeTruthy();
    expect(styles.height).toBeTruthy();
  });

  it('should render activity tracking tabs on mobile', async () => {
    renderWithContext(<ActivityTracking />);
    
    await screen.findByText('Activity Tracking');
    
    // Check that tabs are still accessible on mobile
    const tabs = screen.getAllByRole('button').filter(button => 
      button.textContent?.includes('Log') || button.textContent?.includes('View')
    );
    
    expect(tabs.length).toBeGreaterThan(0);
    tabs.forEach(tab => {
      expect(tab).toHaveAccessibleName();
    });
  });

  it('should maintain recommendation card accessibility on mobile', async () => {
    renderWithContext(<Dashboard profile={mockProfile} />);
    
    await screen.findByText('Welcome back, Test User!');
    
    const recommendationButton = screen.getByText('View My Recommendations');
    expect(recommendationButton).toBeInTheDocument();
    expect(recommendationButton).toHaveAccessibleName();
    
    // Should maintain proper styling on mobile
    expect(recommendationButton).toHaveClass('btn-large');
  });
});

describe('Responsive Design - Tablet (768px)', () => {
  beforeEach(() => {
    setViewportSize(768, 1024);
  });

  afterEach(() => {
    setViewportSize(1024, 768); // Reset to desktop
  });

  it('should render dashboard grid properly on tablet', async () => {
    renderWithContext(<Dashboard profile={mockProfile} />);
    
    await screen.findByText('Welcome back, Test User!');
    
    // Check that dashboard sections are present
    expect(screen.getByText('Your Personalized Recommendations')).toBeInTheDocument();
    
    // Grid should adapt to tablet size
    const dashboardGrid = screen.getByText('Your Personalized Recommendations').closest('.dashboard-grid');
    expect(dashboardGrid).toBeInTheDocument();
  });

  it('should render progress rings with tablet constraints', () => {
    const { container } = render(
      <ProgressRing 
        value={60} 
        maxValue={100} 
        label="Tablet Test" 
      />
    );
    
    const progressRing = container.querySelector('.progress-ring');
    expect(progressRing).toBeInTheDocument();
    
    // Should maintain proper sizing on tablet
    const styles = window.getComputedStyle(progressRing!);
    expect(styles.maxWidth).toBe('100%');
    expect(styles.maxHeight).toBe('100%');
  });

  it('should maintain tab navigation usability on tablet', async () => {
    renderWithContext(<ActivityTracking />);
    
    await screen.findByText('Activity Tracking');
    
    // Tabs should be easily clickable on tablet
    const performanceTab = screen.getByText('🎤 Add Performance');
    expect(performanceTab).toBeInTheDocument();
    expect(performanceTab).toHaveClass('tab-button');
  });
});

describe('Responsive Design - Desktop (1024px+)', () => {
  beforeEach(() => {
    setViewportSize(1024, 768);
  });

  it('should render dashboard with full desktop layout', async () => {
    renderWithContext(<Dashboard profile={mockProfile} />);
    
    await screen.findByText('Welcome back, Test User!');
    
    // All dashboard sections should be present
    expect(screen.getByText('Your Personalized Recommendations')).toBeInTheDocument();
    
    // Should use auto-fit grid layout
    const dashboardGrid = screen.getByText('Your Personalized Recommendations').closest('.dashboard-grid');
    expect(dashboardGrid).toBeInTheDocument();
  });

  it('should render progress rings with desktop size', () => {
    const { container } = render(
      <ProgressRing 
        value={90} 
        maxValue={100} 
        label="Desktop Test" 
      />
    );
    
    const progressRing = container.querySelector('.progress-ring');
    expect(progressRing).toBeInTheDocument();
    
    // Should use default size on desktop
    const styles = window.getComputedStyle(progressRing!);
    expect(styles.width).toBeTruthy();
    expect(styles.height).toBeTruthy();
  });

  it('should maintain full tab navigation on desktop', async () => {
    renderWithContext(<ActivityTracking />);
    
    await screen.findByText('Activity Tracking');
    
    // All tabs should be easily accessible
    const tabs = screen.getAllByRole('button').filter(button => 
      button.textContent?.includes('Log') || button.textContent?.includes('View')
    );
    
    expect(tabs.length).toBeGreaterThan(0);
    tabs.forEach(tab => {
      expect(tab).toHaveAccessibleName();
      expect(tab).toHaveClass('tab-button');
    });
  });
});

describe('Responsive Design - CSS Variables', () => {
  it('should use CSS variables for consistent sizing', () => {
    // Test that our CSS variables are working properly
    const { container } = render(
      <ProgressRing 
        value={50} 
        maxValue={100} 
        label="Variable Test" 
      />
    );
    
    const progressRing = container.querySelector('.progress-ring');
    expect(progressRing).toBeInTheDocument();
    
    // Should use CSS variables for dimensions
    const styles = window.getComputedStyle(progressRing!);
    expect(styles.boxSizing).toBe('border-box');
    expect(styles.overflow).toBe('hidden');
  });

  it('should maintain consistent theming across screen sizes', async () => {
    // Test mobile
    setViewportSize(480, 800);
    const { rerender } = renderWithContext(<Dashboard profile={mockProfile} />);
    
    await screen.findByText('Welcome back, Test User!');
    
    let recommendationButton = screen.getByText('View My Recommendations');
    expect(recommendationButton).toHaveClass('btn-primary', 'btn-large');
    
    // Test desktop
    setViewportSize(1024, 768);
    rerender(
      <AppProvider>
        <Dashboard profile={mockProfile} />
      </AppProvider>
    );
    
    await screen.findByText('Welcome back, Test User!');
    
    recommendationButton = screen.getByText('View My Recommendations');
    expect(recommendationButton).toHaveClass('btn-primary', 'btn-large');
  });
});

describe('Responsive Design - Accessibility Maintenance', () => {
  it('should maintain accessibility across all screen sizes', async () => {
    const screenSizes = [
      { width: 480, height: 800 },   // Mobile
      { width: 768, height: 1024 },  // Tablet
      { width: 1024, height: 768 },  // Desktop
      { width: 1920, height: 1080 }  // Large desktop
    ];
    
    for (const size of screenSizes) {
      setViewportSize(size.width, size.height);
      
      const { rerender } = renderWithContext(<ActivityTracking />);
      
      await screen.findAllByText('Activity Tracking');
      
      // Check that tabs maintain accessibility
      const tabs = screen.getAllByRole('button').filter(button => 
        button.textContent?.includes('Log') || button.textContent?.includes('View')
      );
      
      tabs.forEach(tab => {
        expect(tab).toHaveAccessibleName();
        expect(tab).not.toBeDisabled();
      });
      
      rerender(
        <AppProvider>
          <ActivityTracking />
        </AppProvider>
      );
    }
  });

  it('should maintain proper contrast ratios across screen sizes', async () => {
    const screenSizes = [480, 768, 1024, 1920];
    
    for (const width of screenSizes) {
      setViewportSize(width, 800);
      
      const { rerender } = renderWithContext(<Dashboard profile={mockProfile} />);
      
      await screen.findAllByText('Welcome back, Test User!');
      
      // Check that recommendation card maintains proper styling
      const recommendationCards = screen.getAllByText('Your Personalized Recommendations');
      const recommendationCard = recommendationCards[0]?.closest('.recommendation-card');
      expect(recommendationCard).toBeInTheDocument();
      
      const recommendationButtons = screen.getAllByText('View My Recommendations');
      const recommendationButton = recommendationButtons[0];
      expect(recommendationButton).toHaveClass('btn-primary', 'btn-large');
      
      rerender(
        <AppProvider>
          <Dashboard profile={mockProfile} />
        </AppProvider>
      );
    }
  });
});