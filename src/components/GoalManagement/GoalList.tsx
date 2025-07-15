import React, { useState } from 'react';
import { Goal } from '../../core/types';
import { formatDate, isWithinDays } from '../../utils';

interface GoalListProps {
  goals: Goal[];
  onGoalSelect: (goal: Goal) => void;
  onCreateNew: () => void;
}

const GoalList: React.FC<GoalListProps> = ({ goals, onGoalSelect, onCreateNew }) => {
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'urgent'>('all');

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

  const filteredGoals = goals.filter(goal => {
    switch (filter) {
      case 'active':
        return goal.status === 'active';
      case 'completed':
        return goal.status === 'completed';
      case 'urgent':
        return goal.status === 'active' && getGoalUrgency(goal) === 'urgent';
      case 'all':
      default:
        return true;
    }
  });

  const groupedGoals = {
    urgent: filteredGoals.filter(g => g.status === 'active' && getGoalUrgency(g) === 'urgent'),
    active: filteredGoals.filter(g => g.status === 'active' && getGoalUrgency(g) !== 'urgent'),
    completed: filteredGoals.filter(g => g.status === 'completed'),
    other: filteredGoals.filter(g => g.status !== 'active' && g.status !== 'completed')
  };

  const renderGoalCard = (goal: Goal) => {
    const progress = getProgressPercentage(goal);
    const urgency = getGoalUrgency(goal);
    
    return (
      <div 
        key={goal.id}
        className={`goal-card goal-${urgency} ${getGoalStatusColor(goal.status)}`}
        onClick={() => onGoalSelect(goal)}
      >
        <div className="goal-card-header">
          <div className="goal-icon">
            {getGoalTypeIcon(goal.type)}
          </div>
          <div className="goal-status">
            <span className={`status-badge ${getGoalStatusColor(goal.status)}`}>
              {goal.status}
            </span>
          </div>
        </div>
        
        <div className="goal-card-content">
          <h3 className="goal-title">{goal.title}</h3>
          <p className="goal-description">{goal.description}</p>
          
          {goal.targetValue && (
            <div className="goal-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="progress-text">
                {goal.currentValue} / {goal.targetValue} ({Math.round(progress)}%)
              </div>
            </div>
          )}
          
          <div className="goal-footer">
            <div className="goal-type">
              {goal.type.replace('_', ' ')}
            </div>
            {goal.deadline && (
              <div className={`goal-deadline urgency-${urgency}`}>
                Due: {formatDate(goal.deadline)}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (goals.length === 0) {
    return (
      <div className="goal-empty">
        <div className="empty-icon">🎯</div>
        <h3>No Goals Yet</h3>
        <p>Set your first goal to start tracking your musical progress!</p>
        <button className="btn btn-primary" onClick={onCreateNew}>
          Create Your First Goal
        </button>
      </div>
    );
  }

  return (
    <div className="goal-list">
      <div className="goal-list-header">
        <div className="goal-filters">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({goals.length})
          </button>
          <button 
            className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
            onClick={() => setFilter('active')}
          >
            Active ({goals.filter(g => g.status === 'active').length})
          </button>
          <button 
            className={`filter-btn ${filter === 'urgent' ? 'active' : ''}`}
            onClick={() => setFilter('urgent')}
          >
            Urgent ({groupedGoals.urgent.length})
          </button>
          <button 
            className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            Completed ({goals.filter(g => g.status === 'completed').length})
          </button>
        </div>
        
        <button className="btn btn-primary" onClick={onCreateNew}>
          Create New Goal
        </button>
      </div>

      <div className="goal-sections">
        {filter === 'all' ? (
          <>
            {groupedGoals.urgent.length > 0 && (
              <div className="goal-section">
                <h3 className="section-title urgent">🚨 Urgent Goals</h3>
                <div className="goal-grid">
                  {groupedGoals.urgent.map(renderGoalCard)}
                </div>
              </div>
            )}
            
            {groupedGoals.active.length > 0 && (
              <div className="goal-section">
                <h3 className="section-title">🎯 Active Goals</h3>
                <div className="goal-grid">
                  {groupedGoals.active.map(renderGoalCard)}
                </div>
              </div>
            )}
            
            {groupedGoals.completed.length > 0 && (
              <div className="goal-section">
                <h3 className="section-title">✅ Completed Goals</h3>
                <div className="goal-grid">
                  {groupedGoals.completed.map(renderGoalCard)}
                </div>
              </div>
            )}
            
            {groupedGoals.other.length > 0 && (
              <div className="goal-section">
                <h3 className="section-title">📋 Other Goals</h3>
                <div className="goal-grid">
                  {groupedGoals.other.map(renderGoalCard)}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="goal-section">
            <div className="goal-grid">
              {filteredGoals.map(renderGoalCard)}
            </div>
          </div>
        )}
      </div>

      {filteredGoals.length === 0 && (
        <div className="goal-empty">
          <h3>No goals found</h3>
          <p>Try adjusting your filter or create a new goal.</p>
        </div>
      )}
    </div>
  );
};

export default GoalList;