import React, { useState, useMemo } from 'react';
import { RecordingSession } from '../../core/types';

interface RecordingListProps {
  recordings: RecordingSession[];
  onRecordingClick?: (recording: RecordingSession) => void;
  onRecordingEdit?: (recording: RecordingSession) => void;
  onRecordingDelete?: (recordingId: string) => void;
  loading?: boolean;
}

type SortField = 'date' | 'location' | 'cost' | 'revenue' | 'songs' | 'roi';
type SortDirection = 'asc' | 'desc';

const RecordingList: React.FC<RecordingListProps> = ({
  recordings,
  onRecordingClick,
  onRecordingEdit,
  onRecordingDelete,
  loading = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const calculateROI = (recording: RecordingSession): number => {
    if (recording.cost === 0) return 0;
    return ((recording.totalRevenue - recording.cost) / recording.cost) * 100;
  };

  const filteredAndSortedRecordings = useMemo(() => {
    let filtered = recordings;

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = recordings.filter(recording =>
        recording.location.toLowerCase().includes(term) ||
        recording.songs.some(song => 
          song.title.toLowerCase().includes(term) ||
          song.distributionPlatforms.some(platform => 
            platform.toLowerCase().includes(term)
          )
        ) ||
        (recording.notes && recording.notes.toLowerCase().includes(term))
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'date':
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
          break;
        case 'location':
          aValue = a.location.toLowerCase();
          bValue = b.location.toLowerCase();
          break;
        case 'cost':
          aValue = a.cost;
          bValue = b.cost;
          break;
        case 'revenue':
          aValue = a.totalRevenue;
          bValue = b.totalRevenue;
          break;
        case 'songs':
          aValue = a.songs.length;
          bValue = b.songs.length;
          break;
        case 'roi':
          aValue = calculateROI(a);
          bValue = calculateROI(b);
          break;
        default:
          aValue = a.date;
          bValue = b.date;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [recordings, searchTerm, sortField, sortDirection]);

  const paginatedRecordings = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedRecordings.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedRecordings, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredAndSortedRecordings.length / itemsPerPage);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
    setCurrentPage(1);
  };

  const getSortIcon = (field: SortField): string => {
    if (sortField !== field) return 'fas fa-sort';
    return sortDirection === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down';
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const calculateSummaryStats = () => {
    const totalCost = recordings.reduce((sum, r) => sum + r.cost, 0);
    const totalRevenue = recordings.reduce((sum, r) => sum + r.totalRevenue, 0);
    const totalSongs = recordings.reduce((sum, r) => sum + r.songs.length, 0);
    const totalPlays = recordings.reduce((sum, r) => sum + r.totalPlays, 0);
    const averageROI = recordings.length > 0 
      ? recordings.reduce((sum, r) => sum + calculateROI(r), 0) / recordings.length 
      : 0;

    return {
      totalSessions: recordings.length,
      totalCost,
      totalRevenue,
      netProfit: totalRevenue - totalCost,
      totalSongs,
      totalPlays,
      averageROI
    };
  };

  const stats = calculateSummaryStats();

  if (loading) {
    return (
      <div className="recording-list-loading">
        <div className="spinner"></div>
        <p>Loading recordings...</p>
      </div>
    );
  }

  return (
    <div className="recording-list">
      <div className="list-header">
        <h2>Recording Sessions</h2>
        
        {recordings.length > 0 && (
          <div className="summary-stats">
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-value">{stats.totalSessions}</div>
                <div className="stat-label">Sessions</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{stats.totalSongs}</div>
                <div className="stat-label">Songs</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{formatCurrency(stats.totalCost)}</div>
                <div className="stat-label">Total Cost</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{formatCurrency(stats.totalRevenue)}</div>
                <div className="stat-label">Total Revenue</div>
              </div>
              <div className="stat-item">
                <div className={`stat-value ${stats.netProfit >= 0 ? 'positive' : 'negative'}`}>
                  {formatCurrency(stats.netProfit)}
                </div>
                <div className="stat-label">Net Profit</div>
              </div>
              <div className="stat-item">
                <div className={`stat-value ${stats.averageROI >= 0 ? 'positive' : 'negative'}`}>
                  {stats.averageROI.toFixed(1)}%
                </div>
                <div className="stat-label">Avg ROI</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {recordings.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <i className="fas fa-microphone"></i>
          </div>
          <h3>No Recording Sessions</h3>
          <p>You haven't recorded any sessions yet. Start by adding your first recording session!</p>
        </div>
      ) : (
        <>
          <div className="list-controls">
            <div className="search-box">
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Search recordings, songs, or locations..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="search-input"
              />
              {searchTerm && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setCurrentPage(1);
                  }}
                  className="clear-search"
                >
                  <i className="fas fa-times"></i>
                </button>
              )}
            </div>

            <div className="results-info">
              Showing {paginatedRecordings.length} of {filteredAndSortedRecordings.length} recordings
            </div>
          </div>

          <div className="recordings-table">
            <div className="table-header">
              <div 
                className="header-cell sortable"
                onClick={() => handleSort('date')}
              >
                Date <i className={getSortIcon('date')}></i>
              </div>
              <div 
                className="header-cell sortable"
                onClick={() => handleSort('location')}
              >
                Location <i className={getSortIcon('location')}></i>
              </div>
              <div 
                className="header-cell sortable"
                onClick={() => handleSort('songs')}
              >
                Songs <i className={getSortIcon('songs')}></i>
              </div>
              <div 
                className="header-cell sortable"
                onClick={() => handleSort('cost')}
              >
                Cost <i className={getSortIcon('cost')}></i>
              </div>
              <div 
                className="header-cell sortable"
                onClick={() => handleSort('revenue')}
              >
                Revenue <i className={getSortIcon('revenue')}></i>
              </div>
              <div 
                className="header-cell sortable"
                onClick={() => handleSort('roi')}
              >
                ROI <i className={getSortIcon('roi')}></i>
              </div>
              <div className="header-cell">Actions</div>
            </div>

            <div className="table-body">
              {paginatedRecordings.map((recording) => {
                const roi = calculateROI(recording);
                return (
                  <div 
                    key={recording.id} 
                    className="table-row"
                    onClick={() => onRecordingClick?.(recording)}
                  >
                    <div className="table-cell">
                      <div className="date-cell">
                        <div className="date-primary">{formatDate(recording.date)}</div>
                        <div className="date-secondary">
                          {recording.totalPlays.toLocaleString()} plays
                        </div>
                      </div>
                    </div>
                    
                    <div className="table-cell">
                      <div className="location-cell">
                        <i className="fas fa-map-marker-alt"></i>
                        {recording.location}
                      </div>
                    </div>
                    
                    <div className="table-cell">
                      <div className="songs-cell">
                        <div className="songs-count">{recording.songs.length}</div>
                        <div className="songs-preview">
                          {recording.songs.slice(0, 2).map(song => song.title).join(', ')}
                          {recording.songs.length > 2 && ` +${recording.songs.length - 2} more`}
                        </div>
                      </div>
                    </div>
                    
                    <div className="table-cell">
                      <div className="cost-cell">
                        {formatCurrency(recording.cost)}
                      </div>
                    </div>
                    
                    <div className="table-cell">
                      <div className="revenue-cell">
                        {formatCurrency(recording.totalRevenue)}
                      </div>
                    </div>
                    
                    <div className="table-cell">
                      <div className={`roi-cell ${roi >= 0 ? 'positive' : 'negative'}`}>
                        {roi.toFixed(1)}%
                      </div>
                    </div>
                    
                    <div className="table-cell">
                      <div className="actions-cell">
                        {onRecordingEdit && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onRecordingEdit(recording);
                            }}
                            className="btn btn-sm btn-outline-primary"
                            title="Edit recording"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                        )}
                        {onRecordingDelete && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm('Are you sure you want to delete this recording session?')) {
                                onRecordingDelete(recording.id);
                              }
                            }}
                            className="btn btn-sm btn-outline-danger"
                            title="Delete recording"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="btn btn-sm btn-outline-secondary"
              >
                <i className="fas fa-chevron-left"></i>
                Previous
              </button>
              
              <div className="page-numbers">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`btn btn-sm ${currentPage === pageNum ? 'btn-primary' : 'btn-outline-secondary'}`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="btn btn-sm btn-outline-secondary"
              >
                Next
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default RecordingList;