import React, { useState, useEffect } from 'react';
import { BandMember, ParticipationRecord } from '../../core/types';
import { bandMemberService } from '../../services/bandMemberService';

interface BandMemberDetailsProps {
  member: BandMember;
  onClose: () => void;
  onEdit: (member: BandMember) => void;
}

const BandMemberDetails: React.FC<BandMemberDetailsProps> = ({
  member,
  onClose,
  onEdit
}) => {
  const [participationHistory, setParticipationHistory] = useState<ParticipationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadParticipationHistory();
  }, [member.id]);

  const loadParticipationHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      await bandMemberService.init();
      const history = await bandMemberService.getParticipationHistory(member.id);
      setParticipationHistory(history);
    } catch (err) {
      setError('Failed to load participation history');
      console.error('Error loading participation history:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getActivityIcon = (activityType: string) => {
    switch (activityType) {
      case 'performance':
        return 'fas fa-music';
      case 'practice':
        return 'fas fa-drum';
      case 'recording':
        return 'fas fa-microphone';
      default:
        return 'fas fa-circle';
    }
  };

  const getActivityColor = (activityType: string) => {
    switch (activityType) {
      case 'performance':
        return 'text-success';
      case 'practice':
        return 'text-info';
      case 'recording':
        return 'text-warning';
      default:
        return 'text-muted';
    }
  };

  const getExperienceLevel = (years: number) => {
    if (years === 0) return 'Beginner';
    if (years < 3) return 'Novice';
    if (years < 7) return 'Intermediate';
    if (years < 15) return 'Advanced';
    return 'Expert';
  };

  const getParticipationStats = () => {
    const stats = {
      performances: 0,
      practices: 0,
      recordings: 0,
      thisMonth: 0
    };

    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    participationHistory.forEach(record => {
      switch (record.activityType) {
        case 'performance':
          stats.performances++;
          break;
        case 'practice':
          stats.practices++;
          break;
        case 'recording':
          stats.recordings++;
          break;
      }

      if (new Date(record.date) > oneMonthAgo) {
        stats.thisMonth++;
      }
    });

    return stats;
  };

  const stats = getParticipationStats();

  return (
    <div className="band-member-details">
      <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Band Member Details</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body">
              {/* Member Info */}
              <div className="member-header mb-4">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h3 className="mb-1">{member.name}</h3>
                    <div className="mb-2">
                      <span className="badge bg-primary me-2">{member.instrument}</span>
                      <span className="text-muted">{getExperienceLevel(member.yearsExperience)}</span>
                    </div>
                    <small className="text-muted">
                      <i className="fas fa-calendar me-1"></i>
                      Joined {formatDate(member.joinDate)} • {member.yearsExperience} years experience
                    </small>
                  </div>
                  <button className="btn btn-outline-primary" onClick={() => onEdit(member)}>
                    <i className="fas fa-edit me-1"></i>Edit
                  </button>
                </div>
              </div>

              {/* Participation Stats */}
              <div className="participation-summary mb-4">
                <h5 className="mb-3">Participation Summary</h5>
                <div className="row">
                  <div className="col-md-3 col-6">
                    <div className="stat-card text-center p-3 bg-light rounded">
                      <div className="stat-value h4 mb-1 text-success">{stats.performances}</div>
                      <div className="stat-label small text-muted">Performances</div>
                    </div>
                  </div>
                  <div className="col-md-3 col-6">
                    <div className="stat-card text-center p-3 bg-light rounded">
                      <div className="stat-value h4 mb-1 text-info">{stats.practices}</div>
                      <div className="stat-label small text-muted">Practices</div>
                    </div>
                  </div>
                  <div className="col-md-3 col-6">
                    <div className="stat-card text-center p-3 bg-light rounded">
                      <div className="stat-value h4 mb-1 text-warning">{stats.recordings}</div>
                      <div className="stat-label small text-muted">Recordings</div>
                    </div>
                  </div>
                  <div className="col-md-3 col-6">
                    <div className="stat-card text-center p-3 bg-light rounded">
                      <div className="stat-value h4 mb-1 text-primary">{stats.thisMonth}</div>
                      <div className="stat-label small text-muted">This Month</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Participation History */}
              <div className="participation-history">
                <h5 className="mb-3">Recent Activity</h5>
                
                {loading ? (
                  <div className="text-center py-3">
                    <div className="spinner-border spinner-border-sm text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : error ? (
                  <div className="alert alert-warning" role="alert">
                    {error}
                  </div>
                ) : participationHistory.length === 0 ? (
                  <div className="text-center py-3 text-muted">
                    <i className="fas fa-history fa-2x mb-2"></i>
                    <p>No activity recorded yet</p>
                  </div>
                ) : (
                  <div className="activity-timeline" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {participationHistory.slice(0, 20).map((record, index) => (
                      <div key={record.id} className="timeline-item d-flex mb-3">
                        <div className="timeline-icon me-3">
                          <i className={`${getActivityIcon(record.activityType)} ${getActivityColor(record.activityType)}`}></i>
                        </div>
                        <div className="timeline-content flex-grow-1">
                          <div className="d-flex justify-content-between align-items-start">
                            <div>
                              <h6 className="mb-1">
                                {record.activityType.charAt(0).toUpperCase() + record.activityType.slice(1)}
                              </h6>
                              {record.role && (
                                <span className="badge bg-secondary me-2">{record.role}</span>
                              )}
                              <small className="text-muted">
                                {formatDate(record.date)}
                              </small>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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

export default BandMemberDetails;