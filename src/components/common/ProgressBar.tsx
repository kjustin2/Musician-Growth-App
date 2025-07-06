import React from 'react';
import './ProgressBar.css';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  labels?: string[];
}

const ProgressBar: React.FC<ProgressBarProps> = ({ 
  currentStep, 
  totalSteps,
  labels 
}) => {
  const percentage = (currentStep / totalSteps) * 100;

  return (
    <div className="progress-bar-container">
      <div className="progress-bar">
        <div 
          className="progress-bar-fill"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="progress-steps">
        <span className="progress-text">
          Step {currentStep} of {totalSteps}
          {labels && labels[currentStep - 1] && `: ${labels[currentStep - 1]}`}
        </span>
      </div>
    </div>
  );
};

export default ProgressBar;