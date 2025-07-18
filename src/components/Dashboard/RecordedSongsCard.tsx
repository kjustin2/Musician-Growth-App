import React from 'react';
import { RecordingSession } from '../../core/types';
import { loggingService } from '../../services/loggingService';
import './RecordedSongsCard.css';

interface RecordedSongsCardProps {
  recordings: RecordingSession[];
  onRecordingClick?: (recording: RecordingSession) => void;
  onAddRecording?: () => void;
  isLoading?: boolean;
}

const RecordedSongsCard: React.FC<RecordedSongsCardProps> = ({
  recordings = [],
  onRecordingClick,
  onAddRecording,
  isLoading = false
}) => {
  // Ensure recordings is always an array
  const safeRecordings = Array.isArray(recordings) ? recordings : [];
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateTotalStats = () => {
    try {
      const totalSongs = safeRecordings.reduce((sum, recording) => sum + (recording.songs?.length || 0), 0);
      const totalPlays = safeRecordings.reduce((sum, recording) => sum + (recording.totalPlays || 0), 0);
      const totalRevenue = safeRecordings.reduce((sum, recording) => sum + (recording.totalRevenue || 0), 0);
      const totalCost = safeRecordings.reduce((sum, recording) => sum + (recording.cost || 0), 0);

      return {
        totalSongs,
        totalPlays,
        totalRevenue,
        netProfit: totalRevenue - totalCost
      };
    } catch (error) {
      loggingService.error('Error calculating recording stats', error as Error);
      return {
        totalSongs: 0,
        totalPlays: 0,
        totalRevenue: 0,
        netProfit: 0
      };
    }
  };

  const stats = calculateTotalStats();
  const recentRecordings = safeRecordings.slice(0, 3);

  if (isLoading) {
    return (
      <div className="card h-100">
        <div className="card-body">
          <h5 className="card-title">
            <i className="fas fa-microphone me-2"></i>
            Recorded Songs
          </h5>
          <div className="loading-state">
            <div className="spinner-border spinner-border-sm me-2" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            Loading recordings...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card h-100">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="card-title mb-0">
            <i className="fas fa-microphone me-2"></i>
            Recorded Songs
          </h5>
        </div>

        {safeRecordings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <i className="fas fa-music"></i>
            </div>
            <h6>No Recordings Yet</h6>
            <p className="text-muted mb-3">
              Start tracking your recording sessions and songs to see your creative progress.
            </p>
            {onAddRecording && (
              <button
                onClick={onAddRecording}
                className="btn btn-primary btn-sm"
              >
                <i className="fas fa-plus me-1"></i>
                Add Recording
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="quick-stats">
              <div className="stats-row">
                <div className="stat-item">
                  <div className="stat-value">{stats.totalSongs}</div>
                  <div className="stat-label">Songs</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">{stats.totalPlays.toLocaleString()}</div>
                  <div className="stat-label">Total Plays</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">{formatCurrency(stats.totalRevenue)}</div>
                  <div className="stat-label">Revenue</div>
                </div>
                <div className="stat-item">
                  <div className={`stat-value ${stats.netProfit >= 0 ? 'text-success' : 'text-danger'}`}>
                    {formatCurrency(stats.netProfit)}
                  </div>
                  <div className="stat-label">Net Profit</div>
                </div>
              </div>
            </div>

            <div className="recent-recordings">
              <h6 className="section-title">Recent Sessions</h6>
              <div className="recordings-list">
                {recentRecordings.map((recording) => (
                  <div
                    key={recording.id}
                    className={`recording-item ${onRecordingClick ? 'clickable' : ''}`}
                    onClick={() => onRecordingClick?.(recording)}
                  >
                    <div className="recording-info">
                      <div className="recording-header">
                        <span className="recording-date">
                          {formatDate(recording.date)}
                        </span>
                        <span className="recording-location">
                          <i className="fas fa-map-marker-alt me-1"></i>
                          {recording.location}
                        </span>
                      </div>
                      <div className="recording-details">
                        <span className="songs-count">
                          {(recording.songs?.length || 0)} song{(recording.songs?.length || 0) !== 1 ? 's' : ''}
                        </span>
                        <span className="plays-count">
                          {(recording.totalPlays || 0).toLocaleString()} plays
                        </span>
                        <span className="revenue-amount">
                          {formatCurrency(recording.totalRevenue || 0)}
                        </span>
                      </div>
                    </div>
                    {onRecordingClick && (
                      <div className="recording-action">
                        <i className="fas fa-chevron-right"></i>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {safeRecordings.length > 3 && (
                <div className="view-all">
                  <button
                    onClick={() => {
                      // This would typically navigate to a full recordings list
                      // Placeholder for future navigation implementation
                    }}
                    className="btn btn-sm btn-outline-secondary w-100"
                  >
                    View All {safeRecordings.length} Recordings
                  </button>
                </div>
              )}
            </div>

            {safeRecordings.length > 0 && (
              <div className="top-songs">
                <h6 className="section-title">Top Performing Songs</h6>
                <div className="songs-list">
                  {safeRecordings
                    .flatMap(recording => recording.songs || [])
                    .sort((a, b) => (b.plays || 0) - (a.plays || 0))
                    .slice(0, 3)
                    .map((song, index) => (
                      <div key={song.id} className="song-item">
                        <div className="song-rank">#{index + 1}</div>
                        <div className="song-info">
                          <div className="song-title">{song.title || 'Untitled'}</div>
                          <div className="song-stats">
                            <span className="plays">{(song.plays || 0).toLocaleString()} plays</span>
                            <span className="revenue">{formatCurrency(song.revenue || 0)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default RecordedSongsCard;