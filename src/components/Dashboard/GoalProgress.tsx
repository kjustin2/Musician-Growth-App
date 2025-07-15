import React from 'react';
import { Goal } from '../../core/types';
import { formatDate, isWithinDays } from '../../utils';

interface GoalProgressProps {
  goals: Goal[];
  onGoalClick: () => void;
}

const GoalProgress: React.FC<GoalProgressProps> = ({ goals, onGoalClick }) => {
  const getProgressPercentage = (goal: Goal): number => {
    if (!goal.targetValue || goal.targetValue === 0) return 0;
    return Math.min((goal.currentValue / goal.targetValue) * 100, 100);
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

  if (goals.length === 0) {
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
        {goals.slice(0, 3).map((goal) => {
          const progress = getProgressPercentage(goal);
          const urgency = getGoalUrgency(goal);
          
          return (
            <div 
              key={goal.id} 
              className={`goal-item goal-${urgency}`}
              onClick={onGoalClick}
            >
              <div className="goal-icon">
                {getGoalTypeIcon(goal.type)}
              </div>
              <div className="goal-content">
                <div className="goal-title">{goal.title}</div>
                <div className="goal-progress-bar">
                  <div 
                    className="goal-progress-fill"
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
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {goals.length > 3 && (
        <div className="goals-summary">
          <button className="btn btn-link" onClick={onGoalClick}>
            View all {goals.length} goals
          </button>
        </div>
      )}
    </div>
  );
};

export default GoalProgress;