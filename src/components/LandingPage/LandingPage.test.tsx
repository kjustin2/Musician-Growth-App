import { describe, it, expect } from 'vitest';
import { render, screen, act } from '@/test-utils';
import userEvent from '@testing-library/user-event';
import App from '@/App';

describe('LandingPage', () => {
  it('renders the main heading and CTA', () => {
    render(<App />);
    expect(screen.getByText('Track Your Musical Journey')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Get Started' })).toBeInTheDocument();
  });

  it('navigates to profile selection when the CTA is clicked', async () => {
    const user = userEvent.setup();
    render(<App />);

    await act(async () => {
      await user.click(screen.getByRole('button', { name: 'Get Started' }));
    });

    // The app now goes to profile selection and shows loading state
    expect(screen.getByText('Loading your profiles...')).toBeInTheDocument();
  });
});
