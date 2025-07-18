import React, { useState, useEffect } from 'react';
import { MusicianProfile, Goal } from '../../core/types';
import { useApp } from '../../context/AppContext';
import { goalLinkingService } from '../../services/goalLinkingService';
import { validateGoalLinking, getSuggestedTargetValue } from '../../utils/goalLinkingUtils';

interface LinkedGoalCreationProps {
  profile: MusicianProfile;
  onGoalCreated?: (goal: EnhancedGoal) => void;
  onCancel?: () => void;
}

const LinkedGoalCreation: React.FC<LinkedGoalCreationProps> = ({
  profile,
  onGoalCreated,
  onCancel
}) => {
  const { dispatch } = useApp();
  const [loading, setLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<GoalTemplate | null>(null);
  const [customGoal, setCustomGoal] = useState(false);
  const [targetValue, setTargetValue] = useState<string>('');
  const [deadline, setDeadline] = useState<string>('');
  const [autoUpdate, setAutoUpdate] = useState(true);
  const [customTitle, setCustomTitle] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const templatesByCategory = GOAL_TEMPLATES.reduce((acc, template) => {
    if (!acc[template.category]) {
      acc[template.category] = [];
    }
    acc[template.category].push(template);
    return acc;
  }, {} as Record<string, GoalTemplate[]>);

  const getUserActivityLevel = (): 'beginner' | 'intermediate' | 'advanced' => {
    const totalShows = profile.shows?.length || 0;
    const totalPracticeHours = (profile.practiceLog?.reduce((sum, session) => sum + session.duration, 0) || 0) / 60;
    const totalRecordings = profile.recordings?.length || 0;

    if (totalShows >= 20 || totalPracticeHours >= 100 || totalRecordings >= 5) {
      return 'advanced';
    } else if (totalShows >= 5 || totalPracticeHours >= 20 || totalRecordings >= 2) {
      return 'intermediate';
    }
    return 'beginner';
  };

  useEffect(() => {
    if (selectedTemplate && !targetValue) {
      const activityLevel = getUserActivityLevel();
      const suggested = getSuggestedTargetValue(
        selectedTemplate.linkedMetric,
        0, // Current value - we'll calculate this properly in the service
        activityLevel
      );
      setTargetValue(suggested.toString());
    }
  }, [selectedTemplate, targetValue]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (customGoal) {
      if (!customTitle.trim()) {
        newErrors.title = 'Goal title is required';
      }
      if (!customDescription.trim()) {
        newErrors.description = 'Goal description is required';
      }
    } else if (!selectedTemplate) {
      newErrors.template = 'Please select a goal template';
    }

    if (!targetValue || parseFloat(targetValue) <= 0) {
      newErrors.targetValue = 'Please enter a valid target value greater than 0';
    }

    if (deadline) {
      const deadlineDate = new Date(deadline);
      if (deadlineDate <= new Date()) {
        newErrors.deadline = 'Deadline must be in the future';
      }
    }

    // Validate goal linking if using template
    if (selectedTemplate && !customGoal) {
      const mockGoal: EnhancedGoal = {
        id: 'temp',
        title: selectedTemplate.title,
        description: selectedTemplate.description,
        type: selectedTemplate.category as any,
        targetValue: parseFloat(targetValue) || 0,
        currentValue: 0,
        status: 'active',
        createdAt: new Date(),
        linkedActionType: selectedTemplate.category as any,
        linkedMetric: selectedTemplate.linkedMetric,
        autoUpdate,
        progressHistory: []
      };

      const validation = validateGoalLinking(mockGoal);
      if (!validation.isValid) {
        newErrors.linking = validation.errors.join(', ');
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      let newGoal: EnhancedGoal;

      if (customGoal) {
        // Create custom goal (non-linked)
        newGoal = {
          id: `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          title: customTitle.trim(),
          description: customDescription.trim(),
          type: 'custom',
          targetValue: parseFloat(targetValue),
          currentValue: 0,
          deadline: deadline ? new Date(deadline) : undefined,
          status: 'active',
          createdAt: new Date(),
          linkedActionType: undefined,
          linkedMetric: '',
          autoUpdate: false,
          progressHistory: []
        };

        // Save manually since it's not linked
        await goalLinkingService.createLinkedGoal(profile.id, {
          id: 'custom',
          title: customTitle.trim(),
          description: customDescription.trim(),
          linkedMetric: '',
          category: 'custom' as any
        }, parseFloat(targetValue));
      } else if (selectedTemplate) {
        // Create linked goal from template
        newGoal = await goalLinkingService.createLinkedGoal(
          profile.id, 
          selectedTemplate, 
          parseFloat(targetValue)
        );

        if (deadline) {
          newGoal.deadline = new Date(deadline);
        }
      } else {
        throw new Error('No template selected');
      }

      // Update context
      dispatch({ type: 'ADD_GOAL', payload: newGoal });

      // Call callback
      if (onGoalCreated) {
        onGoalCreated(newGoal);
      }

      // Reset form
      resetForm();
      
      alert(`Goal "${newGoal.title}" created successfully!`);
    } catch (error) {
      console.error('Error creating goal:', error);
      alert('Failed to create goal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedTemplate(null);
    setCustomGoal(false);
    setTargetValue('');
    setDeadline('');
    setAutoUpdate(true);
    setCustomTitle('');
    setCustomDescription('');
    setErrors({});
  };

  const handleTemplateSelect = (template: GoalTemplate) => {
    setSelectedTemplate(template);
    setCustomGoal(false);
    setTargetValue('');
    setErrors({});
  };

  const handleCustomGoalToggle = () => {
    setCustomGoal(!customGoal);
    setSelectedTemplate(null);
    setTargetValue('');
    setErrors({});
  };

  return (
    <div className="linked-goal-creation">
      <div className="goal-creation-header">
        <h2>Create New Goal</h2>
        <p>Set up a goal that can automatically track your progress or create a custom goal.</p>
      </div>

      <form onSubmit={handleSubmit} className="goal-creation-form">
        <div className="goal-type-selection">
          <div className="type-toggle">
            <button
              type="button"
              className={`toggle-btn ${!customGoal ? 'active' : ''}`}
              onClick={() => handleCustomGoalToggle()}
            >
              <i className="fas fa-link"></i>
              Linked Goals
            </button>
            <button
              type="button"
              className={`toggle-btn ${customGoal ? 'active' : ''}`}
              onClick={handleCustomGoalToggle}
            >
              <i className="fas fa-edit"></i>
              Custom Goal
            </button>
          </div>
          
          <div className="type-description">
            {customGoal ? (
              <p>Create a custom goal that you'll track manually.</p>
            ) : (
              <p>Choose from predefined goals that automatically update based on your activities.</p>
            )}
          </div>
        </div>

        {!customGoal ? (
          <div className="template-selection">
            <h3>Choose Goal Type</h3>
            {errors.template && <span className="error-text">{errors.template}</span>}
            
            {Object.entries(templatesByCategory).map(([category, templates]) => (
              <div key={category} className="template-category">
                <h4 className="category-title">
                  <i className={`fas fa-${getCategoryIcon(category)}`}></i>
                  {getCategoryDisplayName(category)} Goals
                </h4>
                
                <div className="template-grid">
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      className={`template-card ${selectedTemplate?.id === template.id ? 'selected' : ''}`}
                      onClick={() => handleTemplateSelect(template)}
                    >
                      <div className="template-header">
                        <h5>{template.title.replace('X', '[Target]')}</h5>
                        <div className="template-badge">
                          {template.category}
                        </div>
                      </div>
                      <p className="template-description">{template.description}</p>
                      <div className="template-features">
                        <span className="feature">
                          <i className="fas fa-sync"></i>
                          Auto-updates
                        </span>
                        <span className="feature">
                          <i className="fas fa-chart-line"></i>
                          Progress tracking
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="custom-goal-form">
            <div className="form-group">
              <label htmlFor="customTitle">Goal Title *</label>
              <input
                type="text"
                id="customTitle"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                className={errors.title ? 'error' : ''}
                placeholder="e.g., Learn 10 new songs"
                maxLength={100}
              />
              {errors.title && <span className="error-text">{errors.title}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="customDescription">Description *</label>
              <textarea
                id="customDescription"
                value={customDescription}
                onChange={(e) => setCustomDescription(e.target.value)}
                className={errors.description ? 'error' : ''}
                placeholder="Describe what you want to achieve and how you'll measure success"
                rows={3}
                maxLength={500}
              />
              {errors.description && <span className="error-text">{errors.description}</span>}
            </div>
          </div>
        )}

        <div className="goal-details">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="targetValue">Target Value *</label>
              <input
                type="number"
                id="targetValue"
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                className={errors.targetValue ? 'error' : ''}
                placeholder="Enter your target number"
                min="1"
                step="0.01"
              />
              {errors.targetValue && <span className="error-text">{errors.targetValue}</span>}
              {selectedTemplate && (
                <small className="form-help">
                  Suggested based on your activity level: {getSuggestedTargetValue(
                    selectedTemplate.linkedMetric, 
                    0, 
                    getUserActivityLevel()
                  )}
                </small>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="deadline">Deadline (Optional)</label>
              <input
                type="date"
                id="deadline"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className={errors.deadline ? 'error' : ''}
                min={new Date().toISOString().split('T')[0]}
              />
              {errors.deadline && <span className="error-text">{errors.deadline}</span>}
            </div>
          </div>

          {!customGoal && (
            <div className="form-group">
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={autoUpdate}
                    onChange={(e) => setAutoUpdate(e.target.checked)}
                  />
                  <span className="checkmark"></span>
                  Automatically update progress based on my activities
                </label>
              </div>
              <small className="form-help">
                When enabled, this goal will automatically update when you log related activities.
              </small>
            </div>
          )}

          {errors.linking && (
            <div className="linking-errors">
              <span className="error-text">{errors.linking}</span>
            </div>
          )}
        </div>

        <div className="form-actions">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Creating Goal...' : 'Create Goal'}
          </button>
        </div>
      </form>
    </div>
  );
};

const getCategoryIcon = (category: string): string => {
  switch (category) {
    case 'performance': return 'microphone';
    case 'practice': return 'music';
    case 'recording': return 'record-vinyl';
    case 'financial': return 'dollar-sign';
    case 'band': return 'users';
    default: return 'target';
  }
};

const getCategoryDisplayName = (category: string): string => {
  switch (category) {
    case 'performance': return 'Performance';
    case 'practice': return 'Practice';
    case 'recording': return 'Recording';
    case 'financial': return 'Financial';
    case 'band': return 'Band';
    default: return 'Other';
  }
};

export default LinkedGoalCreation;