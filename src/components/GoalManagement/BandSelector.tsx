import React from 'react';
import { Band } from '../../core/types';

interface BandSelectorProps {
  bands: Band[];
  selectedBands: string[];
  onBandSelect: (bandIds: string[]) => void;
  allowMultiple?: boolean;
  required?: boolean;
  label?: string;
}

const BandSelector: React.FC<BandSelectorProps> = ({
  bands,
  selectedBands,
  onBandSelect,
  allowMultiple = true,
  required = false,
  label = "Select Band(s)"
}) => {
  const handleBandToggle = (bandId: string) => {
    if (allowMultiple) {
      const newSelection = selectedBands.includes(bandId)
        ? selectedBands.filter(id => id !== bandId)
        : [...selectedBands, bandId];
      onBandSelect(newSelection);
    } else {
      onBandSelect(selectedBands.includes(bandId) ? [] : [bandId]);
    }
  };

  const handleSelectAll = () => {
    if (allowMultiple) {
      onBandSelect(bands.filter(b => b.isActive).map(b => b.id));
    }
  };

  const handleClearAll = () => {
    onBandSelect([]);
  };

  if (bands.length === 0) {
    return (
      <div className="band-selector">
        <label className="form-label">{label}</label>
        <div className="no-bands-message">
          <p className="text-muted">
            <i className="fas fa-users me-2"></i>
            No bands configured yet. You can create bands later to track band-specific goals.
          </p>
        </div>
      </div>
    );
  }

  const activeBands = bands.filter(band => band.isActive);

  return (
    <div className="band-selector">
      <div className="band-selector-header">
        <label className="form-label">
          {label}
          {required && <span className="text-danger ms-1">*</span>}
        </label>
        {allowMultiple && activeBands.length > 1 && (
          <div className="band-selector-actions">
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary me-2"
              onClick={handleSelectAll}
            >
              Select All
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              onClick={handleClearAll}
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      <div className="band-options">
        {activeBands.map((band) => (
          <div
            key={band.id}
            className={`band-option ${selectedBands.includes(band.id) ? 'selected' : ''}`}
            onClick={() => handleBandToggle(band.id)}
            role="button"
            tabIndex={0}
            aria-label={`${selectedBands.includes(band.id) ? 'Deselect' : 'Select'} ${band.name} (${band.genre})`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleBandToggle(band.id);
              }
            }}
          >
            <div className="band-option-content">
              <div className="band-checkbox">
                <input
                  type={allowMultiple ? 'checkbox' : 'radio'}
                  checked={selectedBands.includes(band.id)}
                  onChange={() => handleBandToggle(band.id)}
                  onClick={(e) => e.stopPropagation()}
                  aria-describedby={`band-${band.id}-details`}
                />
              </div>
              <div className="band-info">
                <div className="band-name">{band.name}</div>
                <div className="band-details" id={`band-${band.id}-details`}>
                  <span className="band-genre">{band.genre}</span>
                  <span className="band-role">Role: {band.memberRole}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedBands.length > 0 && (
        <div className="band-selection-summary">
          <small className="text-muted">
            {selectedBands.length === 1 
              ? `1 band selected`
              : `${selectedBands.length} bands selected`
            }
            {allowMultiple && selectedBands.length === activeBands.length && (
              <span> (all bands)</span>
            )}
          </small>
        </div>
      )}

      <div className="band-selector-help">
        <small className="text-muted">
          {allowMultiple 
            ? "Select one or more bands to track band-specific progress, or leave empty for overall progress."
            : "Select a band for this activity, or leave empty if not band-specific."
          }
        </small>
      </div>
    </div>
  );
};

export default BandSelector;