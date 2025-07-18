import React from 'react';
import { MusicianProfile } from '../../core/types';
import { useSetPage } from '../../context/AppContext';

interface ActionsTabProps {
  profile: MusicianProfile;
}

const ActionsTab: React.FC<ActionsTabProps> = ({ profile }) => {
  const setPage = useSetPage();

  const actions = [
    {
      id: 'add-show',
      title: 'Add Show',
      description: 'Log a new performance',
      icon: 'fas fa-music',
      color: 'primary',
      onClick: () => setPage('activity-entry')
    },
    {
      id: 'log-practice',
      title: 'Log Practice',
      description: 'Record a practice session',
      icon: 'fas fa-drum',
      color: 'info',
      onClick: () => setPage('activity-entry')
    },
    {
      id: 'record-song',
      title: 'Record Song',
      description: 'Add a new recording',
      icon: 'fas fa-microphone',
      color: 'warning',
      onClick: () => setPage('activity-entry')
    },
    {
      id: 'create-goal',
      title: 'Create Goal',
      description: 'Set a new musical goal',
      icon: 'fas fa-target',
      color: 'success',
      onClick: () => setPage('goal-management')
    },
    {
      id: 'add-band-member',
      title: 'Add Band Member',
      description: 'Add a musician to your band',
      icon: 'fas fa-user-plus',
      color: 'secondary',
      onClick: () => {
        // TODO: Implement band member management navigation
        // Placeholder for future navigation implementation
      }
    },
    {
      id: 'create-setlist',
      title: 'Create Set List',
      description: 'Build a new set list',
      icon: 'fas fa-list-music',
      color: 'dark',
      onClick: () => {
        // TODO: Implement set list management navigation
        // Placeholder for future navigation implementation
      }
    },
    {
      id: 'bulk-entry',
      title: 'Bulk Entry',
      description: 'Add multiple activities at once',
      icon: 'fas fa-plus-circle',
      color: 'outline-primary',
      onClick: () => setPage('bulk-entry')
    },
    {
      id: 'settings',
      title: 'Settings',
      description: 'Update your profile settings',
      icon: 'fas fa-cog',
      color: 'outline-secondary',
      onClick: () => setPage('settings')
    }
  ];

  return (
    <div className="actions-tab">
      <div className="actions-header mb-4">
        <p className="text-muted">Choose an action to get started</p>
      </div>

      <div className="row g-4">
        {actions.map((action) => (
          <div key={action.id} className="col-md-6 col-lg-4">
            <div
              className={`action-card card h-100 cursor-pointer border-2 action-${action.color}`}
              onClick={action.onClick}
              style={{ minHeight: '160px' }}
            >
              <div className="card-body text-center d-flex flex-column justify-content-center p-4">
                <div className="action-icon mb-3">
                  <i className={`${action.icon} fa-3x`} style={{ color: '#007bff' }}></i>
                </div>
                <h5 className="action-title mb-2 fw-bold">{action.title}</h5>
                <p className="action-description text-muted mb-0">{action.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActionsTab;