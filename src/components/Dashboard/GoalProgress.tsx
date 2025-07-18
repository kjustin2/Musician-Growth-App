import React from 'react';
import { Goal } from '../../core/types';

interface GoalProgressProps {
  goals: Goal[];
  onGoalClick: () => void;
}

const GoalProgress: React.FC<GoalProgressProps> = ({ goals = [], onGoalClick }) => {
  // Ensure goals is always an array
  const safeGoals = Array.isArray(goals) ? goals : [];
  
  const getProgressPercentage = (goal: Goal): number => {
    if (!goal.targetValue || goal.targetValue === 0) return 0;
    return Math.min((goal.currentValue / goal.targetValue) * 100, 100);
  };

  const isLinkedGoal = (goal: Goal): boolean => {
    return goal.autoUpdate;
  };

  const getLinkedActionBadge = (goal: Goal): string => {
    switch (goal.type) {
      case 'performance': return '🎤';
      case 'skill': return '🎵';
      case 'recording': return '🎙️';
      case 'financial': return '💰';
      default: return '';
    }
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const isWithinDays = (date: Date, days: number): boolean => {
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= days && diffDays >= 0;
  };

  const getGoalUrgency = (goal: Goal): 'urgent' | 'soon' | 'normal' => {
    if (!goal.deadline) return 'normal';
    
    if (isWithinDays(goal.deadline, 7)) return 'urgent';
    if (isWithinDays(goal.deadline, 30)) return 'soon';
    return 'normal';
  };

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

  if (safeGoals.length === 0) {
    return (
      <div className="goal-progress">
        <div className="goal-progress-header">
          <h3>Active Goals</h3>
          <button className="btn btn-outline-primary btn-sm" onClick={onGoalClick}>
            Create Goal
          </button>
        </div>
        <div className="empty-state">
          <p>No active goals</p>
          <small>Set goals to track your musical progress!</small>
        </div>
      </div>
    );
  }

  return (
    <div className="goal-progress">
      <div className="goal-progress-header">
        <h3>Active Goals</h3>
        <button className="btn btn-outline-primary btn-sm" onClick={onGoalClick}>
          Manage Goals
        </button>
      </div>

      <div className="goals-list">
        {safeGoals.slice(0, 3).map((goal) => {
          const progress = getProgressPercentage(goal);
          const urgency = getGoalUrgency(goal);
          
          return (
            <div 
              key={goal.id} 
              className={`goal-item goal-${urgency} ${isLinkedGoal(goal) ? 'goal-linked' : 'goal-manual'}`}
              onClick={onGoalClick}
            >
              <div className="goal-icon">
                {getGoalTypeIcon(goal.type)}
              </div>
              <div className="goal-content">
                <div className="goal-header">
                  <div className="goal-title">{goal.title}</div>
                  <div className="goal-badges">
                    {isLinkedGoal(goal) && (
                      <span className="goal-linked-badge" title="Auto-updating goal">
                        <i className="fas fa-link"></i>
                        {getLinkedActionBadge(goal)}
                      </span>
                    )}
                    {!isLinkedGoal(goal) && (
                      <span className="goal-manual-badge" title="Manual goal">
                        <i className="fas fa-hand-paper"></i>
                      </span>
                    )}
                  </div>
                </div>
                <div className="goal-progress-bar">
                  <div 
                    className={`goal-progress-fill ${isLinkedGoal(goal) ? 'linked' : 'manual'}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="goal-details">
                  <span>{goal.currentValue} / {goal.targetValue || '∞'}</span>
                  {goal.deadline && (
                    <span className="goal-deadline">
                      Due: {formatDate(goal.deadline)}
                    </span>
                  )}
                  {isLinkedGoal(goal) && goal.progressHistory && goal.progressHistory.length > 0 && (
                    <span className="goal-last-update" title="Last updated">
                      <i className="fas fa-clock"></i>
                      {goal.progressHistory[goal.progressHistory.length - 1]?.date && 
                        formatDate(goal.progressHistory[goal.progressHistory.length - 1].date)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {safeGoals.length > 3 && (
        <div className="goals-summary">
          <button className="btn btn-link" onClick={onGoalClick}>
            View all {safeGoals.length} goals
          </button>
        </div>
      )}
    </div>
  );
};

export default GoalProgress;