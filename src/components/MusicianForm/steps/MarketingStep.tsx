import React from 'react';
import { MARKETING_OPTIONS } from '@/core/constants';

interface MarketingStepProps {
  marketingEfforts: string[];
  onMarketingChange: (optionId: string) => void;
}

const MarketingStep: React.FC<MarketingStepProps> = ({ marketingEfforts, onMarketingChange }) => {
  return (
    <div className="form-step">
      <h2>What marketing efforts are you currently using?</h2>
      <p className="step-subtitle">Select all that apply</p>
      <div className="checkbox-group" role="group" aria-labelledby="marketing-efforts-title">
        {MARKETING_OPTIONS.map(option => (
          <label key={option.id} className="checkbox-option">
            <input
              type="checkbox"
              checked={marketingEfforts.includes(option.id)}
              onChange={() => onMarketingChange(option.id)}
              aria-describedby={`marketing-${option.id}-desc`}
            />
            <span id={`marketing-${option.id}-desc`}>{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default MarketingStep;
