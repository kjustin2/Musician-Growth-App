import React from 'react';

interface NameStepProps {
  name: string;
  onNameChange: (name: string) => void;
}

const NameStep: React.FC<NameStepProps> = ({ name, onNameChange }) => {
  return (
    <div className="form-step">
      <div className="step-header">
        <h2>What's your name?</h2>
        <p className="step-description">
          Let's personalize your experience! We'll use your name to make the app feel more welcoming.
        </p>
      </div>
      
      <div className="step-content">
        <div className="form-group">
          <label htmlFor="musician-name" className="form-label">
            Your Name
          </label>
          <input
            id="musician-name"
            type="text"
            className="form-control form-control-lg"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Enter your name"
            autoFocus
            maxLength={50}
          />
          <div className="form-text">
            This will be used in your dashboard and welcome messages.
          </div>
        </div>
      </div>
    </div>
  );
};

export default NameStep;