import React from 'react';
import { loggingService } from '../../services/loggingService';

interface QuickActionsProps {
  onAction: (action: string) => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ onAction }) => {
  const handleActionClick = (actionId: string) => {
    try {
      loggingService.info('Quick action clicked', { actionId });
      if (typeof onAction === 'function') {
        onAction(actionId);
      } else {
        loggingService.warn('onAction is not a function', { onAction: typeof onAction });
      }
    } catch (error) {
      loggingService.error('Error handling quick action click', error as Error, { actionId });
    }
  };
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
      id: 'record-song',
      title: 'Record Song',
      description: 'Log a recording session',
      icon: '🎙️',
      color: 'danger'
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
            onClick={() => handleActionClick(action.id)}
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