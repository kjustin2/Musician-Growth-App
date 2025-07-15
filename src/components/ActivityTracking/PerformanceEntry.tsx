import React, { useState } from 'react';
import { MusicianProfile, PerformanceRecord } from '../../core/types';
import { useApp } from '../../context/AppContext';
import { storageService } from '../../services/storageService';
import { generateId } from '../../utils';

interface PerformanceEntryProps {
  profile: MusicianProfile;
}

const PerformanceEntry: React.FC<PerformanceEntryProps> = ({ profile }) => {
  const { dispatch } = useApp();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    venueName: '',
    venueType: 'bar' as PerformanceRecord['venueType'],
    audienceSize: '',
    duration: '',
    payment: '',
    notes: '',
    setlist: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.venueName.trim()) {
      newErrors.venueName = 'Venue name is required';
    }

    if (!formData.audienceSize || parseInt(formData.audienceSize) < 0) {
      newErrors.audienceSize = 'Please enter a valid audience size';
    }

    if (!formData.duration || parseInt(formData.duration) <= 0) {
      newErrors.duration = 'Please enter a valid duration in minutes';
    }

    if (!formData.payment || parseFloat(formData.payment) < 0) {
      newErrors.payment = 'Please enter a valid payment amount';
    }

    const performanceDate = new Date(formData.date + 'T12:00:00');
    if (performanceDate > new Date()) {
      newErrors.date = 'Performance date cannot be in the future';
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
      const performance: PerformanceRecord = {
        id: generateId(),
        date: new Date(formData.date + 'T12:00:00'),
        venueName: formData.venueName.trim(),
        venueType: formData.venueType,
        audienceSize: parseInt(formData.audienceSize),
        duration: parseInt(formData.duration),
        payment: parseFloat(formData.payment),
        notes: formData.notes.trim() || undefined,
        setlist: formData.setlist.trim() ? formData.setlist.split(',').map(s => s.trim()) : undefined
      };

      // Save to storage
      await storageService.addPerformance(profile.id, performance);

      // Update context
      dispatch({ type: 'ADD_PERFORMANCE', payload: performance });

      // Reset form
      setFormData({
        date: new Date().toISOString().split('T')[0],
        venueName: '',
        venueType: 'bar',
        audienceSize: '',
        duration: '',
        payment: '',
        notes: '',
        setlist: ''
      });

      // Show success message
      alert('Performance added successfully!');
    } catch (error) {
      console.error('Error adding performance:', error);
      alert('Failed to add performance. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="performance-entry">
      <div className="entry-header">
        <h2>Add Performance</h2>
        <p>Record details about your recent show</p>
      </div>

      <form onSubmit={handleSubmit} className="performance-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="date">Performance Date *</label>
            <input
              type="date"
              id="date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              className={errors.date ? 'error' : ''}
              required
            />
            {errors.date && <span className="error-text">{errors.date}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="venueName">Venue Name *</label>
            <input
              type="text"
              id="venueName"
              value={formData.venueName}
              onChange={(e) => handleInputChange('venueName', e.target.value)}
              className={errors.venueName ? 'error' : ''}
              placeholder="e.g., Blue Note Cafe"
              required
            />
            {errors.venueName && <span className="error-text">{errors.venueName}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="venueType">Venue Type</label>
            <select
              id="venueType"
              value={formData.venueType}
              onChange={(e) => handleInputChange('venueType', e.target.value)}
            >
              <option value="bar">Bar</option>
              <option value="restaurant">Restaurant</option>
              <option value="concert_hall">Concert Hall</option>
              <option value="festival">Festival</option>
              <option value="private_event">Private Event</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="audienceSize">Audience Size *</label>
            <input
              type="number"
              id="audienceSize"
              value={formData.audienceSize}
              onChange={(e) => handleInputChange('audienceSize', e.target.value)}
              className={errors.audienceSize ? 'error' : ''}
              placeholder="50"
              min="0"
              required
            />
            {errors.audienceSize && <span className="error-text">{errors.audienceSize}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="duration">Duration (minutes) *</label>
            <input
              type="number"
              id="duration"
              value={formData.duration}
              onChange={(e) => handleInputChange('duration', e.target.value)}
              className={errors.duration ? 'error' : ''}
              placeholder="90"
              min="1"
              required
            />
            {errors.duration && <span className="error-text">{errors.duration}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="payment">Payment ($) *</label>
            <input
              type="number"
              id="payment"
              value={formData.payment}
              onChange={(e) => handleInputChange('payment', e.target.value)}
              className={errors.payment ? 'error' : ''}
              placeholder="150.00"
              min="0"
              step="0.01"
              required
            />
            {errors.payment && <span className="error-text">{errors.payment}</span>}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="setlist">Setlist (comma-separated songs)</label>
          <input
            type="text"
            id="setlist"
            value={formData.setlist}
            onChange={(e) => handleInputChange('setlist', e.target.value)}
            placeholder="Song 1, Song 2, Song 3"
          />
          <small className="form-help">Optional: List the songs you performed</small>
        </div>

        <div className="form-group">
          <label htmlFor="notes">Notes</label>
          <textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            placeholder="How did the show go? Any memorable moments?"
            rows={4}
          />
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Adding Performance...' : 'Add Performance'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PerformanceEntry;