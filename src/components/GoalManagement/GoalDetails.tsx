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
    <div className="goal-details-modern">
      {/* Header with navigation and actions */}
      <div className="goal-nav-header">
        <button 
          className="btn btn-outline-secondary btn-back"
          onClick={onBack}
        >
          ← Back to Dashboard
        </button>
        <div className="goal-header-actions">
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

      {/* Main goal info card */}
      <div className="goal-main-card">
        <div className="goal-header-modern">
          <div className="goal-title-section">
            <div className="goal-icon-modern">
              {getGoalTypeIcon(goal.type)}
            </div>
            <div className="goal-title-info">
              <h1>{goal.title}</h1>
              <p className="goal-description-inline">{goal.description}</p>
            </div>
          </div>
          <div className="goal-status-badges">
            <span className={`status-badge-modern ${getGoalStatusColor(goal.status)}`}>
              {goal.status.toUpperCase()}
            </span>
            <span className="goal-type-badge-modern">
              {goal.type.replace('_', ' ').toUpperCase()}
            </span>
          </div>
        </div>

        {/* Deadline alert if urgent */}
        {goal.deadline && urgency === 'urgent' && goal.status === 'active' && (
          <div className="deadline-alert">
            <span className="alert-icon">⚠️</span>
            <div className="alert-content">
              <strong>Deadline Approaching!</strong>
              <p>Due {formatDate(goal.deadline)} 
                {daysUntilDeadline !== null && (
                  <span>
                    {daysUntilDeadline > 0 
                      ? ` - ${daysUntilDeadline} days left`
                      : daysUntilDeadline === 0 
                        ? ' - Due today!'
                        : ` - ${Math.abs(daysUntilDeadline)} days overdue`
                    }
                  </span>
                )}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Two-column layout for progress and actions */}
      <div className="goal-content-grid">
        {/* Progress Section */}
        {goal.targetValue && (
          <div className="goal-card progress-card">
            <div className="card-header">
              <h3>Progress Tracking</h3>
              <div className="progress-percentage-badge">
                {Math.round(progress)}%
              </div>
            </div>
            
            <div className="progress-visual">
              <div className="progress-circle">
                <svg viewBox="0 0 36 36" className="circular-chart">
                  <path className="circle-bg"
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path className="circle"
                    strokeDasharray={`${progress}, 100`}
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="progress-center">
                  <span className="progress-number">{Math.round(progress)}%</span>
                </div>
              </div>
              
              <div className="progress-stats-modern">
                <div className="stat-item">
                  <span className="stat-value">{goal.currentValue}</span>
                  <span className="stat-label">Current</span>
                </div>
                <div className="stat-divider">of</div>
                <div className="stat-item">
                  <span className="stat-value">{goal.targetValue}</span>
                  <span className="stat-label">Target</span>
                </div>
              </div>
            </div>

            {goal.status === 'active' && (
              <div className="progress-update-modern">
                <label htmlFor="progress-input">Update Progress</label>
                <div className="progress-input-group-modern">
                  <input
                    id="progress-input"
                    type="number"
                    value={progressUpdate}
                    onChange={(e) => setProgressUpdate(e.target.value)}
                    min="0"
                    step="0.01"
                    className="progress-input-modern"
                    placeholder="Enter new value"
                  />
                  <button 
                    className="btn btn-primary btn-update"
                    onClick={handleUpdateProgress}
                  >
                    Update
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Actions and Timeline Section */}
        <div className="goal-card actions-card">
          <div className="card-header">
            <h3>Actions & Timeline</h3>
          </div>
          
          {/* Quick Actions */}
          {goal.status === 'active' && (
            <div className="quick-actions-modern">
              <button 
                className="action-btn success"
                onClick={() => handleStatusChange('completed')}
              >
                <span className="action-icon">✅</span>
                Mark Complete
              </button>
              <button 
                className="action-btn warning"
                onClick={() => handleStatusChange('paused')}
              >
                <span className="action-icon">⏸️</span>
                Pause Goal
              </button>
              <button 
                className="action-btn danger"
                onClick={() => handleStatusChange('cancelled')}
              >
                <span className="action-icon">❌</span>
                Cancel Goal
              </button>
            </div>
          )}

          {goal.status === 'paused' && (
            <div className="quick-actions-modern">
              <button 
                className="action-btn success"
                onClick={() => handleStatusChange('active')}
              >
                <span className="action-icon">▶️</span>
                Resume Goal
              </button>
            </div>
          )}

          {/* Timeline */}
          <div className="timeline-modern">
            <div className="timeline-item-modern">
              <div className="timeline-dot-modern created"></div>
              <div className="timeline-content-modern">
                <span className="timeline-title">Goal Created</span>
                <span className="timeline-date">{formatDate(goal.createdAt)}</span>
              </div>
            </div>
            
            {goal.deadline && goal.status === 'active' && (
              <div className="timeline-item-modern">
                <div className={`timeline-dot-modern deadline urgency-${urgency}`}></div>
                <div className="timeline-content-modern">
                  <span className="timeline-title">Target Deadline</span>
                  <span className="timeline-date">{formatDate(goal.deadline)}</span>
                </div>
              </div>
            )}
            
            {goal.status === 'completed' && (
              <div className="timeline-item-modern">
                <div className="timeline-dot-modern completed"></div>
                <div className="timeline-content-modern">
                  <span className="timeline-title">Goal Completed 🎉</span>
                  <span className="timeline-date">Congratulations!</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Celebration for completed goals */}
      {goal.status === 'completed' && (
        <div className="goal-celebration-modern">
          <div className="celebration-content">
            <span className="celebration-icon">🎉</span>
            <div className="celebration-text">
              <h3>Goal Completed!</h3>
              <p>Congratulations on achieving your goal. You're making great progress on your musical journey!</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalDetails;