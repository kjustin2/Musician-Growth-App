import React, { memo } from 'react';
import { INSTRUMENTS } from '@/core/constants';

interface InstrumentStepProps {
  instrument: string;
  customInstrument: {
    isOther: boolean;
    value: string;
  };
  onInstrumentChange: (instrument: string) => void;
  onCustomInstrumentChange: (value: string) => void;
}

const InstrumentStep: React.FC<InstrumentStepProps> = memo(({ 
  instrument, 
  customInstrument, 
  onInstrumentChange, 
  onCustomInstrumentChange 
}) => {
  return (
    <div className="form-step">
      <h2>What's your primary instrument?</h2>
      <div className="instrument-grid">
        {INSTRUMENTS.map(inst => (
          <button
            key={inst}
            className={`instrument-option ${instrument === inst ? 'selected' : ''}`}
            onClick={() => onInstrumentChange(inst)}
            type="button"
            aria-pressed={instrument === inst}
          >
            {inst}
          </button>
        ))}
      </div>
      {customInstrument.isOther && (
        <input
          type="text"
          className="other-instrument-input"
          placeholder="Please specify your instrument"
          value={customInstrument.value}
          onChange={(e) => onCustomInstrumentChange(e.target.value)}
          aria-label="Custom instrument name"
          autoFocus
        />
      )}
    </div>
  );
});

export default InstrumentStep;
