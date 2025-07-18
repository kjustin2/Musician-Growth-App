import React, { useState, useEffect } from 'react';
import { SetList } from '../../core/types';
import { setListService } from '../../services/setListService';

interface SetListSelectorProps {
  profileId: string;
  selectedSetListId?: string;
  onSelectionChange: (setListId: string | undefined) => void;
  title?: string;
  placeholder?: string;
  required?: boolean;
  showUsageStats?: boolean;
}

const SetListSelector: React.FC<SetListSelectorProps> = ({
  profileId,
  selectedSetListId,
  onSelectionChange,
  title = 'Select Set List',
  placeholder = 'Choose a set list...',
  required = false,
  showUsageStats = true
}) => {
  const [setLists, setSetLists] = useState<SetList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadSetLists();
  }, [profileId]);

  const loadSetLists = async () => {
    try {
      setLoading(true);
      setError(null);
      await setListService.init();
      const lists = await setListService.getSetLists(profileId);
      setSetLists(lists);
    } catch (err) {
      setError('Failed to load set lists');
      console.error('Error loading set lists:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredSetLists = setLists.filter(setList =>
    setList.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    setList.genres.some(genre => genre.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const selectedSetList = setLists.find(list => list.id === selectedSetListId);

  const formatDate = (date?: Date) => {
    if (!date) return 'Never used';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return '';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins} min`;
  };

  const handleSelect = (setListId: string) => {
    onSelectionChange(setListId);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = () => {
    onSelectionChange(undefined);
    setSearchTerm('');
  };

  if (loading) {
    return (
      <div className="set-list-selector">
        <label className="form-label">{title}</label>
        <div className="form-select disabled">
          <span className="text-muted">Loading set lists...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="set-list-selector">
        <label className="form-label">{title}</label>
        <div className="alert alert-danger" role="alert">
          {error}
          <button className="btn btn-sm btn-outline-danger ms-2" onClick={loadSetLists}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (setLists.length === 0) {
    return (
      <div className="set-list-selector">
        <label className="form-label">{title}</label>
        <div className="alert alert-info" role="alert">
          <i className="fas fa-info-circle me-2"></i>
          No set lists found. Create a set list first to use it in performances.
        </div>
      </div>
    );
  }

  return (
    <div className="set-list-selector">
      <label className="form-label">
        {title} {required && <span className="text-danger">*</span>}
      </label>
      
      <div className="dropdown" style={{ width: '100%' }}>
        <button
          className="btn btn-outline-secondary dropdown-toggle text-start w-100"
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          style={{ 
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
        >
          {selectedSetList ? (
            <div className="d-flex justify-content-between align-items-center">
              <span>{selectedSetList.name}</span>
              <span className="text-muted ms-2">
                {selectedSetList.songs.length} songs • {formatDuration(selectedSetList.totalDuration)}
              </span>
            </div>
          ) : (
            <span className="text-muted">{placeholder}</span>
          )}
        </button>

        {isOpen && (
          <div className="dropdown-menu show w-100" style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {/* Search */}
            <div className="px-3 py-2">
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Search set lists..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {selectedSetListId && (
              <>
                <div className="dropdown-divider"></div>
                <button
                  className="dropdown-item text-danger"
                  onClick={() => handleClear()}
                >
                  <i className="fas fa-times me-2"></i>Clear selection
                </button>
                <div className="dropdown-divider"></div>
              </>
            )}

            {/* Set List Options */}
            {filteredSetLists.length === 0 ? (
              <div className="px-3 py-2 text-center text-muted">
                No set lists found matching "{searchTerm}"
              </div>
            ) : (
              filteredSetLists.map(setList => (
                <button
                  key={setList.id}
                  className={`dropdown-item ${setList.id === selectedSetListId ? 'active' : ''}`}
                  onClick={() => handleSelect(setList.id)}
                >
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="set-list-info">
                      <div className="fw-semibold">{setList.name}</div>
                      <div className="text-muted small">
                        {setList.songs.length} songs • {formatDuration(setList.totalDuration)}
                        {setList.genres.length > 0 && (
                          <span className="ms-1">
                            • {setList.genres.slice(0, 3).join(', ')}
                            {setList.genres.length > 3 && ` +${setList.genres.length - 3}`}
                          </span>
                        )}
                      </div>
                      {showUsageStats && (
                        <div className="text-muted small">
                          Used {setList.usageCount} times • {formatDate(setList.lastUsed)}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Most Used Set Lists (Optional) */}
      {showUsageStats && setLists.length > 3 && (
        <div className="mt-2">
          <small className="text-muted">
            Most used: {setLists
              .sort((a, b) => b.usageCount - a.usageCount)
              .slice(0, 3)
              .map(list => list.name)
              .join(', ')}
          </small>
        </div>
      )}
    </div>
  );
};

export default SetListSelector;