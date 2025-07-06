import React, { memo } from 'react';
import { EXPERIENCE_LIMITS } from '@/core/constants';

interface ExperienceStepProps {
  yearsOfExperience: number;
  onYearsOfExperienceChange: (value: number) => void;
}

const ExperienceStep: React.FC<ExperienceStepProps> = memo(({ yearsOfExperience, onYearsOfExperienceChange }) => {
  return (
    <div className="form-step">
      <h2>How many years have you been playing?</h2>
      <div className="experience-input">
        <input
          type="number"
          min={EXPERIENCE_LIMITS.MIN}
          max={EXPERIENCE_LIMITS.MAX}
          value={yearsOfExperience || ''}
          onChange={(e) => {
            const value = parseInt(e.target.value);
            if (!isNaN(value) && value >= EXPERIENCE_LIMITS.MIN && value <= EXPERIENCE_LIMITS.MAX) {
              onYearsOfExperienceChange(value);
            }
          }}
          className="years-input"
          aria-label="Years of experience"
        />
        <span className="years-label">years</span>
      </div>
      <input
        type="range"
        min={EXPERIENCE_LIMITS.MIN}
        max={EXPERIENCE_LIMITS.MAX}
        value={yearsOfExperience || 0}
        onChange={(e) => onYearsOfExperienceChange(parseInt(e.target.value))}
        className="years-slider"
        aria-label="Years of experience slider"
      />
    </div>
  );
});

export default ExperienceStep;
