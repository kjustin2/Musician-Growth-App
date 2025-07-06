import { describe, it, expect } from 'vitest';
import { render, screen, act } from '@/test-utils';
import userEvent from '@testing-library/user-event';
import App from '@/App';

describe('LandingPage', () => {
  it('renders the main heading and CTA', () => {
    render(<App />);
    expect(screen.getByText('Find Your Next Step as a Musician')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Get Started' })).toBeInTheDocument();
  });

  it('navigates to the form when the CTA is clicked', async () => {
    const user = userEvent.setup();
    render(<App />);

    await act(async () => {
      await user.click(screen.getByRole('button', { name: 'Get Started' }));
    });

    expect(screen.getByText("What's your primary instrument?")).toBeInTheDocument();
  });
});
