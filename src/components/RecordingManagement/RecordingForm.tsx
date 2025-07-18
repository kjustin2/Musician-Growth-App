import React, { useState, useEffect } from 'react';
import { MusicianProfile, RecordingSession, RecordedSong, BandMember } from '../../core/types';
import { useApp } from '../../context/AppContext';
import { recordingService } from '../../services/recordingService';
import { goalLinkingService } from '../../services/goalLinkingService';
import { storageService } from '../../services/storageService';
import { generateId } from '../../utils';

interface RecordingFormProps {
  profile: MusicianProfile;
  onSubmit?: (recording: RecordingSession) => void;
  onCancel?: () => void;
  initialData?: Partial<RecordingSession>;
}

interface SongFormData {
  id: string;
  title: string;
  duration: string;
  plays: string;
  revenue: string;
  distributionPlatforms: string;
}

const RecordingForm: React.FC<RecordingFormProps> = ({ 
  profile, 
  onSubmit, 
  onCancel, 
  initialData 
}) => {
  const { dispatch } = useApp();
  const [loading, setLoading] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [bandMembers, setBandMembers] = useState<BandMember[]>([]);
  
  const [formData, setFormData] = useState({
    date: initialData?.date?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
    location: initialData?.location || '',
    cost: initialData?.cost?.toString() || '',
    notes: initialData?.notes || '',
    bandMembersPresent: initialData?.bandMembers || []
  });

  const [songs, setSongs] = useState<SongFormData[]>(
    initialData?.songs?.map(song => ({
      id: song.id,
      title: song.title,
      duration: song.duration?.toString() || '',
      plays: song.plays.toString(),
      revenue: song.revenue.toString(),
      distributionPlatforms: song.distributionPlatforms.join(', ')
    })) || [
      {
        id: generateId(),
        title: '',
        duration: '',
        plays: '0',
        revenue: '0.00',
        distributionPlatforms: ''
      }
    ]
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load location suggestions from previous recordings and band members
  useEffect(() => {
    const loadData = async () => {
      try {
        const [recordings, bandMembersData] = await Promise.all([
          recordingService.getRecordings(profile.id),
          storageService.getBandMembers(profile.id)
        ]);
        
        const uniqueLocations = [...new Set(recordings.map(r => r.location))];
        setLocationSuggestions(uniqueLocations);
        setBandMembers(bandMembersData);
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    };

    loadData();
  }, [profile.id]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.location.trim()) {
      newErrors.location = 'Recording location is required';
    }

    if (!formData.cost || parseFloat(formData.cost) < 0) {
      newErrors.cost = 'Please enter a valid cost (0 or greater)';
    }

    const recordingDate = new Date(formData.date + 'T12:00:00');
    if (recordingDate > new Date()) {
      newErrors.date = 'Recording date cannot be in the future';
    }

    // Validate songs
    const validSongs = songs.filter(song => song.title.trim());
    if (validSongs.length === 0) {
      newErrors.songs = 'At least one song is required';
    }

    // Validate individual songs
    songs.forEach((song, index) => {
      if (song.title.trim()) {
        if (song.plays && (parseInt(song.plays) < 0 || isNaN(parseInt(song.plays)))) {
          newErrors[`song_${index}_plays`] = 'Plays must be a non-negative number';
        }
        if (song.revenue && (parseFloat(song.revenue) < 0 || isNaN(parseFloat(song.revenue)))) {
          newErrors[`song_${index}_revenue`] = 'Revenue must be a non-negative number';
        }
        if (song.duration && (parseInt(song.duration) <= 0 || isNaN(parseInt(song.duration)))) {
          newErrors[`song_${index}_duration`] = 'Duration must be a positive number (seconds)';
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Filter out empty songs and convert to RecordedSong format
      const validSongs: RecordedSong[] = songs
        .filter(song => song.title.trim())
        .map(song => ({
          id: song.id,
          title: song.title.trim(),
          duration: song.duration ? parseInt(song.duration) : undefined,
          plays: parseInt(song.plays) || 0,
          revenue: parseFloat(song.revenue) || 0,
          distributionPlatforms: song.distributionPlatforms
            .split(',')
            .map(p => p.trim())
            .filter(p => p.length > 0),
          recordingSessionId: initialData?.id || generateId()
        }));

      const recording: RecordingSession = {
        id: initialData?.id || generateId(),
        date: new Date(formData.date + 'T12:00:00'),
        location: formData.location.trim(),
        cost: parseFloat(formData.cost),
        songs: validSongs,
        notes: formData.notes.trim() || undefined,
        totalPlays: validSongs.reduce((sum, song) => sum + song.plays, 0),
        totalRevenue: validSongs.reduce((sum, song) => sum + song.revenue, 0),
        createdAt: initialData?.createdAt || new Date(),
        updatedAt: new Date(),
        bandMembers: formData.bandMembersPresent.length > 0 ? formData.bandMembersPresent : undefined
      };

      // Save to storage
      await recordingService.saveRecording(profile.id, recording);

      // Update linked goals
      await goalLinkingService.updateGoalsForAction(profile.id, 'recording', recording);

      // Update context
      dispatch({ type: 'ADD_RECORDING', payload: recording });

      // Call onSubmit callback if provided
      if (onSubmit) {
        onSubmit(recording);
      } else {
        // Reset form if no callback (standalone usage)
        resetForm();
        alert('Recording session added successfully!');
      }
    } catch (error) {
      console.error('Error adding recording:', error);
      alert('Failed to add recording session. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      location: '',
      cost: '',
      notes: ''
    });
    setSongs([{
      id: generateId(),
      title: '',
      duration: '',
      plays: '0',
      revenue: '0.00',
      distributionPlatforms: ''
    }]);
    setErrors({});
  };

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSongChange = (index: number, field: keyof SongFormData, value: string) => {
    setSongs(prev => prev.map((song, i) => 
      i === index ? { ...song, [field]: value } : song
    ));
    
    // Clear related errors
    const errorKey = `song_${index}_${field}`;
    if (errors[errorKey]) {
      setErrors(prev => ({ ...prev, [errorKey]: '' }));
    }
    if (field === 'title' && errors.songs) {
      setErrors(prev => ({ ...prev, songs: '' }));
    }
  };

  const addSong = () => {
    setSongs(prev => [...prev, {
      id: generateId(),
      title: '',
      duration: '',
      plays: '0',
      revenue: '0.00',
      distributionPlatforms: ''
    }]);
  };

  const removeSong = (index: number) => {
    if (songs.length > 1) {
      setSongs(prev => prev.filter((_, i) => i !== index));
    }
  };

  const formatCurrency = (value: string): string => {
    const num = parseFloat(value);
    return isNaN(num) ? value : num.toFixed(2);
  };

  return (
    <div className="recording-form">
      <div className="entry-header">
        <h2>{initialData ? 'Edit Recording Session' : 'Add Recording Session'}</h2>
        <p>Record details about your studio session and songs</p>
      </div>

      <form onSubmit={handleSubmit} className="recording-form-content">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="date">Recording Date *</label>
            <input
              type="date"
              id="date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              className={errors.date ? 'error' : ''}
              required
            />
            {errors.date && <span className="error-text">{errors.date}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="cost">Cost ($) *</label>
            <input
              type="number"
              id="cost"
              value={formData.cost}
              onChange={(e) => handleInputChange('cost', e.target.value)}
              onBlur={(e) => handleInputChange('cost', formatCurrency(e.target.value))}
              className={errors.cost ? 'error' : ''}
              placeholder="150.00"
              min="0"
              step="0.01"
              required
            />
            {errors.cost && <span className="error-text">{errors.cost}</span>}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="location">Recording Location *</label>
          <input
            type="text"
            id="location"
            value={formData.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
            className={errors.location ? 'error' : ''}
            placeholder="e.g., Abbey Road Studios, Home Studio"
            list="location-suggestions"
            required
          />
          <datalist id="location-suggestions">
            {locationSuggestions.map((location, index) => (
              <option key={index} value={location} />
            ))}
          </datalist>
          {errors.location && <span className="error-text">{errors.location}</span>}
        </div>

        <div className="songs-section">
          <div className="songs-header">
            <h3>Songs Recorded</h3>
            <button
              type="button"
              onClick={addSong}
              className="btn btn-secondary btn-sm"
            >
              <i className="fas fa-plus"></i> Add Song
            </button>
          </div>
          
          {errors.songs && <span className="error-text">{errors.songs}</span>}

          {songs.map((song, index) => (
            <div key={song.id} className="song-item">
              <div className="song-header">
                <h4>Song {index + 1}</h4>
                {songs.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSong(index)}
                    className="btn btn-danger btn-sm"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor={`song-title-${index}`}>Song Title *</label>
                  <input
                    type="text"
                    id={`song-title-${index}`}
                    value={song.title}
                    onChange={(e) => handleSongChange(index, 'title', e.target.value)}
                    placeholder="Enter song title"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor={`song-duration-${index}`}>Duration (seconds)</label>
                  <input
                    type="number"
                    id={`song-duration-${index}`}
                    value={song.duration}
                    onChange={(e) => handleSongChange(index, 'duration', e.target.value)}
                    className={errors[`song_${index}_duration`] ? 'error' : ''}
                    placeholder="180"
                    min="1"
                  />
                  {errors[`song_${index}_duration`] && (
                    <span className="error-text">{errors[`song_${index}_duration`]}</span>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor={`song-plays-${index}`}>Plays</label>
                  <input
                    type="number"
                    id={`song-plays-${index}`}
                    value={song.plays}
                    onChange={(e) => handleSongChange(index, 'plays', e.target.value)}
                    className={errors[`song_${index}_plays`] ? 'error' : ''}
                    placeholder="0"
                    min="0"
                  />
                  {errors[`song_${index}_plays`] && (
                    <span className="error-text">{errors[`song_${index}_plays`]}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor={`song-revenue-${index}`}>Revenue ($)</label>
                  <input
                    type="number"
                    id={`song-revenue-${index}`}
                    value={song.revenue}
                    onChange={(e) => handleSongChange(index, 'revenue', e.target.value)}
                    onBlur={(e) => handleSongChange(index, 'revenue', formatCurrency(e.target.value))}
                    className={errors[`song_${index}_revenue`] ? 'error' : ''}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                  {errors[`song_${index}_revenue`] && (
                    <span className="error-text">{errors[`song_${index}_revenue`]}</span>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor={`song-platforms-${index}`}>Distribution Platforms</label>
                <input
                  type="text"
                  id={`song-platforms-${index}`}
                  value={song.distributionPlatforms}
                  onChange={(e) => handleSongChange(index, 'distributionPlatforms', e.target.value)}
                  placeholder="Spotify, Apple Music, YouTube"
                />
                <small className="form-help">Comma-separated list of platforms</small>
              </div>
            </div>
          ))}
        </div>

        <div className="form-group">
          <label>Band Members Present</label>
          <div className="checkbox-group">
            {bandMembers.length > 0 ? (
              bandMembers.map(member => (
                <label key={member.id} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.bandMembersPresent.includes(member.id)}
                    onChange={(e) => {
                      const newBandMembers = e.target.checked
                        ? [...formData.bandMembersPresent, member.id]
                        : formData.bandMembersPresent.filter(id => id !== member.id);
                      handleInputChange('bandMembersPresent', newBandMembers);
                    }}
                  />
                  <span className="checkmark"></span>
                  {member.name} ({member.instrument})
                </label>
              ))
            ) : (
              <p className="no-band-members">
                No band members found. <br />
                <small>Add band members from the dashboard to track collaborative recordings.</small>
              </p>
            )}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="notes">Session Notes</label>
          <textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            placeholder="How did the recording session go? Any notes about the process or results?"
            rows={4}
          />
        </div>

        <div className="form-actions">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Saving Recording...' : (initialData ? 'Update Recording' : 'Add Recording')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RecordingForm;