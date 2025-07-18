import React, { useState, useEffect } from 'react';
import { BandMember, ParticipationRecord } from '../../core/types';
import { bandMemberService } from '../../services/bandMemberService';

interface BandMemberListProps {
  profileId: string;
  onEditMember: (member: BandMember) => void;
  onDeleteMember: (memberId: string) => void;
  onViewDetails: (member: BandMember) => void;
}

const BandMemberList: React.FC<BandMemberListProps> = ({
  profileId,
  onEditMember,
  onDeleteMember,
  onViewDetails
}) => {
  const [members, setMembers] = useState<BandMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const handleDelete = async (memberId: string, memberName: string) => {
    if (window.confirm(`Are you sure you want to remove ${memberName} from the band?`)) {
      try {
        await bandMemberService.deleteBandMember(memberId);
        onDeleteMember(memberId);
        await loadMembers(); // Refresh the list
      } catch (err) {
        setError('Failed to delete band member');
        console.error('Error deleting band member:', err);
      }
    }
  };

  const formatJoinDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getExperienceLevel = (years: number) => {
    if (years === 0) return 'Beginner';
    if (years < 3) return 'Novice';
    if (years < 7) return 'Intermediate';
    if (years < 15) return 'Advanced';
    return 'Expert';
  };

  const getParticipationStats = (participationHistory: ParticipationRecord[]) => {
    const totalActivities = participationHistory.length;
    const recentActivities = participationHistory.filter(
      record => new Date(record.date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    ).length;
    
    return { totalActivities, recentActivities };
  };

  if (loading) {
    return (
      <div className="band-member-list">
        <div className="text-center py-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2 text-muted">Loading band members...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="band-member-list">
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
      <div className="band-member-list">
        <div className="empty-state text-center py-5">
          <div className="empty-icon mb-3">
            <i className="fas fa-users text-muted" style={{ fontSize: '3rem' }}></i>
          </div>
          <h4 className="text-muted">No Band Members</h4>
          <p className="text-muted">
            Start building your band by adding members who play with you regularly.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="band-member-list">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0">Band Members ({members.length})</h4>
        <button className="btn btn-sm btn-outline-primary" onClick={loadMembers}>
          <i className="fas fa-refresh me-1"></i>
          Refresh
        </button>
      </div>

      <div className="row">
        {members.map(member => {
          const stats = getParticipationStats(member.participationHistory);
          
          return (
            <div key={member.id} className="col-md-6 col-lg-4 mb-3">
              <div className="band-member-card card h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h5 className="card-title mb-0">{member.name}</h5>
                    <div className="dropdown">
                      <button
                        className="btn btn-sm btn-outline-secondary dropdown-toggle"
                        type="button"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                      >
                        <i className="fas fa-ellipsis-v"></i>
                      </button>
                      <ul className="dropdown-menu">
                        <li>
                          <button
                            className="dropdown-item"
                            onClick={() => onViewDetails(member)}
                          >
                            <i className="fas fa-eye me-2"></i>View Details
                          </button>
                        </li>
                        <li>
                          <button
                            className="dropdown-item"
                            onClick={() => onEditMember(member)}
                          >
                            <i className="fas fa-edit me-2"></i>Edit
                          </button>
                        </li>
                        <li><hr className="dropdown-divider" /></li>
                        <li>
                          <button
                            className="dropdown-item text-danger"
                            onClick={() => handleDelete(member.id, member.name)}
                          >
                            <i className="fas fa-trash me-2"></i>Remove
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="member-info mb-3">
                    <div className="mb-2">
                      <span className="instrument-badge badge bg-primary me-2">
                        {member.instrument}
                      </span>
                      <span className="experience-indicator text-muted">
                        {getExperienceLevel(member.yearsExperience)}
                      </span>
                    </div>
                    <small className="text-muted">
                      <i className="fas fa-calendar me-1"></i>
                      Joined {formatJoinDate(member.joinDate)}
                    </small>
                  </div>

                  <div className="participation-stats">
                    <div className="row text-center">
                      <div className="col-6">
                        <div className="stat-value">{stats.totalActivities}</div>
                        <div className="stat-label">Total Activities</div>
                      </div>
                      <div className="col-6">
                        <div className="stat-value">{stats.recentActivities}</div>
                        <div className="stat-label">This Month</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BandMemberList;