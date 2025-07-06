import { describe, it, expect, vi } from 'vitest';
import { render, screen, act, waitFor } from '@/test-utils';
import userEvent from '@testing-library/user-event';
import App from '@/App';

vi.mock('@/core/recommendationEngine', () => ({
  generateRecommendations: vi.fn(() => [
    {
      id: 'MOCK_REC_01',
      title: 'Mock Recommendation',
      description: 'This is a mock recommendation for testing.',
      category: 'marketing',
      priority: 'high',
    },
  ]),
}));

describe('App E2E Flow', () => {
  it('navigates from landing page, through form, to recommendations', async () => {
    const user = userEvent.setup();
    render(<App />);

    // 1. Landing Page: User clicks "Get Started"
    expect(screen.getByText('Find Your Next Step as a Musician')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Get Started' }));

    // 2. Form Page: User fills out the form
    expect(screen.getByText("What's your primary instrument?")).toBeInTheDocument();

    // Step 1: Instrument
    await user.click(screen.getByText('Guitar'));
    await user.click(screen.getByRole('button', { name: 'Next' }));

    // Step 2: Performance Frequency
    await user.click(screen.getByLabelText('Weekly'));
    await user.click(screen.getByRole('button', { name: 'Next' }));

    // Step 3: Crowd Size
    await user.click(screen.getByLabelText('50-100 people'));
    await user.click(screen.getByRole('button', { name: 'Next' }));

    // Step 4: Experience
    const experienceInput = screen.getByLabelText('Years of experience');
    await user.clear(experienceInput);
    await user.type(experienceInput, '5');
    await user.click(screen.getByRole('button', { name: 'Next' }));

    // Step 5: Marketing Efforts
    await user.click(screen.getByLabelText('Social Media (Facebook, Instagram, TikTok)'));
    
    // Submit form and wait for async operations
    await act(async () => {
      await user.click(screen.getByRole('button', { name: 'Get My Advice' }));
    });

    // 3. Wait for loading state and results page
    await waitFor(
      () => {
        expect(screen.getByText('Your Personalized Music Career Plan')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
    
    expect(await screen.findByText('Mock Recommendation')).toBeInTheDocument();

    // 4. Reset and go back to Landing Page
    await user.click(screen.getByRole('button', { name: 'Start Over' }));
    expect(screen.getByText('Find Your Next Step as a Musician')).toBeInTheDocument();
  });
});
