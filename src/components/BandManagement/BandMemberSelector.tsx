import React, { useState, useEffect } from 'react';
import { BandMember } from '../../core/types';
import { bandMemberService } from '../../services/bandMemberService';

interface BandMemberSelectorProps {
  profileId: string;
  selectedMemberIds: string[];
  onSelectionChange: (memberIds: string[]) => void;
  title?: string;
  multiple?: boolean;
  placeholder?: string;
  required?: boolean;
}

const BandMemberSelector: React.FC<BandMemberSelectorProps> = ({
  profileId,
  selectedMemberIds,
  onSelectionChange,
  title = 'Select Band Members',
  multiple = true,
  placeholder = 'Choose band members...',
  required = false
}) => {
  const [members, setMembers] = useState<BandMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadMembers();
  }, [profileId]);

  const loadMembers = async () => {
    try {
      setLoading(true);
      setError(null);
      await bandMemberService.init();
      const memberList = await bandMemberService.getBandMembers(profileId);
      setMembers(memberList);
    } catch (err) {
      setError('Failed to load band members');
      console.error('Error loading band members:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.instrument.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleMemberToggle = (memberId: string) => {
    if (multiple) {
      const newSelection = selectedMemberIds.includes(memberId)
        ? selectedMemberIds.filter(id => id !== memberId)
        : [...selectedMemberIds, memberId];
      onSelectionChange(newSelection);
    } else {
      onSelectionChange([memberId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedMemberIds.length === members.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(members.map(member => member.id));
    }
  };

  const getSelectedMemberNames = () => {
    return members
      .filter(member => selectedMemberIds.includes(member.id))
      .map(member => member.name)
      .join(', ');
  };

  const formatJoinDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short'
    });
  };

  if (loading) {
    return (
      <div className="band-member-selector">
        <label className="form-label">{title}</label>
        <div className="card">
          <div className="card-body text-center py-3">
            <div className="spinner-border spinner-border-sm text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <span className="ms-2 text-muted">Loading band members...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="band-member-selector">
        <label className="form-label">{title}</label>
        <div className="alert alert-danger" role="alert">
          {error}
          <button className="btn btn-sm btn-outline-danger ms-2" onClick={loadMembers}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className="band-member-selector">
        <label className="form-label">{title}</label>
        <div className="alert alert-info" role="alert">
          <i className="fas fa-info-circle me-2"></i>
          No band members found. Add band members first to select them for activities.
        </div>
      </div>
    );
  }

  return (
    <div className="band-member-selector">
      <label className="form-label">
        {title} {required && <span className="text-danger">*</span>}
      </label>
      
      <div className="card">
        <div className="card-header">
          <div className="d-flex justify-content-between align-items-center">
            <div className="selected-summary">
              <span className="badge bg-primary">
                {selectedMemberIds.length} selected
              </span>
              {selectedMemberIds.length > 0 && (
                <span className="text-muted ms-2">
                  {getSelectedMemberNames()}
                </span>
              )}
            </div>
            {multiple && members.length > 1 && (
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={handleSelectAll}
              >
                {selectedMemberIds.length === members.length ? 'Deselect All' : 'Select All'}
              </button>
            )}
          </div>
        </div>
        
        <div className="card-body">
          {/* Search */}
          {members.length > 3 && (
            <div className="mb-3">
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Search members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          )}

          {/* Member List */}
          <div className="member-list" style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {filteredMembers.length === 0 ? (
              <div className="text-center text-muted py-2">
                No members found matching "{searchTerm}"
              </div>
            ) : (
              filteredMembers.map(member => (
                <div
                  key={member.id}
                  className={`member-item d-flex align-items-center p-2 border-bottom cursor-pointer ${
                    selectedMemberIds.includes(member.id) ? 'bg-light' : ''
                  }`}
                  onClick={() => handleMemberToggle(member.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type={multiple ? 'checkbox' : 'radio'}
                      checked={selectedMemberIds.includes(member.id)}
                      onChange={() => handleMemberToggle(member.id)}
                    />
                  </div>
                  
                  <div className="member-info ms-2 flex-grow-1">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <div className="fw-semibold">{member.name}</div>
                        <div className="text-muted small">
                          <span className="badge bg-secondary me-1">{member.instrument}</span>
                          {member.yearsExperience} years exp • Joined {formatJoinDate(member.joinDate)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BandMemberSelector;