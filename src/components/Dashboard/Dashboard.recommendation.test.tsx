import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Dashboard from './Dashboard';
import { AppProvider } from '../../context/AppContext';
import { MusicianProfile } from '../../core/types';

// Mock all the services
vi.mock('../../services/storageService', () => ({
  storageService: {
    getPerformances: vi.fn().mockResolvedValue([]),
    getPracticeSessions: vi.fn().mockResolvedValue([]),
    getGoals: vi.fn().mockResolvedValue([]),
  }
}));

vi.mock('../../services/analyticsService', () => ({
  analyticsService: {
    calculateTotalPracticeTime: vi.fn().mockReturnValue(0),
    calculateAverageShowPayment: vi.fn().mockReturnValue(0),
  }
}));

vi.mock('../../services/achievementService', () => ({
  achievementService: {
    checkAchievements: vi.fn().mockResolvedValue([]),
  }
}));

vi.mock('../../core/recommendationEngine', () => ({
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
    notifications: true,
    dataSharing: false,
    themes: 'light' as const,
    language: 'en'
  },
  createdAt: new Date(),
  lastUpdated: new Date()
};

const renderWithContext = (component: React.ReactElement) => {
  return render(
    <AppProvider>
      {component}
    </AppProvider>
  );
};

describe('Dashboard - Recommendation Access', () => {
  it('should render recommendation card prominently', async () => {
    renderWithContext(<Dashboard profile={mockProfile} />);
    
    // Wait for dashboard to load
    await screen.findByText('Welcome back, Test User!');
    
    // Check for recommendation card
    const recommendationCard = screen.getByText('Your Personalized Recommendations');
    expect(recommendationCard).toBeInTheDocument();
    
    // Check for description
    const description = screen.getByText(/Get updated advice based on your latest activities/);
    expect(description).toBeInTheDocument();
    
    // Check for action button
    const actionButton = screen.getByText('View My Recommendations');
    expect(actionButton).toBeInTheDocument();
  });

  it('should have accessible recommendation button', async () => {
    renderWithContext(<Dashboard profile={mockProfile} />);
    
    await screen.findByText('Welcome back, Test User!');
    
    const recommendationButton = screen.getByText('View My Recommendations');
    
    // Check accessibility attributes
    expect(recommendationButton).toHaveAttribute('type', 'button');
    expect(recommendationButton).toHaveClass('btn', 'btn-primary', 'btn-large');
    
    // Check that it's clickable
    expect(recommendationButton).not.toBeDisabled();
  });

  it('should handle recommendation button click', async () => {
    renderWithContext(<Dashboard profile={mockProfile} />);
    
    await screen.findByText('Welcome back, Test User!');
    
    const recommendationButton = screen.getByText('View My Recommendations');
    
    // Click the button
    fireEvent.click(recommendationButton);
    
    // Button should be interactive
    expect(recommendationButton).toBeInTheDocument();
  });

  it('should show recommendation hint text', async () => {
    renderWithContext(<Dashboard profile={mockProfile} />);
    
    await screen.findByText('Welcome back, Test User!');
    
    // Check for hint text
    const hintText = screen.getByText('Updated based on your recent activities');
    expect(hintText).toBeInTheDocument();
  });

  it('should apply correct CSS classes to recommendation card', async () => {
    renderWithContext(<Dashboard profile={mockProfile} />);
    
    await screen.findByText('Welcome back, Test User!');
    
    const recommendationCard = screen.getByText('Your Personalized Recommendations').closest('.dashboard-section');
    expect(recommendationCard).toHaveClass('recommendation-card');
  });

  it('should be visible in dashboard grid layout', async () => {
    renderWithContext(<Dashboard profile={mockProfile} />);
    
    await screen.findByText('Welcome back, Test User!');
    
    // Check that recommendation card is part of dashboard grid
    const dashboardGrid = screen.getByText('Your Personalized Recommendations').closest('.dashboard-grid');
    expect(dashboardGrid).toBeInTheDocument();
    
    // Check that it's a dashboard section
    const recommendationSection = screen.getByText('Your Personalized Recommendations').closest('.dashboard-section');
    expect(recommendationSection).toBeInTheDocument();
  });
});

describe('Dashboard - Recommendation Integration', () => {
  it('should update recommendations based on current profile data', async () => {
    const mockGenerateRecommendations = await import('../../core/recommendationEngine');
    const generateSpy = vi.mocked(mockGenerateRecommendations.generateRecommendations);

    renderWithContext(<Dashboard profile={mockProfile} />);
    
    await screen.findByText('Welcome back, Test User!');
    
    const recommendationButton = screen.getByText('View My Recommendations');
    fireEvent.click(recommendationButton);
    
    // Should generate recommendations with current profile
    expect(generateSpy).toHaveBeenCalledWith(mockProfile);
  });

  it('should handle recommendation generation errors gracefully', async () => {
    const mockGenerateRecommendations = await import('../../core/recommendationEngine');
    vi.mocked(mockGenerateRecommendations.generateRecommendations).mockImplementationOnce(() => {
      throw new Error('Recommendation generation failed');
    });

    renderWithContext(<Dashboard profile={mockProfile} />);
    
    await screen.findByText('Welcome back, Test User!');
    
    const recommendationButton = screen.getByText('View My Recommendations');
    
    // Should not crash when clicking
    expect(() => fireEvent.click(recommendationButton)).not.toThrow();
  });

  it('should show recommendation card for all user types', async () => {
    // Test with user who has activities
    const profileWithActivities = {
      ...mockProfile,
      shows: [
        {
          id: '1',
          date: new Date(),
          venueName: 'Test Venue',
          venueType: 'bar' as const,
          audienceSize: 50,
          duration: 120,
          payment: 100,
        }
      ]
    };

    renderWithContext(<Dashboard profile={profileWithActivities} />);
    
    await screen.findByText('Welcome back, Test User!');
    
    // Should still show recommendation card
    const recommendationCard = screen.getByText('Your Personalized Recommendations');
    expect(recommendationCard).toBeInTheDocument();
  });
});