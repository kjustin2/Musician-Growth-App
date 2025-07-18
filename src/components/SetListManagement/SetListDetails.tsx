import React, { useState, useEffect } from 'react';
import { SetList, SetListAnalysis, BandMember } from '../../core/types';
import { setListService } from '../../services/setListService';

interface SetListDetailsProps {
  setList: SetList;
  bandMembers: BandMember[];
  onClose: () => void;
  onEdit: (setList: SetList) => void;
}

const SetListDetails: React.FC<SetListDetailsProps> = ({
  setList,
  bandMembers,
  onClose,
  onEdit
}) => {
  const [analysis, setAnalysis] = useState<SetListAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalysis();
  }, [setList.id]);

  const loadAnalysis = async () => {
    try {
      setLoading(true);
      await setListService.init();
      const result = await setListService.analyzeSetListDiversity(setList.id);
      setAnalysis(result);
    } catch (err) {
      console.error('Error analyzing set list:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date?: Date) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getBandMemberNames = (memberIds: string[]) => {
    return memberIds
      .map(id => bandMembers.find(member => member.id === id)?.name)
      .filter(Boolean)
      .join(', ');
  };

  const getGenreColor = (genre: string) => {
    const colors: Record<string, string> = {
      rock: 'danger',
      pop: 'success',
      country: 'warning',
      blues: 'primary',
      jazz: 'info',
      folk: 'secondary',
      'r&b': 'dark',
      electronic: 'purple'
    };
    
    return colors[genre.toLowerCase()] || 'secondary';
  };

  return (
    <div className="set-list-details">
      <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Set List Details</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body">
              {/* Set List Info */}
              <div className="set-list-header mb-4">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h3 className="mb-2">{setList.name}</h3>
                    <div className="set-list-meta">
                      <span className="badge bg-primary me-2">
                        {setList.songs.length} Songs
                      </span>
                      <span className="badge bg-secondary me-2">
                        {formatDuration(setList.totalDuration)}
                      </span>
                      <span className="text-muted">
                        Used {setList.usageCount} times • Last used {formatDate(setList.lastUsed)}
                      </span>
                    </div>
                  </div>
                  <button className="btn btn-outline-primary" onClick={() => onEdit(setList)}>
                    <i className="fas fa-edit me-1"></i>Edit
                  </button>
                </div>
              </div>

              {/* Genre Analysis */}
              {loading ? (
                <div className="text-center py-3">
                  <div className="spinner-border spinner-border-sm text-primary" role="status">
                    <span className="visually-hidden">Loading analysis...</span>
                  </div>
                </div>
              ) : analysis && (
                <div className="genre-analysis mb-4">
                  <h5 className="mb-3">Genre Analysis</h5>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="analysis-card p-3 bg-light rounded">
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="text-muted">Genre Diversity</span>
                          <span className="h4 mb-0 text-primary">
                            {Math.round(analysis.genreDiversity * 100)}%
                          </span>
                        </div>
                        <div className="progress mt-2" style={{ height: '10px' }}>
                          <div
                            className="progress-bar"
                            role="progressbar"
                            style={{ width: `${analysis.genreDiversity * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="analysis-card p-3 bg-light rounded">
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="text-muted">Avg Song Duration</span>
                          <span className="h4 mb-0 text-primary">
                            {formatDuration(Math.round(analysis.averageSongDuration))}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Genre Distribution */}
                  <div className="genre-distribution mt-3">
                    <h6>Genre Distribution</h6>
                    <div className="d-flex flex-wrap gap-2">
                      {Object.entries(analysis.genreDistribution).map(([genre, count]) => (
                        <span
                          key={genre}
                          className={`badge bg-${getGenreColor(genre)} text-white`}
                        >
                          {genre}: {count} {count === 1 ? 'song' : 'songs'}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Genre Recommendations */}
                  {analysis.recommendedGenres.length > 0 && (
                    <div className="genre-recommendations mt-3">
                      <h6>Recommended Genres to Add</h6>
                      {analysis.recommendedGenres.map((rec, index) => (
                        <div key={index} className="recommendation-item alert alert-info py-2 px-3 mb-2">
                          <div className="d-flex justify-content-between align-items-start">
                            <div>
                              <strong>{rec.genre}</strong>
                              <span className="ms-2 badge bg-success">
                                {Math.round(rec.compatibility * 100)}% compatible
                              </span>
                              <p className="mb-0 mt-1 small">{rec.reason}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Song List */}
              <div className="song-list">
                <h5 className="mb-3">Songs</h5>
                <div className="songs-container" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {setList.songs.map((song, index) => (
                    <div key={song.id} className="song-card card mb-2">
                      <div className="card-body py-2">
                        <div className="d-flex align-items-center">
                          <div className="song-number me-3 text-muted">
                            <strong>{index + 1}</strong>
                          </div>
                          <div className="song-info flex-grow-1">
                            <div className="d-flex justify-content-between align-items-start">
                              <div>
                                <h6 className="mb-1">{song.title}</h6>
                                <div className="song-meta">
                                  <span className="text-muted me-2">{song.artist}</span>
                                  <span className={`badge bg-${getGenreColor(song.genre)} me-2`}>
                                    {song.genre}
                                  </span>
                                  {song.duration && (
                                    <span className="text-muted me-2">
                                      <i className="fas fa-clock me-1"></i>
                                      {formatDuration(song.duration)}
                                    </span>
                                  )}
                                </div>
                                {song.bandMembers.length > 0 && (
                                  <div className="band-members mt-1">
                                    <small className="text-muted">
                                      <i className="fas fa-users me-1"></i>
                                      {getBandMemberNames(song.bandMembers)}
                                    </small>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetListDetails;