import { describe, it, expect } from 'vitest';
import { render, screen, act } from '@/test-utils';
import userEvent from '@testing-library/user-event';
import MusicianForm from './MusicianForm';

describe('MusicianForm', () => {
  it('renders the first step initially', () => {
    render(<MusicianForm />);
    expect(screen.getByText("What's your primary instrument?")).toBeInTheDocument();
  });

  it('progresses through the form', async () => {
    const user = userEvent.setup();
    render(<MusicianForm />);

    // Step 1: Instrument
    await user.click(screen.getByText('Guitar'));
    
    // Wait for state to update and check if next button is enabled
    await act(async () => {
      await user.click(screen.getByRole('button', { name: 'Next' }));
    });

    // Step 2: Performance Frequency
    expect(screen.getByText('How often do you perform live?')).toBeInTheDocument();
    await act(async () => {
      await user.click(screen.getByLabelText('Weekly'));
      await user.click(screen.getByRole('button', { name: 'Next' }));
    });

    // Step 3: Crowd Size
    expect(screen.getByText("What's your average crowd size?")).toBeInTheDocument();
    await act(async () => {
      await user.click(screen.getByLabelText('50-100 people'));
      await user.click(screen.getByRole('button', { name: 'Next' }));
    });

    // Step 4: Experience
    expect(screen.getByText('How many years have you been playing?')).toBeInTheDocument();
    const experienceInput = screen.getByLabelText('Years of experience');
    await act(async () => {
      await user.clear(experienceInput);
      await user.type(experienceInput, '5');
      await user.click(screen.getByRole('button', { name: 'Next' }));
    });

    // Step 5: Marketing Efforts
    expect(screen.getByText('What marketing efforts are you currently using?')).toBeInTheDocument();
    await act(async () => {
      await user.click(screen.getByLabelText('Social Media (Facebook, Instagram, TikTok)'));
    });
    
    // Final button should be "Get My Advice"
    expect(screen.getByRole('button', { name: 'Get My Advice' })).toBeInTheDocument();
  });

  it('can go back to previous steps', async () => {
    const user = userEvent.setup();
    render(<MusicianForm />);

    // Go to step 2
    await user.click(screen.getByText('Guitar'));
    await act(async () => {
      await user.click(screen.getByRole('button', { name: 'Next' }));
    });

    // Go back to step 1
    await act(async () => {
      await user.click(screen.getByRole('button', { name: 'Back' }));
    });
    expect(screen.getByText("What's your primary instrument?")).toBeInTheDocument();
  });
});
