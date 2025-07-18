import React, { useState, useEffect } from 'react';
import { MusicianProfile, PerformanceRecord, BandMember, SetList, Band } from '../../core/types';
import { useApp } from '../../context/AppContext';
import { storageService } from '../../services/storageService';
import { generateId } from '../../utils';
import BandSelector from '../GoalManagement/BandSelector';

interface PerformanceEntryProps {
  profile: MusicianProfile;
}

const PerformanceEntry: React.FC<PerformanceEntryProps> = ({ profile }) => {
  const { dispatch } = useApp();
  const [loading, setLoading] = useState(false);
  const [bands, setBands] = useState<Band[]>([]);
  const [bandMembers, setBandMembers] = useState<BandMember[]>([]);
  const [setLists, setSetLists] = useState<SetList[]>([]);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    venueName: '',
    venueType: 'bar' as PerformanceRecord['venueType'],
    audienceSize: '',
    duration: '',
    payment: '',
    notes: '',
    setlist: '',
    bandMembersPresent: [] as string[],
    setListUsed: '',
    bandId: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadBandData();
  }, [profile.id]);

  const loadBandData = async () => {
    try {
      const [bandsData, bandMembersData, setListsData] = await Promise.all([
        storageService.getBands(profile.id),
        storageService.getBandMembers ? storageService.getBandMembers(profile.id) : Promise.resolve([]),
        storageService.getSetLists ? storageService.getSetLists(profile.id) : Promise.resolve([])
      ]);
      setBands(bandsData);
      setBandMembers(bandMembersData);
      setSetLists(setListsData);
    } catch (error) {
      console.error('Error loading band data:', error);
    }
  };

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
        setlist: formData.setlist.trim() ? formData.setlist.split(',').map(s => s.trim()) : undefined,
        bandMembersPresent: formData.bandMembersPresent.length > 0 ? formData.bandMembersPresent : undefined,
        setListUsed: formData.setListUsed || undefined,
        bandId: formData.bandId || undefined
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
        setlist: '',
        bandMembersPresent: [],
        setListUsed: '',
        bandId: ''
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

  const handleInputChange = (field: string, value: string | string[]) => {
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

        {/* Band Selection */}
        <BandSelector
          bands={bands}
          selectedBands={formData.bandId ? [formData.bandId] : []}
          onBandSelect={(bandIds) => handleInputChange('bandId', bandIds[0] || '')}
          allowMultiple={false}
          label="Band (Optional)"
        />

        <div className="form-group">
          <label htmlFor="setListUsed">Set List Used</label>
          <select
            id="setListUsed"
            value={formData.setListUsed}
            onChange={(e) => handleInputChange('setListUsed', e.target.value)}
          >
            <option value="">Select a set list (optional)</option>
            {setLists.map(setList => (
              <option key={setList.id} value={setList.id}>
                {setList.name} ({setList.songs.length} songs)
              </option>
            ))}
          </select>
          <small className="form-help">Choose from your saved set lists</small>
        </div>

        <div className="form-group">
          <label htmlFor="setlist">Custom Setlist (comma-separated songs)</label>
          <input
            type="text"
            id="setlist"
            value={formData.setlist}
            onChange={(e) => handleInputChange('setlist', e.target.value)}
            placeholder="Song 1, Song 2, Song 3"
          />
          <small className="form-help">Optional: List songs if not using a saved set list</small>
        </div>

        <div className="form-group">
          <label>Band Members Present</label>
          <div className="checkbox-group">
            {bandMembers.length > 0 ? (
              bandMembers.map(member => (
                <label key={member.id} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.bandMembersPresent.includes(member.id)}
                    onChange={(e) => {
                      const newBandMembers = e.target.checked
                        ? [...formData.bandMembersPresent, member.id]
                        : formData.bandMembersPresent.filter(id => id !== member.id);
                      handleInputChange('bandMembersPresent', newBandMembers);
                    }}
                  />
                  <span className="checkmark"></span>
                  {member.name} ({member.instrument})
                </label>
              ))
            ) : (
              <p className="no-band-members">
                No band members found. <br />
                <small>Add band members from the dashboard to track their participation.</small>
              </p>
            )}
          </div>
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