import React, { useState } from 'react';
import { MusicianProfile, RecordingSession, RecordedSong } from '../../core/types';
import { useApp } from '../../context/AppContext';
import { recordingService } from '../../services/recordingService';
import { goalLinkingService } from '../../services/goalLinkingService';
import { generateId } from '../../utils';

interface BulkRecordingEntryProps {
  profile: MusicianProfile;
}

interface RecordingTemplate {
  location: string;
  cost: string;
  notes: string;
}

interface BulkRecordingEntry {
  id: string;
  date: string;
  location: string;
  cost: string;
  notes: string;
  songs: string; // Comma-separated song titles
  isValid: boolean;
  errors: string[];
}

const BulkRecordingEntry: React.FC<BulkRecordingEntryProps> = ({ profile }) => {
  const { dispatch } = useApp();
  const [loading, setLoading] = useState(false);
  const [entries, setEntries] = useState<BulkRecordingEntry[]>([createEmptyEntry()]);
  const [template, setTemplate] = useState<RecordingTemplate>({
    location: '',
    cost: '',
    notes: ''
  });

  function createEmptyEntry(): BulkRecordingEntry {
    return {
      id: generateId(),
      date: new Date().toISOString().split('T')[0],
      location: '',
      cost: '',
      notes: '',
      songs: '',
      isValid: false,
      errors: []
    };
  }

  const validateEntry = (entry: BulkRecordingEntry): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!entry.location.trim()) {
      errors.push('Recording location is required');
    }

    if (!entry.cost || parseFloat(entry.cost) < 0) {
      errors.push('Valid cost is required (0 or greater)');
    }

    if (!entry.songs.trim()) {
      errors.push('At least one song is required');
    }

    const recordingDate = new Date(entry.date);
    if (recordingDate > new Date()) {
      errors.push('Recording date cannot be in the future');
    }

    return { isValid: errors.length === 0, errors };
  };

  const updateEntry = (id: string, field: keyof BulkRecordingEntry, value: string) => {
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
      } as BulkRecordingEntry;
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

  const parseSongs = (songsString: string, recordingSessionId: string): RecordedSong[] => {
    return songsString
      .split(',')
      .map(title => title.trim())
      .filter(title => title.length > 0)
      .map(title => ({
        id: generateId(),
        title,
        plays: 0,
        revenue: 0,
        distributionPlatforms: [],
        recordingSessionId
      }));
  };

  const handleSubmit = async () => {
    const validEntries = entries.filter(entry => entry.isValid);
    
    if (validEntries.length === 0) {
      alert('Please add at least one valid recording entry');
      return;
    }

    setLoading(true);

    try {
      const recordings: RecordingSession[] = validEntries.map(entry => {
        const recordingId = generateId();
        const songs = parseSongs(entry.songs, recordingId);
        
        return {
          id: recordingId,
          date: new Date(entry.date + 'T12:00:00'),
          location: entry.location.trim(),
          cost: parseFloat(entry.cost),
          songs,
          notes: entry.notes.trim() || undefined,
          totalPlays: 0,
          totalRevenue: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        };
      });

      // Save to storage using bulk method
      await recordingService.bulkAddRecordings(profile.id, recordings);

      // Update linked goals for each recording
      for (const recording of recordings) {
        try {
          await goalLinkingService.updateGoalsForAction(profile.id, 'recording', recording);
        } catch (error) {
          console.warn('Failed to update goals for recording:', recording.id, error);
        }
      }

      // Update all linked goals to ensure consistency
      try {
        await goalLinkingService.updateAllLinkedGoals(profile.id);
      } catch (error) {
        console.warn('Failed to update all linked goals:', error);
      }

      // Update context
      recordings.forEach(recording => {
        dispatch({ type: 'ADD_RECORDING', payload: recording });
      });

      // Show success message
      const totalSongs = recordings.reduce((sum, rec) => sum + rec.songs.length, 0);
      alert(`Successfully added ${recordings.length} recording session(s) with ${totalSongs} song(s)!`);

      // Clear form
      setEntries([createEmptyEntry()]);
    } catch (error) {
      console.error('Error adding recordings:', error);
      alert('Failed to add recordings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const validEntriesCount = entries.filter(entry => entry.isValid).length;
  const totalSongsCount = entries
    .filter(entry => entry.isValid)
    .reduce((sum, entry) => sum + entry.songs.split(',').filter(s => s.trim()).length, 0);

  return (
    <div className="bulk-recording-entry">
      <div className="bulk-header">
        <h2>Bulk Add Recording Sessions</h2>
        <p>Add multiple recording sessions quickly. Use the template to set common values.</p>
      </div>

      <div className="bulk-template">
        <h3>Template (Optional)</h3>
        <p>Set common values that can be applied to all entries</p>
        
        <div className="template-form">
          <div className="template-row">
            <div className="form-group">
              <label>Recording Location</label>
              <input
                type="text"
                value={template.location}
                onChange={(e) => setTemplate(prev => ({ ...prev, location: e.target.value }))}
                placeholder="e.g., Abbey Road Studios, Home Studio"
              />
            </div>
            
            <div className="form-group">
              <label>Cost ($)</label>
              <input
                type="number"
                value={template.cost}
                onChange={(e) => setTemplate(prev => ({ ...prev, cost: e.target.value }))}
                placeholder="150.00"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Session Notes</label>
            <input
              type="text"
              value={template.notes}
              onChange={(e) => setTemplate(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Common notes for recording sessions"
            />
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
          <h3>
            Recording Sessions ({validEntriesCount} valid out of {entries.length})
            {totalSongsCount > 0 && <span className="songs-count"> - {totalSongsCount} songs total</span>}
          </h3>
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
                <div className="entry-info">
                  {entry.songs && (
                    <span className="songs-preview">
                      {entry.songs.split(',').filter(s => s.trim()).length} song(s)
                    </span>
                  )}
                </div>
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
                    <label>Location *</label>
                    <input
                      type="text"
                      value={entry.location}
                      onChange={(e) => updateEntry(entry.id, 'location', e.target.value)}
                      placeholder="e.g., Abbey Road Studios"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Cost ($) *</label>
                    <input
                      type="number"
                      value={entry.cost}
                      onChange={(e) => updateEntry(entry.id, 'cost', e.target.value)}
                      placeholder="150.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Songs Recorded *</label>
                  <input
                    type="text"
                    value={entry.songs}
                    onChange={(e) => updateEntry(entry.id, 'songs', e.target.value)}
                    placeholder="Song Title 1, Song Title 2, Song Title 3"
                  />
                  <small className="form-help">
                    Enter song titles separated by commas. You can edit individual song details later.
                  </small>
                </div>

                <div className="form-group">
                  <label>Session Notes</label>
                  <input
                    type="text"
                    value={entry.notes}
                    onChange={(e) => updateEntry(entry.id, 'notes', e.target.value)}
                    placeholder="Any notes about this recording session"
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
            <strong>{validEntriesCount}</strong> valid recording sessions out of <strong>{entries.length}</strong> total
            {totalSongsCount > 0 && (
              <span> with <strong>{totalSongsCount}</strong> songs</span>
            )}
          </p>
          <small className="text-muted">
            Song metrics (plays, revenue) will be set to 0 initially and can be updated later.
          </small>
        </div>
        
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={loading || validEntriesCount === 0}
        >
          {loading 
            ? 'Adding Recording Sessions...' 
            : `Add ${validEntriesCount} Recording Session(s)`
          }
        </button>
      </div>
    </div>
  );
};

export default BulkRecordingEntry;