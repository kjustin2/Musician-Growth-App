import React, { memo } from 'react';
import { MusicianProfile } from '@/core/types';

interface PerformanceStepProps {
  performanceFrequency: MusicianProfile['performanceFrequency'] | undefined;
  onPerformanceFrequencyChange: (value: MusicianProfile['performanceFrequency']) => void;
}

const PerformanceStep: React.FC<PerformanceStepProps> = memo(({ performanceFrequency, onPerformanceFrequencyChange }) => {
  return (
    <div className="form-step">
      <h2>How often do you perform live?</h2>
      <div className="radio-group" role="radiogroup" aria-labelledby="performance-frequency-title">
        <label className="radio-option">
          <input
            type="radio"
            name="frequency"
            value="never"
            checked={performanceFrequency === 'never'}
            onChange={(e) => onPerformanceFrequencyChange(e.target.value as MusicianProfile['performanceFrequency'])}
          />
          <span>Never / Just Practice</span>
        </label>
        <label className="radio-option">
          <input
            type="radio"
            name="frequency"
            value="yearly"
            checked={performanceFrequency === 'yearly'}
            onChange={(e) => onPerformanceFrequencyChange(e.target.value as MusicianProfile['performanceFrequency'])}
          />
          <span>A few times a year</span>
        </label>
        <label className="radio-option">
          <input
            type="radio"
            name="frequency"
            value="monthly"
            checked={performanceFrequency === 'monthly'}
            onChange={(e) => onPerformanceFrequencyChange(e.target.value as MusicianProfile['performanceFrequency'])}
          />
          <span>Monthly</span>
        </label>
        <label className="radio-option">
          <input
            type="radio"
            name="frequency"
            value="weekly"
            checked={performanceFrequency === 'weekly'}
            onChange={(e) => onPerformanceFrequencyChange(e.target.value as MusicianProfile['performanceFrequency'])}
          />
          <span>Weekly</span>
        </label>
        <label className="radio-option">
          <input
            type="radio"
            name="frequency"
            value="multiple"
            checked={performanceFrequency === 'multiple'}
            onChange={(e) => onPerformanceFrequencyChange(e.target.value as MusicianProfile['performanceFrequency'])}
          />
          <span>Multiple times a week</span>
        </label>
      </div>
    </div>
  );
});

export default PerformanceStep;
