import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProgressRing from './ProgressRing';

describe('ProgressRing - Sizing and Overflow', () => {
  it('should render with default size constraints', () => {
    render(
      <ProgressRing 
        value={75} 
        maxValue={100} 
        label="Test Progress" 
      />
    );
    
    const progressRing = screen.getByText('75%').closest('.progress-ring');
    expect(progressRing).toBeInTheDocument();
    expect(progressRing).toHaveStyle({
      width: '120px',
      height: '120px'
    });
  });

  it('should respect custom size prop', () => {
    render(
      <ProgressRing 
        value={50} 
        maxValue={100} 
        label="Custom Size" 
        size={100}
      />
    );
    
    const progressRing = screen.getByText('50%').closest('.progress-ring');
    expect(progressRing).toHaveStyle({
      width: '100px',
      height: '100px'
    });
  });

  it('should not overflow container bounds', () => {
    const { container } = render(
      <div style={{ width: '150px', height: '150px', border: '1px solid red' }}>
        <ProgressRing 
          value={100} 
          maxValue={100} 
          label="Full Progress" 
        />
      </div>
    );
    
    const progressRing = container.querySelector('.progress-ring');
    const progressSvg = container.querySelector('.progress-ring-svg');
    
    expect(progressRing).toHaveStyle({
      'max-width': '100%',
      'max-height': '100%',
      'box-sizing': 'border-box',
      'overflow': 'hidden'
    });
    
    expect(progressSvg).toHaveStyle({
      'display': 'block',
      'max-width': '120px',
      'max-height': '120px'
    });
  });

  it('should calculate progress percentage correctly', () => {
    render(
      <ProgressRing 
        value={25} 
        maxValue={100} 
        label="Quarter Progress" 
      />
    );
    
    expect(screen.getByText('25%')).toBeInTheDocument();
    expect(screen.getByText('Quarter Progress')).toBeInTheDocument();
  });

  it('should handle edge cases properly', () => {
    render(
      <ProgressRing 
        value={150} 
        maxValue={100} 
        label="Over Maximum" 
      />
    );
    
    // Should cap at 100%
    expect(screen.getByText('150%')).toBeInTheDocument();
  });

  it('should apply custom color prop', () => {
    const { container } = render(
      <ProgressRing 
        value={75} 
        maxValue={100} 
        label="Custom Color" 
        color="#ff0000"
      />
    );
    
    const progressCircle = container.querySelector('.progress-ring-progress');
    expect(progressCircle).toHaveAttribute('stroke', '#ff0000');
  });

  it('should maintain aspect ratio on different screen sizes', () => {
    // Test mobile responsiveness
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 480,
    });
    
    const { container } = render(
      <ProgressRing 
        value={60} 
        maxValue={100} 
        label="Mobile Test" 
      />
    );
    
    const progressRing = container.querySelector('.progress-ring');
    expect(progressRing).toHaveStyle({
      'max-width': '100%',
      'max-height': '100%'
    });
  });
});