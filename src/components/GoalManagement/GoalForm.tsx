import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Goal, Band } from '../../core/types';
import { storageService } from '../../services/storageService';
import { useApp } from '../../context/AppContext';
import GoalMetricSelector from './GoalMetricSelector';
import BandSelector from './BandSelector';

interface GoalFormProps {
  goal?: Goal;
  onSubmit: (goalData: Omit<Goal, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

const GoalForm: React.FC<GoalFormProps> = ({ goal, onSubmit, onCancel }) => {
  const { state } = useApp();
  const [formData, setFormData] = useState({
    title: goal?.title || '',
    description: goal?.description || '',
    type: goal?.type || 'custom' as Goal['type'],
    targetValue: goal?.targetValue?.toString() || '',
    currentValue: goal?.currentValue?.toString() || '0',
    deadline: goal?.deadline ? goal.deadline.toISOString().split('T')[0] : '',
    status: goal?.status || 'active' as Goal['status'],
    linkedMetric: goal?.linkedMetric || '',
    autoUpdate: goal?.autoUpdate ?? true,
    bandSpecific: goal?.bandSpecific || false,
    selectedBands: goal?.selectedBands || []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [bands, setBands] = useState<Band[]>([]);
  const [bandsLoading, setBandsLoading] = useState(false);
  const [bandsError, setBandsError] = useState<string | null>(null);
  
  // Memoize expensive metric calculations
  const currentMetrics = useMemo(() => ({
    totalShows: state.musicianProfile?.shows?.length || 0,
    totalPracticeTime: state.musicianProfile?.practiceLog?.reduce((sum, session) => sum + session.duration, 0) || 0,
    totalEarnings: state.musicianProfile?.shows?.reduce((sum, show) => sum + show.payment, 0) || 0,
    totalRecordings: state.musicianProfile?.recordings?.length || 0
  }), [state.musicianProfile]);

  useEffect(() => {
    if (state.musicianProfile?.id) {
      loadBands(state.musicianProfile.id);
    }
  }, [state.musicianProfile?.id]);

  const loadBands = useCallback(async (profileId: string) => {
    setBandsLoading(true);
    setBandsError(null);
    try {
      const bandsData = await storageService.getBands(profileId);
      setBands(bandsData);
    } catch (error) {
      console.error('Error loading bands:', error);
      setBandsError('Failed to load bands. Please try again.');
    } finally {
      setBandsLoading(false);
    }
  }, []);

  const goalTypes = [
    { value: 'performance', label: 'Performance', icon: '🎤' },
    { value: 'skill', label: 'Skill Development', icon: '🎯' },
    { value: 'financial', label: 'Financial', icon: '💰' },
    { value: 'recording', label: 'Recording', icon: '🎵' },
    { value: 'custom', label: 'Custom', icon: '⭐' }
  ];

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Goal title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Goal description is required';
    }

    if (formData.targetValue && parseFloat(formData.targetValue) <= 0) {
      newErrors.targetValue = 'Target value must be positive';
    }

    if (parseFloat(formData.currentValue) < 0) {
      newErrors.currentValue = 'Current value cannot be negative';
    }

    if (formData.deadline) {
      const deadline = new Date(formData.deadline);
      if (deadline <= new Date()) {
        newErrors.deadline = 'Deadline must be in the future';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Set default linked metric based on goal type if not already set
    let linkedMetric = formData.linkedMetric;
    if (!linkedMetric && formData.type !== 'custom') {
      switch (formData.type) {
        case 'performance':
          linkedMetric = 'show_count';
          break;
        case 'skill':
          linkedMetric = 'practice_time';
          break;
        case 'financial':
          linkedMetric = 'total_earnings';
          break;
        case 'recording':
          linkedMetric = 'recording_count';
          break;
        default:
          linkedMetric = 'manual_tracking';
      }
    }

    const goalData: Omit<Goal, 'id' | 'createdAt'> = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      type: formData.type,
      targetValue: formData.targetValue ? parseFloat(formData.targetValue) : undefined,
      currentValue: parseFloat(formData.currentValue),
      deadline: formData.deadline ? new Date(formData.deadline) : undefined,
      status: formData.status,
      linkedMetric: linkedMetric || 'manual_tracking',
      autoUpdate: formData.type === 'custom' ? false : formData.autoUpdate,
      bandSpecific: formData.bandSpecific,
      selectedBands: formData.selectedBands,
      progressHistory: goal?.progressHistory || [],
      lastAutoUpdate: goal?.lastAutoUpdate
    };

    onSubmit(goalData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const getTypeDescription = (type: Goal['type']): string => {
    switch (type) {
      case 'performance':
        return 'Track show-related goals like number of performances, audience size, or venue types';
      case 'skill':
        return 'Develop musical skills like mastering techniques, learning songs, or improving areas';
      case 'financial':
        return 'Set earning targets from performances, teaching, or other musical activities';
      case 'recording':
        return 'Create and release music, including albums, singles, or demo recordings';
      case 'custom':
        return 'Any other musical goal that matters to your journey';
      default:
        return '';
    }
  };

  return (
    <div className="goal-form">
      <div className="form-header">
        <h2>{goal ? 'Edit Goal' : 'Create New Goal'}</h2>
        <p>Set a clear, achievable goal to track your musical progress</p>
      </div>

      <form onSubmit={handleSubmit} className="goal-form-content">
        <div className="form-group">
          <label htmlFor="title">Goal Title *</label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className={errors.title ? 'error' : ''}
            placeholder="e.g., Perform 20 shows this year"
            required
          />
          {errors.title && <span className="error-text">{errors.title}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="type">Goal Type *</label>
          <div className="goal-type-grid">
            {goalTypes.map(type => (
              <label key={type.value} className="goal-type-option">
                <input
                  type="radio"
                  name="type"
                  value={type.value}
                  checked={formData.type === type.value}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                />
                <div className="goal-type-content">
                  <div className="goal-type-icon">{type.icon}</div>
                  <div className="goal-type-label">{type.label}</div>
                </div>
              </label>
            ))}
          </div>
          <p className="goal-type-description">
            {getTypeDescription(formData.type)}
          </p>
        </div>

        <div className="form-group">
          <label htmlFor="description">Description *</label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className={errors.description ? 'error' : ''}
            placeholder="Describe your goal in detail. What do you want to achieve and why?"
            rows={4}
            required
          />
          {errors.description && <span className="error-text">{errors.description}</span>}
        </div>

        {/* Goal Metric Selector */}
        <GoalMetricSelector
          goalType={formData.type}
          onMetricSelect={(metric) => {
            setFormData(prev => ({
              ...prev,
              linkedMetric: metric.id,
              autoUpdate: metric.autoUpdate
            }));
          }}
          currentMetrics={currentMetrics}
          selectedMetric={formData.linkedMetric}
        />

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="targetValue">Target Value</label>
            <input
              type="number"
              id="targetValue"
              value={formData.targetValue}
              onChange={(e) => handleInputChange('targetValue', e.target.value)}
              className={errors.targetValue ? 'error' : ''}
              placeholder="e.g., 20"
              min="0"
              step="0.01"
            />
            {errors.targetValue && <span className="error-text">{errors.targetValue}</span>}
            <small className="form-help">Optional: Set a numeric target to track progress</small>
          </div>

          <div className="form-group">
            <label htmlFor="currentValue">Current Progress</label>
            <input
              type="number"
              id="currentValue"
              value={formData.currentValue}
              onChange={(e) => handleInputChange('currentValue', e.target.value)}
              className={errors.currentValue ? 'error' : ''}
              placeholder="0"
              min="0"
              step="0.01"
            />
            {errors.currentValue && <span className="error-text">{errors.currentValue}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="deadline">Deadline</label>
            <input
              type="date"
              id="deadline"
              value={formData.deadline}
              onChange={(e) => handleInputChange('deadline', e.target.value)}
              className={errors.deadline ? 'error' : ''}
            />
            {errors.deadline && <span className="error-text">{errors.deadline}</span>}
            <small className="form-help">Optional: Set a deadline to stay motivated</small>
          </div>

          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
            >
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="paused">Paused</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Band-Specific Goal Options */}
        {(formData.type === 'performance' || formData.type === 'financial') && bands.length > 0 && (
          <div className="form-group">
            <div className="form-check">
              <input
                type="checkbox"
                id="bandSpecific"
                checked={formData.bandSpecific}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  bandSpecific: e.target.checked,
                  selectedBands: e.target.checked ? prev.selectedBands : []
                }))}
                className="form-check-input"
              />
              <label htmlFor="bandSpecific" className="form-check-label">
                Make this a band-specific goal
              </label>
              <small className="form-text text-muted d-block">
                Track progress for specific bands only, rather than all your musical activities
              </small>
            </div>
          </div>
        )}

        {/* Band Selection */}
        {formData.bandSpecific && (
          <>
            {bandsLoading && (
              <div className="text-center py-3">
                <div className="spinner-border spinner-border-sm me-2" role="status">
                  <span className="visually-hidden">Loading bands...</span>
                </div>
                Loading bands...
              </div>
            )}
            {bandsError && (
              <div className="alert alert-warning" role="alert">
                <i className="fas fa-exclamation-triangle me-2"></i>
                {bandsError}
              </div>
            )}
            {!bandsLoading && !bandsError && bands.length > 0 && (
              <BandSelector
                bands={bands}
                selectedBands={formData.selectedBands}
                onBandSelect={(bandIds) => setFormData(prev => ({ ...prev, selectedBands: bandIds }))}
                allowMultiple={true}
                required={true}
                label="Select Bands for this Goal"
              />
            )}
            {!bandsLoading && !bandsError && bands.length === 0 && (
              <div className="alert alert-info" role="alert">
                <i className="fas fa-info-circle me-2"></i>
                No bands found. Create bands first to enable band-specific goals.
              </div>
            )}
          </>
        )}

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
          >
            {goal ? 'Update Goal' : 'Create Goal'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default GoalForm;