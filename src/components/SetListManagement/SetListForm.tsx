import React, { useState, useCallback } from 'react';
import { SetList, SetListSong, BandMember } from '../../core/types';
import { BandMemberSelector } from '../BandManagement';

interface SetListFormProps {
  onSubmit: (setList: Omit<SetList, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  bandMembers: BandMember[];
  initialData?: Partial<SetList>;
  profileId: string;
}

interface SongFormData extends Omit<SetListSong, 'id'> {
  tempId: string;
}

const GENRES = [
  'Rock', 'Pop', 'Country', 'Blues', 'Jazz', 'Folk', 'R&B', 'Soul',
  'Alternative', 'Indie', 'Classic Rock', 'Electronic', 'Hip Hop',
  'Latin', 'Reggae', 'Punk', 'Metal', 'Classical', 'Other'
];

const SetListForm: React.FC<SetListFormProps> = ({
  onSubmit,
  onCancel,
  bandMembers,
  initialData,
  profileId
}) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    songs: (initialData?.songs || []).map((song, index) => ({
      ...song,
      tempId: `existing-${index}`
    })) as SongFormData[]
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [songErrors, setSongErrors] = useState<Record<string, Record<string, string>>>({});

  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};
    const newSongErrors: Record<string, Record<string, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Set list name is required';
    }

    if (formData.songs.length === 0) {
      newErrors.songs = 'At least one song is required';
    }

    formData.songs.forEach((song, index) => {
      const songErr: Record<string, string> = {};
      
      if (!song.title.trim()) {
        songErr.title = 'Song title is required';
      }
      
      if (!song.artist.trim()) {
        songErr.artist = 'Artist is required';
      }
      
      if (!song.genre) {
        songErr.genre = 'Genre is required';
      }

      if (song.duration && (song.duration < 1 || song.duration > 60)) {
        songErr.duration = 'Duration must be between 1 and 60 minutes';
      }

      if (Object.keys(songErr).length > 0) {
        newSongErrors[song.tempId] = songErr;
      }
    });

    setErrors(newErrors);
    setSongErrors(newSongErrors);
    
    return Object.keys(newErrors).length === 0 && Object.keys(newSongErrors).length === 0;
  }, [formData]);

  const handleAddSong = useCallback(() => {
    const newSong: SongFormData = {
      tempId: `new-${Date.now()}`,
      title: '',
      artist: '',
      genre: '',
      duration: undefined,
      bandMembers: [],
      position: formData.songs.length
    };

    setFormData(prev => ({
      ...prev,
      songs: [...prev.songs, newSong]
    }));
  }, [formData.songs.length]);

  const handleRemoveSong = useCallback((tempId: string) => {
    setFormData(prev => ({
      ...prev,
      songs: prev.songs
        .filter(song => song.tempId !== tempId)
        .map((song, index) => ({ ...song, position: index }))
    }));
    
    setSongErrors(prev => {
      const updated = { ...prev };
      delete updated[tempId];
      return updated;
    });
  }, []);

  const handleSongChange = useCallback((tempId: string, field: keyof SetListSong, value: any) => {
    setFormData(prev => ({
      ...prev,
      songs: prev.songs.map(song =>
        song.tempId === tempId ? { ...song, [field]: value } : song
      )
    }));
  }, []);

  const handleBandMembersChange = useCallback((tempId: string, memberIds: string[]) => {
    handleSongChange(tempId, 'bandMembers', memberIds);
  }, [handleSongChange]);

  const handleMoveSong = useCallback((fromIndex: number, direction: 'up' | 'down') => {
    const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1;
    
    if (toIndex < 0 || toIndex >= formData.songs.length) return;

    setFormData(prev => {
      const newSongs = [...prev.songs];
      [newSongs[fromIndex], newSongs[toIndex]] = [newSongs[toIndex], newSongs[fromIndex]];
      
      return {
        ...prev,
        songs: newSongs.map((song, index) => ({ ...song, position: index }))
      };
    });
  }, [formData.songs.length]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const setListData: Omit<SetList, 'id' | 'createdAt' | 'updatedAt'> = {
      name: formData.name.trim(),
      profileId,
      songs: formData.songs.map((song, index) => ({
        id: `song-${Date.now()}-${index}`,
        title: song.title.trim(),
        artist: song.artist.trim(),
        genre: song.genre,
        duration: song.duration,
        bandMembers: song.bandMembers,
        position: index
      })),
      totalDuration: 0, // Will be calculated by service
      genres: [], // Will be calculated by service
      usageCount: initialData?.usageCount || 0,
      lastUsed: initialData?.lastUsed
    };

    onSubmit(setListData);
  }, [formData, profileId, validateForm, onSubmit, initialData]);

  return (
    <div className="set-list-form">
      <div className="card">
        <div className="card-header">
          <h3 className="card-title mb-0">
            {initialData ? 'Edit Set List' : 'Create Set List'}
          </h3>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            {/* Set List Name */}
            <div className="mb-4">
              <label htmlFor="name" className="form-label">
                Set List Name <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                id="name"
                className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter set list name (e.g., Saturday Night Rock Set)"
              />
              {errors.name && <div className="invalid-feedback">{errors.name}</div>}
            </div>

            {/* Songs Section */}
            <div className="songs-section">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">Songs</h5>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary"
                  onClick={handleAddSong}
                >
                  <i className="fas fa-plus me-1"></i>Add Song
                </button>
              </div>

              {errors.songs && (
                <div className="alert alert-danger">{errors.songs}</div>
              )}

              {formData.songs.length === 0 ? (
                <div className="text-center py-4 bg-light rounded">
                  <p className="text-muted mb-2">No songs added yet</p>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleAddSong}
                  >
                    Add First Song
                  </button>
                </div>
              ) : (
                <div className="songs-list">
                  {formData.songs.map((song, index) => (
                    <div key={song.tempId} className="song-item card mb-3">
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <h6 className="mb-0">Song {index + 1}</h6>
                          <div className="btn-group">
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => handleMoveSong(index, 'up')}
                              disabled={index === 0}
                              title="Move up"
                            >
                              <i className="fas fa-arrow-up"></i>
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => handleMoveSong(index, 'down')}
                              disabled={index === formData.songs.length - 1}
                              title="Move down"
                            >
                              <i className="fas fa-arrow-down"></i>
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleRemoveSong(song.tempId)}
                              title="Remove song"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </div>

                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <label className="form-label">
                              Title <span className="text-danger">*</span>
                            </label>
                            <input
                              type="text"
                              className={`form-control ${songErrors[song.tempId]?.title ? 'is-invalid' : ''}`}
                              value={song.title}
                              onChange={(e) => handleSongChange(song.tempId, 'title', e.target.value)}
                              placeholder="Song title"
                            />
                            {songErrors[song.tempId]?.title && (
                              <div className="invalid-feedback">{songErrors[song.tempId].title}</div>
                            )}
                          </div>

                          <div className="col-md-6 mb-3">
                            <label className="form-label">
                              Artist <span className="text-danger">*</span>
                            </label>
                            <input
                              type="text"
                              className={`form-control ${songErrors[song.tempId]?.artist ? 'is-invalid' : ''}`}
                              value={song.artist}
                              onChange={(e) => handleSongChange(song.tempId, 'artist', e.target.value)}
                              placeholder="Artist/Band name"
                            />
                            {songErrors[song.tempId]?.artist && (
                              <div className="invalid-feedback">{songErrors[song.tempId].artist}</div>
                            )}
                          </div>
                        </div>

                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <label className="form-label">
                              Genre <span className="text-danger">*</span>
                            </label>
                            <select
                              className={`form-select ${songErrors[song.tempId]?.genre ? 'is-invalid' : ''}`}
                              value={song.genre}
                              onChange={(e) => handleSongChange(song.tempId, 'genre', e.target.value)}
                            >
                              <option value="">Select genre</option>
                              {GENRES.map(genre => (
                                <option key={genre} value={genre}>{genre}</option>
                              ))}
                            </select>
                            {songErrors[song.tempId]?.genre && (
                              <div className="invalid-feedback">{songErrors[song.tempId].genre}</div>
                            )}
                          </div>

                          <div className="col-md-6 mb-3">
                            <label className="form-label">Duration (minutes)</label>
                            <input
                              type="number"
                              className={`form-control ${songErrors[song.tempId]?.duration ? 'is-invalid' : ''}`}
                              value={song.duration || ''}
                              onChange={(e) => handleSongChange(song.tempId, 'duration', parseInt(e.target.value) || undefined)}
                              placeholder="e.g., 4"
                              min="1"
                              max="60"
                            />
                            {songErrors[song.tempId]?.duration && (
                              <div className="invalid-feedback">{songErrors[song.tempId].duration}</div>
                            )}
                          </div>
                        </div>

                        {bandMembers.length > 0 && (
                          <div className="mb-3">
                            <BandMemberSelector
                              profileId={profileId}
                              selectedMemberIds={song.bandMembers}
                              onSelectionChange={(memberIds) => handleBandMembersChange(song.tempId, memberIds)}
                              title="Band Members Playing This Song"
                              multiple={true}
                              placeholder="Select band members..."
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="d-flex gap-2 mt-4">
              <button type="submit" className="btn btn-primary">
                {initialData ? 'Update Set List' : 'Create Set List'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={onCancel}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SetListForm;