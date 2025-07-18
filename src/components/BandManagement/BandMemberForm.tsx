import React, { useState, useCallback } from 'react';
import { BandMember } from '../../core/types';
import { INSTRUMENTS } from '../../core/constants';

interface BandMemberFormProps {
  onSubmit: (member: Omit<BandMember, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  initialData?: Partial<BandMember>;
  profileId: string;
}

const BandMemberForm: React.FC<BandMemberFormProps> = ({ 
  onSubmit, 
  onCancel, 
  initialData, 
  profileId 
}) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    instrument: initialData?.instrument || '',
    yearsExperience: initialData?.yearsExperience || 0,
    joinDate: initialData?.joinDate ? new Date(initialData.joinDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
  });

  const [customInstrument, setCustomInstrument] = useState({
    isOther: initialData?.instrument ? !INSTRUMENTS.includes(initialData.instrument as any) : false,
    value: initialData?.instrument && !INSTRUMENTS.includes(initialData.instrument as any) ? initialData.instrument : ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    const instrument = customInstrument.isOther ? customInstrument.value : formData.instrument;
    if (!instrument.trim()) {
      newErrors.instrument = 'Instrument is required';
    }

    if (formData.yearsExperience < 0 || formData.yearsExperience > 50) {
      newErrors.yearsExperience = 'Years of experience must be between 0 and 50';
    }

    if (!formData.joinDate) {
      newErrors.joinDate = 'Join date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, customInstrument]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const instrument = customInstrument.isOther ? customInstrument.value.trim() : formData.instrument;
    
    const memberData: Omit<BandMember, 'id' | 'createdAt' | 'updatedAt'> = {
      name: formData.name.trim(),
      instrument,
      yearsExperience: formData.yearsExperience,
      joinDate: new Date(formData.joinDate),
      profileId,
      participationHistory: initialData?.participationHistory || []
    };

    onSubmit(memberData);
  }, [formData, customInstrument, profileId, validateForm, onSubmit, initialData]);

  const handleInstrumentChange = useCallback((value: string) => {
    if (value === 'Other') {
      setCustomInstrument({ isOther: true, value: '' });
      setFormData(prev => ({ ...prev, instrument: '' }));
    } else {
      setCustomInstrument({ isOther: false, value: '' });
      setFormData(prev => ({ ...prev, instrument: value }));
    }
  }, []);

  const handleCustomInstrumentChange = useCallback((value: string) => {
    setCustomInstrument(prev => ({ ...prev, value }));
  }, []);

  return (
    <div className="band-member-form">
      <div className="card">
        <div className="card-header">
          <h3 className="card-title mb-0">
            {initialData ? 'Edit Band Member' : 'Add Band Member'}
          </h3>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="name" className="form-label">
                Name <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                id="name"
                className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter band member's name"
              />
              {errors.name && <div className="invalid-feedback">{errors.name}</div>}
            </div>

            <div className="mb-3">
              <label htmlFor="instrument" className="form-label">
                Instrument <span className="text-danger">*</span>
              </label>
              <select
                id="instrument"
                className={`form-select ${errors.instrument ? 'is-invalid' : ''}`}
                value={customInstrument.isOther ? 'Other' : formData.instrument}
                onChange={(e) => handleInstrumentChange(e.target.value)}
              >
                <option value="">Select an instrument</option>
                {INSTRUMENTS.map(instrument => (
                  <option key={instrument} value={instrument}>
                    {instrument}
                  </option>
                ))}
                <option value="Other">Other</option>
              </select>
              
              {customInstrument.isOther && (
                <input
                  type="text"
                  className={`form-control mt-2 ${errors.instrument ? 'is-invalid' : ''}`}
                  placeholder="Enter instrument name"
                  value={customInstrument.value}
                  onChange={(e) => handleCustomInstrumentChange(e.target.value)}
                />
              )}
              {errors.instrument && <div className="invalid-feedback">{errors.instrument}</div>}
            </div>

            <div className="mb-3">
              <label htmlFor="experience" className="form-label">
                Years of Experience <span className="text-danger">*</span>
              </label>
              <input
                type="number"
                id="experience"
                className={`form-control ${errors.yearsExperience ? 'is-invalid' : ''}`}
                value={formData.yearsExperience}
                onChange={(e) => setFormData(prev => ({ ...prev, yearsExperience: parseInt(e.target.value) || 0 }))}
                min="0"
                max="50"
                placeholder="0"
              />
              {errors.yearsExperience && <div className="invalid-feedback">{errors.yearsExperience}</div>}
            </div>

            <div className="mb-3">
              <label htmlFor="joinDate" className="form-label">
                Join Date <span className="text-danger">*</span>
              </label>
              <input
                type="date"
                id="joinDate"
                className={`form-control ${errors.joinDate ? 'is-invalid' : ''}`}
                value={formData.joinDate}
                onChange={(e) => setFormData(prev => ({ ...prev, joinDate: e.target.value }))}
                max={new Date().toISOString().split('T')[0]}
              />
              {errors.joinDate && <div className="invalid-feedback">{errors.joinDate}</div>}
            </div>

            <div className="d-flex gap-2">
              <button type="submit" className="btn btn-primary">
                {initialData ? 'Update Member' : 'Add Member'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={onCancel}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BandMemberForm;