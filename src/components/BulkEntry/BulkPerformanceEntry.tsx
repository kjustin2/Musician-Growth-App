import React, { useState } from 'react';
import { MusicianProfile, PerformanceRecord } from '../../core/types';
import { useApp } from '../../context/AppContext';
import { storageService } from '../../services/storageService';
import { generateId } from '../../utils';

interface BulkPerformanceEntryProps {
  profile: MusicianProfile;
}

interface PerformanceTemplate {
  venueName: string;
  venueType: PerformanceRecord['venueType'];
  audienceSize: string;
  duration: string;
  payment: string;
  notes: string;
}

interface BulkPerformanceEntry {
  id: string;
  date: string;
  venueName: string;
  venueType: PerformanceRecord['venueType'];
  audienceSize: string;
  duration: string;
  payment: string;
  notes: string;
  isValid: boolean;
  errors: string[];
}

const BulkPerformanceEntry: React.FC<BulkPerformanceEntryProps> = ({ profile }) => {
  const { dispatch } = useApp();
  const [loading, setLoading] = useState(false);
  const [entries, setEntries] = useState<BulkPerformanceEntry[]>([createEmptyEntry()]);
  const [template, setTemplate] = useState<PerformanceTemplate>({
    venueName: '',
    venueType: 'bar',
    audienceSize: '',
    duration: '',
    payment: '',
    notes: ''
  });

  function createEmptyEntry(): BulkPerformanceEntry {
    return {
      id: generateId(),
      date: new Date().toISOString().split('T')[0] as string,
      venueName: '',
      venueType: 'bar',
      audienceSize: '',
      duration: '',
      payment: '',
      notes: '',
      isValid: false,
      errors: []
    };
  }

  const validateEntry = (entry: BulkPerformanceEntry): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!entry.venueName.trim()) {
      errors.push('Venue name is required');
    }

    if (!entry.audienceSize || parseInt(entry.audienceSize) < 0) {
      errors.push('Valid audience size is required');
    }

    if (!entry.duration || parseInt(entry.duration) <= 0) {
      errors.push('Valid duration is required');
    }

    if (!entry.payment || parseFloat(entry.payment) < 0) {
      errors.push('Valid payment amount is required');
    }

    const performanceDate = new Date(entry.date);
    if (performanceDate > new Date()) {
      errors.push('Performance date cannot be in the future');
    }

    return { isValid: errors.length === 0, errors };
  };

  const updateEntry = (id: string, field: keyof BulkPerformanceEntry, value: string) => {
    setEntries(prev => prev.map(entry => {
      if (entry.id === id) {
        const updatedEntry = { ...entry, [field]: value };
        const validation = validateEntry(updatedEntry);
        return {
          ...updatedEntry,
          isValid: validation.isValid,
          errors: validation.errors
        };
      }
      return entry;
    }));
  };

  const addEntry = () => {
    const newEntry = createEmptyEntry();
    setEntries(prev => [...prev, newEntry]);
  };

  const removeEntry = (id: string) => {
    if (entries.length > 1) {
      setEntries(prev => prev.filter(entry => entry.id !== id));
    }
  };

  const duplicateEntry = (id: string) => {
    const entryToDuplicate = entries.find(entry => entry.id === id);
    if (entryToDuplicate) {
      const newEntry = {
        ...entryToDuplicate,
        id: generateId(),
        date: new Date().toISOString().split('T')[0]
      } as BulkPerformanceEntry;
      setEntries(prev => [...prev, newEntry]);
    }
  };

  const applyTemplate = () => {
    setEntries(prev => prev.map(entry => {
      const updatedEntry = {
        ...entry,
        ...template
      };
      const validation = validateEntry(updatedEntry);
      return {
        ...updatedEntry,
        isValid: validation.isValid,
        errors: validation.errors
      };
    }));
  };

  const clearAll = () => {
    setEntries([createEmptyEntry()]);
  };

  const handleSubmit = async () => {
    const validEntries = entries.filter(entry => entry.isValid);
    
    if (validEntries.length === 0) {
      alert('Please add at least one valid performance entry');
      return;
    }

    setLoading(true);

    try {
      const performances: PerformanceRecord[] = validEntries.map(entry => ({
        id: generateId(),
        date: new Date(entry.date),
        venueName: entry.venueName.trim(),
        venueType: entry.venueType,
        audienceSize: parseInt(entry.audienceSize),
        duration: parseInt(entry.duration),
        payment: parseFloat(entry.payment),
        notes: entry.notes?.trim() || undefined
      }));

      // Save to storage
      await storageService.bulkAddActivities(profile.id, performances);

      // Update context
      performances.forEach(performance => {
        dispatch({ type: 'ADD_PERFORMANCE', payload: performance });
      });

      // Show success message
      alert(`Successfully added ${performances.length} performance(s)!`);

      // Clear form
      setEntries([createEmptyEntry()]);
    } catch (error) {
      console.error('Error adding performances:', error);
      alert('Failed to add performances. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const validEntriesCount = entries.filter(entry => entry.isValid).length;

  return (
    <div className="bulk-performance-entry">
      <div className="bulk-header">
        <h2>Bulk Add Performances</h2>
        <p>Add multiple performances quickly. Use the template to set common values.</p>
      </div>

      <div className="bulk-template">
        <h3>Template (Optional)</h3>
        <p>Set common values that can be applied to all entries</p>
        
        <div className="template-form">
          <div className="template-row">
            <div className="form-group">
              <label>Venue Name</label>
              <input
                type="text"
                value={template.venueName}
                onChange={(e) => setTemplate(prev => ({ ...prev, venueName: e.target.value }))}
                placeholder="e.g., Blue Note Cafe"
              />
            </div>
            
            <div className="form-group">
              <label>Venue Type</label>
              <select
                value={template.venueType}
                onChange={(e) => setTemplate(prev => ({ ...prev, venueType: e.target.value as PerformanceRecord['venueType'] }))}
              >
                <option value="bar">Bar</option>
                <option value="restaurant">Restaurant</option>
                <option value="concert_hall">Concert Hall</option>
                <option value="festival">Festival</option>
                <option value="private_event">Private Event</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="template-row">
            <div className="form-group">
              <label>Audience Size</label>
              <input
                type="number"
                value={template.audienceSize}
                onChange={(e) => setTemplate(prev => ({ ...prev, audienceSize: e.target.value }))}
                placeholder="50"
                min="0"
              />
            </div>
            
            <div className="form-group">
              <label>Duration (minutes)</label>
              <input
                type="number"
                value={template.duration}
                onChange={(e) => setTemplate(prev => ({ ...prev, duration: e.target.value }))}
                placeholder="90"
                min="1"
              />
            </div>
            
            <div className="form-group">
              <label>Payment ($)</label>
              <input
                type="number"
                value={template.payment}
                onChange={(e) => setTemplate(prev => ({ ...prev, payment: e.target.value }))}
                placeholder="150.00"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div className="template-actions">
            <button 
              type="button"
              className="btn btn-outline-primary"
              onClick={applyTemplate}
            >
              Apply Template to All
            </button>
          </div>
        </div>
      </div>

      <div className="bulk-entries">
        <div className="entries-header">
          <h3>Performances ({validEntriesCount} valid out of {entries.length})</h3>
          <div className="entries-actions">
            <button 
              type="button"
              className="btn btn-outline-secondary"
              onClick={addEntry}
            >
              Add Entry
            </button>
            <button 
              type="button"
              className="btn btn-outline-danger"
              onClick={clearAll}
            >
              Clear All
            </button>
          </div>
        </div>

        <div className="entries-list">
          {entries.map((entry, index) => (
            <div key={entry.id} className={`entry-item ${entry.isValid ? 'valid' : 'invalid'}`}>
              <div className="entry-header">
                <span className="entry-number">#{index + 1}</span>
                <div className="entry-actions">
                  <button 
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => duplicateEntry(entry.id)}
                  >
                    Duplicate
                  </button>
                  <button 
                    type="button"
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => removeEntry(entry.id)}
                    disabled={entries.length === 1}
                  >
                    Remove
                  </button>
                </div>
              </div>

              <div className="entry-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Date *</label>
                    <input
                      type="date"
                      value={entry.date}
                      onChange={(e) => updateEntry(entry.id, 'date', e.target.value)}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Venue Name *</label>
                    <input
                      type="text"
                      value={entry.venueName}
                      onChange={(e) => updateEntry(entry.id, 'venueName', e.target.value)}
                      placeholder="e.g., Blue Note Cafe"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Venue Type</label>
                    <select
                      value={entry.venueType}
                      onChange={(e) => updateEntry(entry.id, 'venueType', e.target.value)}
                    >
                      <option value="bar">Bar</option>
                      <option value="restaurant">Restaurant</option>
                      <option value="concert_hall">Concert Hall</option>
                      <option value="festival">Festival</option>
                      <option value="private_event">Private Event</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Audience Size *</label>
                    <input
                      type="number"
                      value={entry.audienceSize}
                      onChange={(e) => updateEntry(entry.id, 'audienceSize', e.target.value)}
                      placeholder="50"
                      min="0"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Duration (min) *</label>
                    <input
                      type="number"
                      value={entry.duration}
                      onChange={(e) => updateEntry(entry.id, 'duration', e.target.value)}
                      placeholder="90"
                      min="1"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Payment ($) *</label>
                    <input
                      type="number"
                      value={entry.payment}
                      onChange={(e) => updateEntry(entry.id, 'payment', e.target.value)}
                      placeholder="150.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Notes</label>
                  <input
                    type="text"
                    value={entry.notes}
                    onChange={(e) => updateEntry(entry.id, 'notes', e.target.value)}
                    placeholder="Any notes about this performance"
                  />
                </div>

                {entry.errors.length > 0 && (
                  <div className="entry-errors">
                    {entry.errors.map((error, errorIndex) => (
                      <span key={errorIndex} className="error-text">{error}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bulk-actions">
        <div className="bulk-summary">
          <p>
            <strong>{validEntriesCount}</strong> valid entries out of <strong>{entries.length}</strong> total
          </p>
        </div>
        
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={loading || validEntriesCount === 0}
        >
          {loading ? 'Adding Performances...' : `Add ${validEntriesCount} Performance(s)`}
        </button>
      </div>
    </div>
  );
};

export default BulkPerformanceEntry;