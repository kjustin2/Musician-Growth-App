import React, { useState, useEffect } from 'react';
import { Goal } from '../../core/types';
import { useApp } from '../../context/AppContext';
import { storageService } from '../../services/storageService';
import GoalForm from './GoalForm';
import GoalList from './GoalList';
import GoalDetails from './GoalDetails';
import './GoalManagement.css';

const GoalManagement: React.FC = () => {
  const { state, dispatch } = useApp();
  const [activeView, setActiveView] = useState<'list' | 'create' | 'details'>('list');
  const [goals, setGoals] = useState<Goal[]>([]);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (state.musicianProfile) {
      loadGoals();
    }
  }, [state.musicianProfile]);

  const loadGoals = async () => {
    if (!state.musicianProfile) return;
    
    try {
      setLoading(true);
      const goalsData = await storageService.getGoals(state.musicianProfile.id);
      setGoals(goalsData);
    } catch (error) {
      console.error('Error loading goals:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load goals' });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    dispatch({ type: 'SET_PAGE', payload: 'dashboard' });
  };

  const handleCreateGoal = async (goalData: Omit<Goal, 'id' | 'createdAt'>) => {
    if (!state.musicianProfile) return;

    try {
      const newGoal: Goal = {
        ...goalData,
        id: Date.now().toString(),
        createdAt: new Date()
      };

      await storageService.saveGoal(state.musicianProfile.id, newGoal);
      dispatch({ type: 'ADD_GOAL', payload: newGoal });
      setGoals(prev => [...prev, newGoal]);
      setActiveView('list');
    } catch (error) {
      console.error('Error creating goal:', error);
      alert('Failed to create goal. Please try again.');
    }
  };

  const handleUpdateGoal = async (goalId: string, updates: Partial<Goal>) => {
    if (!state.musicianProfile) return;

    try {
      const updatedGoal = goals.find(g => g.id === goalId);
      if (!updatedGoal) return;

      const newGoalData = { ...updatedGoal, ...updates };
      await storageService.saveGoal(state.musicianProfile.id, newGoalData);
      
      dispatch({ type: 'UPDATE_GOAL', payload: { id: goalId, updates } });
      setGoals(prev => prev.map(g => g.id === goalId ? newGoalData : g));
      
      if (selectedGoal?.id === goalId) {
        setSelectedGoal(newGoalData);
      }
    } catch (error) {
      console.error('Error updating goal:', error);
      alert('Failed to update goal. Please try again.');
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!state.musicianProfile) return;

    if (window.confirm('Are you sure you want to delete this goal?')) {
      try {
        // Note: Would need to implement deleteGoal in storage service
        // For now, we'll just remove from state
        setGoals(prev => prev.filter(g => g.id !== goalId));
        
        if (selectedGoal?.id === goalId) {
          setSelectedGoal(null);
          setActiveView('list');
        }
      } catch (error) {
        console.error('Error deleting goal:', error);
        alert('Failed to delete goal. Please try again.');
      }
    }
  };

  const handleGoalSelect = (goal: Goal) => {
    setSelectedGoal(goal);
    setActiveView('details');
  };

  const renderContent = () => {
    if (!state.musicianProfile) {
      return (
        <div className="goal-error">
          <h3>No Profile Selected</h3>
          <p>Please select a profile to manage goals.</p>
          <button 
            className="btn btn-primary"
            onClick={() => dispatch({ type: 'SET_PAGE', payload: 'profile-selection' })}
          >
            Select Profile
          </button>
        </div>
      );
    }

    if (loading) {
      return (
        <div className="goal-loading">
          <div className="spinner"></div>
          <p>Loading goals...</p>
        </div>
      );
    }

    switch (activeView) {
      case 'create':
        return (
          <GoalForm
            onSubmit={handleCreateGoal}
            onCancel={() => setActiveView('list')}
          />
        );
      case 'details':
        return selectedGoal ? (
          <GoalDetails
            goal={selectedGoal}
            onUpdate={handleUpdateGoal}
            onDelete={handleDeleteGoal}
            onBack={() => setActiveView('list')}
          />
        ) : null;
      case 'list':
      default:
        return (
          <GoalList
            goals={goals}
            onGoalSelect={handleGoalSelect}
            onCreateNew={() => setActiveView('create')}
          />
        );
    }
  };

  return (
    <div className="goal-management">
      <div className="goal-header">
        <button 
          className="btn btn-outline-secondary"
          onClick={handleBack}
        >
          ← Back to Dashboard
        </button>
        <h1>Goal Management</h1>
        <p>Set, track, and achieve your musical goals</p>
      </div>

      <div className="goal-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default GoalManagement;