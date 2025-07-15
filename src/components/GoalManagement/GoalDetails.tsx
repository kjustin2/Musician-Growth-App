import React, { useState } from 'react';
import { Goal } from '../../core/types';
import { formatDate, isWithinDays } from '../../utils';
import GoalForm from './GoalForm';

interface GoalDetailsProps {
  goal: Goal;
  onUpdate: (goalId: string, updates: Partial<Goal>) => void;
  onDelete: (goalId: string) => void;
  onBack: () => void;
}

const GoalDetails: React.FC<GoalDetailsProps> = ({ goal, onUpdate, onDelete, onBack }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [progressUpdate, setProgressUpdate] = useState(goal.currentValue.toString());

  const getGoalTypeIcon = (type: Goal['type']): string => {
    switch (type) {
      case 'performance': return '🎤';
      case 'skill': return '🎯';
      case 'financial': return '💰';
      case 'recording': return '🎵';
      case 'custom': return '⭐';
      default: return '📋';
    }
  };

  const getGoalStatusColor = (status: Goal['status']): string => {
    switch (status) {
      case 'active': return 'status-active';
      case 'completed': return 'status-completed';
      case 'paused': return 'status-paused';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-active';
    }
  };

  const getGoalUrgency = (goal: Goal): 'urgent' | 'soon' | 'normal' => {
    if (!goal.deadline || goal.status !== 'active') return 'normal';
    
    if (isWithinDays(goal.deadline, 7)) return 'urgent';
    if (isWithinDays(goal.deadline, 30)) return 'soon';
    return 'normal';
  };

  const getProgressPercentage = (goal: Goal): number => {
    if (!goal.targetValue || goal.targetValue === 0) return 0;
    return Math.min((goal.currentValue / goal.targetValue) * 100, 100);
  };

  const getDaysUntilDeadline = (deadline: Date): number => {
    const today = new Date();
    const timeDiff = deadline.getTime() - today.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  };

  const handleUpdateProgress = () => {
    const newProgress = parseFloat(progressUpdate);
    if (isNaN(newProgress) || newProgress < 0) {
      alert('Please enter a valid progress value');
      return;
    }

    const updates: Partial<Goal> = { currentValue: newProgress };
    
    // Auto-complete if target is reached
    if (goal.targetValue && newProgress >= goal.targetValue && goal.status === 'active') {
      updates.status = 'completed';
    }

    onUpdate(goal.id, updates);
  };

  const handleStatusChange = (newStatus: Goal['status']) => {
    onUpdate(goal.id, { status: newStatus });
  };

  const handleEditSubmit = (goalData: Omit<Goal, 'id' | 'createdAt'>) => {
    onUpdate(goal.id, goalData);
    setIsEditing(false);
  };

  const progress = getProgressPercentage(goal);
  const urgency = getGoalUrgency(goal);
  const daysUntilDeadline = goal.deadline ? getDaysUntilDeadline(goal.deadline) : null;

  if (isEditing) {
    return (
      <GoalForm
        goal={goal}
        onSubmit={handleEditSubmit}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  return (
    <div className="goal-details">
      <div className="goal-details-header">
        <button 
          className="btn btn-outline-secondary"
          onClick={onBack}
        >
          ← Back to Goals
        </button>
        <div className="goal-details-actions">
          <button 
            className="btn btn-outline-primary"
            onClick={() => setIsEditing(true)}
          >
            Edit
          </button>
          <button 
            className="btn btn-outline-danger"
            onClick={() => onDelete(goal.id)}
          >
            Delete
          </button>
        </div>
      </div>

      <div className="goal-details-content">
        <div className="goal-header">
          <div className="goal-icon-large">
            {getGoalTypeIcon(goal.type)}
          </div>
          <div className="goal-header-info">
            <h1>{goal.title}</h1>
            <div className="goal-meta">
              <span className={`status-badge ${getGoalStatusColor(goal.status)}`}>
                {goal.status}
              </span>
              <span className="goal-type-badge">
                {goal.type.replace('_', ' ')}
              </span>
              {goal.deadline && (
                <span className={`deadline-badge urgency-${urgency}`}>
                  Due: {formatDate(goal.deadline)}
                  {daysUntilDeadline !== null && (
                    <small>
                      {daysUntilDeadline > 0 
                        ? ` (${daysUntilDeadline} days left)`
                        : daysUntilDeadline === 0 
                          ? ' (Due today!)'
                          : ` (${Math.abs(daysUntilDeadline)} days overdue)`
                      }
                    </small>
                  )}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="goal-description">
          <h3>Description</h3>
          <p>{goal.description}</p>
        </div>

        {goal.targetValue && (
          <div className="goal-progress-section">
            <h3>Progress</h3>
            <div className="progress-display">
              <div className="progress-bar-large">
                <div 
                  className="progress-fill"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="progress-stats">
                <div className="progress-current">
                  <span className="progress-value">{goal.currentValue}</span>
                  <span className="progress-label">Current</span>
                </div>
                <div className="progress-target">
                  <span className="progress-value">{goal.targetValue}</span>
                  <span className="progress-label">Target</span>
                </div>
                <div className="progress-percentage">
                  <span className="progress-value">{Math.round(progress)}%</span>
                  <span className="progress-label">Complete</span>
                </div>
              </div>
            </div>

            {goal.status === 'active' && (
              <div className="progress-update">
                <h4>Update Progress</h4>
                <div className="progress-input-group">
                  <input
                    type="number"
                    value={progressUpdate}
                    onChange={(e) => setProgressUpdate(e.target.value)}
                    min="0"
                    step="0.01"
                    className="progress-input"
                  />
                  <button 
                    className="btn btn-primary"
                    onClick={handleUpdateProgress}
                  >
                    Update
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="goal-timeline">
          <h3>Timeline</h3>
          <div className="timeline-item">
            <div className="timeline-dot created"></div>
            <div className="timeline-content">
              <strong>Goal Created</strong>
              <p>{formatDate(goal.createdAt)}</p>
            </div>
          </div>
          
          {goal.status === 'completed' && (
            <div className="timeline-item">
              <div className="timeline-dot completed"></div>
              <div className="timeline-content">
                <strong>Goal Completed</strong>
                <p>Congratulations! 🎉</p>
              </div>
            </div>
          )}
          
          {goal.deadline && goal.status === 'active' && (
            <div className="timeline-item">
              <div className={`timeline-dot deadline urgency-${urgency}`}></div>
              <div className="timeline-content">
                <strong>Deadline</strong>
                <p>{formatDate(goal.deadline)}</p>
              </div>
            </div>
          )}
        </div>

        {goal.status === 'active' && (
          <div className="goal-actions">
            <h3>Quick Actions</h3>
            <div className="action-buttons">
              <button 
                className="btn btn-success"
                onClick={() => handleStatusChange('completed')}
              >
                Mark as Completed
              </button>
              <button 
                className="btn btn-warning"
                onClick={() => handleStatusChange('paused')}
              >
                Pause Goal
              </button>
              <button 
                className="btn btn-danger"
                onClick={() => handleStatusChange('cancelled')}
              >
                Cancel Goal
              </button>
            </div>
          </div>
        )}

        {goal.status === 'paused' && (
          <div className="goal-actions">
            <h3>Resume Goal</h3>
            <button 
              className="btn btn-success"
              onClick={() => handleStatusChange('active')}
            >
              Resume Goal
            </button>
          </div>
        )}

        {goal.status === 'completed' && (
          <div className="goal-celebration">
            <h3>🎉 Congratulations!</h3>
            <p>You've successfully completed this goal. Great work!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoalDetails;