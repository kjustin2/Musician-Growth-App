import React from 'react';

interface QuickActionsProps {
  onAction: (action: string) => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ onAction }) => {
  const actions = [
    {
      id: 'add-show',
      title: 'Add Show',
      description: 'Log a recent performance',
      icon: '🎤',
      color: 'primary'
    },
    {
      id: 'log-practice',
      title: 'Log Practice',
      description: 'Record a practice session',
      icon: '🎵',
      color: 'success'
    },
    {
      id: 'create-goal',
      title: 'Create Goal',
      description: 'Set a new goal',
      icon: '🎯',
      color: 'info'
    },
    {
      id: 'bulk-entry',
      title: 'Bulk Entry',
      description: 'Add multiple activities',
      icon: '📝',
      color: 'secondary'
    },
    {
      id: 'view-recommendations',
      title: 'Get Advice',
      description: 'View updated recommendations',
      icon: '📊',
      color: 'warning'
    }
  ];

  return (
    <div className="quick-actions">
      <h3>Quick Actions</h3>
      <div className="actions-grid">
        {actions.map((action) => (
          <button
            key={action.id}
            className={`action-card action-${action.color}`}
            onClick={() => onAction(action.id)}
          >
            <div className="action-icon">{action.icon}</div>
            <div className="action-content">
              <div className="action-title">{action.title}</div>
              <div className="action-description">{action.description}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;