import React, { useState } from 'react';
import { RecordingSession } from '../../core/types';
import { recordingService } from '../../services/recordingService';
import { goalLinkingService } from '../../services/goalLinkingService';

interface RecordingDetailsProps {
  recording: RecordingSession;
  onUpdate?: (updatedRecording: RecordingSession) => void;
  onDelete?: (recordingId: string) => void;
  onClose?: () => void;
}

const RecordingDetails: React.FC<RecordingDetailsProps> = ({
  recording,
  onUpdate,
  onDelete,
  onClose
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingSong, setEditingSong] = useState<string | null>(null);
  const [songMetrics, setSongMetrics] = useState<Record<string, { plays: string; revenue: string }>>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDuration = (seconds?: number): string => {
    if (!seconds) return 'Unknown';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleSongMetricsEdit = (songId: string) => {
    const song = recording.songs.find(s => s.id === songId);
    if (song) {
      setSongMetrics(prev => ({
        ...prev,
        [songId]: {
          plays: song.plays.toString(),
          revenue: song.revenue.toString()
        }
      }));
      setEditingSong(songId);
    }
  };

  const handleSongMetricsCancel = () => {
    setEditingSong(null);
    setSongMetrics(prev => {
      const updated = { ...prev };
      if (editingSong) {
        delete updated[editingSong];
      }
      return updated;
    });
  };

  const handleSongMetricsSave = async (songId: string) => {
    if (!songMetrics[songId]) return;

    const plays = parseInt(songMetrics[songId].plays) || 0;
    const revenue = parseFloat(songMetrics[songId].revenue) || 0;

    if (plays < 0 || revenue < 0) {
      alert('Plays and revenue must be non-negative numbers');
      return;
    }

    setLoading(true);
    try {
      await recordingService.updateSongMetrics(songId, plays, revenue);
      
      // Update the recording object
      const updatedRecording = {
        ...recording,
        songs: recording.songs.map(song => 
          song.id === songId 
            ? { ...song, plays, revenue }
            : song
        ),
        totalPlays: recording.songs.reduce((sum, song) => 
          sum + (song.id === songId ? plays : song.plays), 0
        ),
        totalRevenue: recording.songs.reduce((sum, song) => 
          sum + (song.id === songId ? revenue : song.revenue), 0
        ),
        updatedAt: new Date()
      };

      // Update linked goals
      await goalLinkingService.updateGoalsForAction(
        recording.songs[0]?.recordingSessionId || '', 
        'recording', 
        updatedRecording
      );

      if (onUpdate) {
        onUpdate(updatedRecording);
      }

      setEditingSong(null);
      setSongMetrics(prev => {
        const updated = { ...prev };
        delete updated[songId];
        return updated;
      });
    } catch (error) {
      console.error('Failed to update song metrics:', error);
      alert('Failed to update song metrics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }

    setLoading(true);
    try {
      await recordingService.deleteRecording(recording.id);
      if (onDelete) {
        onDelete(recording.id);
      }
    } catch (error) {
      console.error('Failed to delete recording:', error);
      alert('Failed to delete recording. Please try again.');
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const calculateROI = (): number => {
    if (recording.cost === 0) return 0;
    return ((recording.totalRevenue - recording.cost) / recording.cost) * 100;
  };

  const roi = calculateROI();

  return (
    <div className="recording-details">
      <div className="recording-header">
        <div className="header-content">
          <h2>Recording Session Details</h2>
          <div className="header-meta">
            <span className="recording-date">{formatDate(recording.date)}</span>
            <span className="recording-location">
              <i className="fas fa-map-marker-alt"></i>
              {recording.location}
            </span>
          </div>
        </div>
        
        <div className="header-actions">
          {onClose && (
            <button
              onClick={onClose}
              className="btn btn-secondary btn-sm"
              disabled={loading}
            >
              <i className="fas fa-times"></i>
              Close
            </button>
          )}
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="btn btn-primary btn-sm"
            disabled={loading}
          >
            <i className={`fas fa-${isEditing ? 'save' : 'edit'}`}></i>
            {isEditing ? 'Done Editing' : 'Edit'}
          </button>
          <button
            onClick={handleDelete}
            className={`btn btn-danger btn-sm ${showDeleteConfirm ? 'confirm-delete' : ''}`}
            disabled={loading}
          >
            <i className="fas fa-trash"></i>
            {showDeleteConfirm ? 'Confirm Delete' : 'Delete'}
          </button>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="delete-warning">
          <p>
            <i className="fas fa-exclamation-triangle"></i>
            Are you sure you want to delete this recording session? This action cannot be undone.
          </p>
          <button
            onClick={() => setShowDeleteConfirm(false)}
            className="btn btn-secondary btn-sm"
          >
            Cancel
          </button>
        </div>
      )}

      <div className="recording-content">
        <div className="recording-summary">
          <div className="summary-grid">
            <div className="summary-item">
              <div className="summary-label">Total Cost</div>
              <div className="summary-value cost">
                {formatCurrency(recording.cost)}
              </div>
            </div>
            
            <div className="summary-item">
              <div className="summary-label">Total Revenue</div>
              <div className="summary-value revenue">
                {formatCurrency(recording.totalRevenue)}
              </div>
            </div>
            
            <div className="summary-item">
              <div className="summary-label">Net Profit</div>
              <div className={`summary-value profit ${recording.totalRevenue - recording.cost >= 0 ? 'positive' : 'negative'}`}>
                {formatCurrency(recording.totalRevenue - recording.cost)}
              </div>
            </div>
            
            <div className="summary-item">
              <div className="summary-label">ROI</div>
              <div className={`summary-value roi ${roi >= 0 ? 'positive' : 'negative'}`}>
                {roi.toFixed(1)}%
              </div>
            </div>
            
            <div className="summary-item">
              <div className="summary-label">Total Plays</div>
              <div className="summary-value plays">
                {recording.totalPlays.toLocaleString()}
              </div>
            </div>
            
            <div className="summary-item">
              <div className="summary-label">Songs Recorded</div>
              <div className="summary-value songs">
                {recording.songs.length}
              </div>
            </div>
          </div>
        </div>

        <div className="songs-section">
          <h3>Recorded Songs</h3>
          
          {recording.songs.length === 0 ? (
            <div className="empty-state">
              <p>No songs recorded in this session.</p>
            </div>
          ) : (
            <div className="songs-list">
              {recording.songs.map((song, index) => (
                <div key={song.id} className="song-card">
                  <div className="song-header">
                    <div className="song-info">
                      <h4 className="song-title">{song.title}</h4>
                      <div className="song-meta">
                        <span className="song-duration">
                          <i className="fas fa-clock"></i>
                          {formatDuration(song.duration)}
                        </span>
                        {song.distributionPlatforms.length > 0 && (
                          <div className="platforms">
                            <i className="fas fa-share-alt"></i>
                            {song.distributionPlatforms.join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="song-actions">
                      {editingSong === song.id ? (
                        <div className="edit-actions">
                          <button
                            onClick={() => handleSongMetricsSave(song.id)}
                            className="btn btn-primary btn-sm"
                            disabled={loading}
                          >
                            <i className="fas fa-save"></i>
                            Save
                          </button>
                          <button
                            onClick={handleSongMetricsCancel}
                            className="btn btn-secondary btn-sm"
                            disabled={loading}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleSongMetricsEdit(song.id)}
                          className="btn btn-outline-primary btn-sm"
                          disabled={loading || editingSong !== null}
                        >
                          <i className="fas fa-edit"></i>
                          Edit Metrics
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="song-metrics">
                    <div className="metric-item">
                      <div className="metric-label">Plays</div>
                      {editingSong === song.id ? (
                        <input
                          type="number"
                          value={songMetrics[song.id]?.plays || ''}
                          onChange={(e) => setSongMetrics(prev => ({
                            ...prev,
                            [song.id]: {
                              ...prev[song.id],
                              plays: e.target.value
                            }
                          }))}
                          className="metric-input"
                          min="0"
                        />
                      ) : (
                        <div className="metric-value">{song.plays.toLocaleString()}</div>
                      )}
                    </div>
                    
                    <div className="metric-item">
                      <div className="metric-label">Revenue</div>
                      {editingSong === song.id ? (
                        <input
                          type="number"
                          value={songMetrics[song.id]?.revenue || ''}
                          onChange={(e) => setSongMetrics(prev => ({
                            ...prev,
                            [song.id]: {
                              ...prev[song.id],
                              revenue: e.target.value
                            }
                          }))}
                          className="metric-input"
                          min="0"
                          step="0.01"
                        />
                      ) : (
                        <div className="metric-value">{formatCurrency(song.revenue)}</div>
                      )}
                    </div>
                    
                    <div className="metric-item">
                      <div className="metric-label">Revenue per Play</div>
                      <div className="metric-value">
                        {song.plays > 0 
                          ? formatCurrency(song.revenue / song.plays)
                          : formatCurrency(0)
                        }
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {recording.notes && (
          <div className="notes-section">
            <h3>Session Notes</h3>
            <div className="notes-content">
              {recording.notes}
            </div>
          </div>
        )}

        <div className="session-metadata">
          <div className="metadata-item">
            <span className="metadata-label">Created:</span>
            <span className="metadata-value">{formatDate(recording.createdAt)}</span>
          </div>
          {recording.updatedAt && recording.updatedAt.getTime() !== recording.createdAt.getTime() && (
            <div className="metadata-item">
              <span className="metadata-label">Last Updated:</span>
              <span className="metadata-value">{formatDate(recording.updatedAt)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecordingDetails;