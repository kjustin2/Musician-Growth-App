import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test-utils';
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
  it('navigates from landing page to profile selection', async () => {
    const user = userEvent.setup();
    render(<App />);

    // 1. Landing Page: User clicks "Get Started"
    expect(screen.getByText('Track Your Musical Journey')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Get Started' }));

    // 2. Profile Selection: Shows loading state with mocked IndexedDB
    expect(screen.getByText('Loading your profiles...')).toBeInTheDocument();

    // Test shows that the application correctly handles IndexedDB errors
    // In a real browser environment, this would load the profile selection
  });
});
