import React, { useState } from 'react';
import { MusicianProfile, PracticeSession } from '../../core/types';
import { useApp } from '../../context/AppContext';
import { storageService } from '../../services/storageService';
import { generateId } from '../../utils';

interface BulkPracticeEntryProps {
  profile: MusicianProfile;
}

interface PracticeTemplate {
  duration: string;
  focusAreas: string[];
  skillsWorkedOn: string[];
  notes: string;
}

interface BulkPracticeEntry {
  id: string;
  date: string;
  duration: string;
  focusAreas: string[];
  skillsWorkedOn: string[];
  notes: string;
  isValid: boolean;
  errors: string[];
}

const BulkPracticeEntry: React.FC<BulkPracticeEntryProps> = ({ profile }) => {
  const { dispatch } = useApp();
  const [loading, setLoading] = useState(false);
  const [entries, setEntries] = useState<BulkPracticeEntry[]>([createEmptyEntry()]);
  const [template, setTemplate] = useState<PracticeTemplate>({
    duration: '',
    focusAreas: [],
    skillsWorkedOn: [],
    notes: ''
  });

  const predefinedFocusAreas = [
    'Scales', 'Chords', 'Rhythm', 'Improvisation', 'Technique',
    'Sight Reading', 'Ear Training', 'Song Learning', 'Performance Preparation'
  ];

  const predefinedSkills = [
    'Fingering', 'Timing', 'Dynamics', 'Articulation', 'Intonation',
    'Expression', 'Stage Presence', 'Equipment Setup', 'Music Theory'
  ];

  function createEmptyEntry(): BulkPracticeEntry {
    return {
      id: generateId(),
      date: new Date().toISOString().split('T')[0] as string,
      duration: '',
      focusAreas: [],
      skillsWorkedOn: [],
      notes: '',
      isValid: false,
      errors: []
    };
  }

  const validateEntry = (entry: BulkPracticeEntry): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!entry.duration || parseInt(entry.duration) <= 0) {
      errors.push('Valid duration is required');
    }

    if (entry.focusAreas.length === 0) {
      errors.push('At least one focus area is required');
    }

    const practiceDate = new Date(entry.date);
    if (practiceDate > new Date()) {
      errors.push('Practice date cannot be in the future');
    }

    return { isValid: errors.length === 0, errors };
  };

  const updateEntry = (id: string, field: keyof BulkPracticeEntry, value: any) => {
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

  const toggleFocusArea = (entryId: string, area: string) => {
    setEntries(prev => prev.map(entry => {
      if (entry.id === entryId) {
        const newFocusAreas = entry.focusAreas.includes(area)
          ? entry.focusAreas.filter(a => a !== area)
          : [...entry.focusAreas, area];
        
        const updatedEntry = { ...entry, focusAreas: newFocusAreas };
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

  const toggleSkill = (entryId: string, skill: string) => {
    setEntries(prev => prev.map(entry => {
      if (entry.id === entryId) {
        const newSkills = entry.skillsWorkedOn.includes(skill)
          ? entry.skillsWorkedOn.filter(s => s !== skill)
          : [...entry.skillsWorkedOn, skill];
        
        return { ...entry, skillsWorkedOn: newSkills };
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
        date: new Date().toISOString().split('T')[0] as string
      };
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
      alert('Please add at least one valid practice session');
      return;
    }

    setLoading(true);

    try {
      const practiceSessions: PracticeSession[] = validEntries.map(entry => ({
        id: generateId(),
        date: new Date(entry.date),
        duration: parseInt(entry.duration),
        focusAreas: entry.focusAreas,
        skillsWorkedOn: entry.skillsWorkedOn,
        notes: entry.notes.trim() || undefined
      }));

      // Save to storage
      await storageService.bulkAddActivities(profile.id, practiceSessions);

      // Update context
      practiceSessions.forEach(session => {
        dispatch({ type: 'ADD_PRACTICE_SESSION', payload: session });
      });

      // Show success message
      alert(`Successfully added ${practiceSessions.length} practice session(s)!`);

      // Clear form
      setEntries([createEmptyEntry()]);
    } catch (error) {
      console.error('Error adding practice sessions:', error);
      alert('Failed to add practice sessions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const validEntriesCount = entries.filter(entry => entry.isValid).length;

  return (
    <div className="bulk-practice-entry">
      <div className="bulk-header">
        <h2>Bulk Add Practice Sessions</h2>
        <p>Add multiple practice sessions quickly. Use the template to set common values.</p>
      </div>

      <div className="bulk-template">
        <h3>Template (Optional)</h3>
        <p>Set common values that can be applied to all entries</p>
        
        <div className="template-form">
          <div className="template-row">
            <div className="form-group">
              <label>Duration (minutes)</label>
              <input
                type="number"
                value={template.duration}
                onChange={(e) => setTemplate(prev => ({ ...prev, duration: e.target.value }))}
                placeholder="60"
                min="1"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Focus Areas</label>
            <div className="checkbox-grid">
              {predefinedFocusAreas.map(area => (
                <label key={area} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={template.focusAreas.includes(area)}
                    onChange={(e) => {
                      const newFocusAreas = e.target.checked
                        ? [...template.focusAreas, area]
                        : template.focusAreas.filter(a => a !== area);
                      setTemplate(prev => ({ ...prev, focusAreas: newFocusAreas }));
                    }}
                  />
                  {area}
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Skills Worked On</label>
            <div className="checkbox-grid">
              {predefinedSkills.map(skill => (
                <label key={skill} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={template.skillsWorkedOn.includes(skill)}
                    onChange={(e) => {
                      const newSkills = e.target.checked
                        ? [...template.skillsWorkedOn, skill]
                        : template.skillsWorkedOn.filter(s => s !== skill);
                      setTemplate(prev => ({ ...prev, skillsWorkedOn: newSkills }));
                    }}
                  />
                  {skill}
                </label>
              ))}
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
          <h3>Practice Sessions ({validEntriesCount} valid out of {entries.length})</h3>
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
                    <label>Duration (minutes) *</label>
                    <input
                      type="number"
                      value={entry.duration}
                      onChange={(e) => updateEntry(entry.id, 'duration', e.target.value)}
                      placeholder="60"
                      min="1"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Focus Areas * (select at least one)</label>
                  <div className="checkbox-grid-compact">
                    {predefinedFocusAreas.map(area => (
                      <label key={area} className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={entry.focusAreas.includes(area)}
                          onChange={() => toggleFocusArea(entry.id, area)}
                        />
                        {area}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label>Skills Worked On (optional)</label>
                  <div className="checkbox-grid-compact">
                    {predefinedSkills.map(skill => (
                      <label key={skill} className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={entry.skillsWorkedOn.includes(skill)}
                          onChange={() => toggleSkill(entry.id, skill)}
                        />
                        {skill}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label>Notes</label>
                  <input
                    type="text"
                    value={entry.notes}
                    onChange={(e) => updateEntry(entry.id, 'notes', e.target.value)}
                    placeholder="Any notes about this practice session"
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
          {loading ? 'Adding Sessions...' : `Add ${validEntriesCount} Session(s)`}
        </button>
      </div>
    </div>
  );
};

export default BulkPracticeEntry;