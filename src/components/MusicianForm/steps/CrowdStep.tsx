import React, { memo } from 'react';
import { MusicianProfile } from '@/core/types';

interface CrowdStepProps {
  crowdSize: MusicianProfile['crowdSize'] | undefined;
  onCrowdSizeChange: (value: MusicianProfile['crowdSize']) => void;
}

const CrowdStep: React.FC<CrowdStepProps> = memo(({ crowdSize, onCrowdSizeChange }) => {
  return (
    <div className="form-step">
      <h2>What's your average crowd size?</h2>
      <div className="radio-group" role="radiogroup" aria-labelledby="crowd-size-title">
        <label className="radio-option">
          <input
            type="radio"
            name="crowd"
            value="1-10"
            checked={crowdSize === '1-10'}
            onChange={(e) => onCrowdSizeChange(e.target.value as MusicianProfile['crowdSize'])}
          />
          <span>1-10 people</span>
        </label>
        <label className="radio-option">
          <input
            type="radio"
            name="crowd"
            value="10-50"
            checked={crowdSize === '10-50'}
            onChange={(e) => onCrowdSizeChange(e.target.value as MusicianProfile['crowdSize'])}
          />
          <span>10-50 people</span>
        </label>
        <label className="radio-option">
          <input
            type="radio"
            name="crowd"
            value="50-100"
            checked={crowdSize === '50-100'}
            onChange={(e) => onCrowdSizeChange(e.target.value as MusicianProfile['crowdSize'])}
          />
          <span>50-100 people</span>
        </label>
        <label className="radio-option">
          <input
            type="radio"
            name="crowd"
            value="100-500"
            checked={crowdSize === '100-500'}
            onChange={(e) => onCrowdSizeChange(e.target.value as MusicianProfile['crowdSize'])}
          />
          <span>100-500 people</span>
        </label>
        <label className="radio-option">
          <input
            type="radio"
            name="crowd"
            value="500+"
            checked={crowdSize === '500+'}
            onChange={(e) => onCrowdSizeChange(e.target.value as MusicianProfile['crowdSize'])}
          />
          <span>500+ people</span>
        </label>
      </div>
    </div>
  );
});

export default CrowdStep;
