import React, { useState, useEffect } from 'react';
import { MusicianProfile, PracticeSession, BandMember } from '../../core/types';
import { useApp } from '../../context/AppContext';
import { storageService } from '../../services/storageService';
import { generateId } from '../../utils';
import { goalLinkingService } from '../../services/goalLinkingService';

interface PracticeEntryProps {
  profile: MusicianProfile;
}

const PracticeEntry: React.FC<PracticeEntryProps> = ({ profile }) => {
  const { dispatch } = useApp();
  const [loading, setLoading] = useState(false);
  const [bandMembers, setBandMembers] = useState<BandMember[]>([]);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    duration: '',
    focusAreas: [] as string[],
    customFocusArea: '',
    skillsWorkedOn: [] as string[],
    customSkill: '',
    notes: '',
    bandMembersPresent: [] as string[]
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadBandMembers();
  }, [profile.id]);

  const loadBandMembers = async () => {
    try {
      const bandMembersData = await storageService.getBandMembers(profile.id);
      setBandMembers(bandMembersData);
    } catch (error) {
      console.error('Error loading band members:', error);
    }
  };

  const predefinedFocusAreas = [
    'Scales',
    'Chords',
    'Rhythm',
    'Improvisation',
    'Technique',
    'Sight Reading',
    'Ear Training',
    'Song Learning',
    'Performance Preparation'
  ];

  const predefinedSkills = [
    'Fingering',
    'Timing',
    'Dynamics',
    'Articulation',
    'Intonation',
    'Expression',
    'Stage Presence',
    'Equipment Setup',
    'Music Theory'
  ];

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.duration || parseInt(formData.duration) <= 0) {
      newErrors.duration = 'Please enter a valid duration in minutes';
    }

    if (formData.focusAreas.length === 0) {
      newErrors.focusAreas = 'Please select at least one focus area';
    }

    const practiceDate = new Date(formData.date + 'T12:00:00');
    if (practiceDate > new Date()) {
      newErrors.date = 'Practice date cannot be in the future';
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
      const practiceSession: PracticeSession = {
        id: generateId(),
        date: new Date(formData.date + 'T12:00:00'),
        duration: parseInt(formData.duration),
        focusAreas: formData.focusAreas,
        skillsWorkedOn: formData.skillsWorkedOn,
        notes: formData.notes.trim() || undefined,
        bandMembersPresent: formData.bandMembersPresent.length > 0 ? formData.bandMembersPresent : undefined
      };

      // Save to storage
      await storageService.addPracticeSession(profile.id, practiceSession);

      // Update linked goals
      await goalLinkingService.updateGoalsForAction(profile.id, 'practice', practiceSession);

      // Update context
      dispatch({ type: 'ADD_PRACTICE_SESSION', payload: practiceSession });

      // Reset form
      setFormData({
        date: new Date().toISOString().split('T')[0],
        duration: '',
        focusAreas: [],
        customFocusArea: '',
        skillsWorkedOn: [],
        customSkill: '',
        notes: '',
        bandMembersPresent: []
      });

      // Show success message
      alert('Practice session logged successfully!');
    } catch (error) {
      console.error('Error adding practice session:', error);
      alert('Failed to log practice session. Please try again.');
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

  const handleFocusAreaToggle = (area: string) => {
    setFormData(prev => ({
      ...prev,
      focusAreas: prev.focusAreas.includes(area)
        ? prev.focusAreas.filter(a => a !== area)
        : [...prev.focusAreas, area]
    }));
    if (errors.focusAreas) {
      setErrors(prev => ({ ...prev, focusAreas: '' }));
    }
  };

  const handleSkillToggle = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skillsWorkedOn: prev.skillsWorkedOn.includes(skill)
        ? prev.skillsWorkedOn.filter(s => s !== skill)
        : [...prev.skillsWorkedOn, skill]
    }));
  };

  const handleAddCustomFocusArea = () => {
    const customArea = formData.customFocusArea.trim();
    if (customArea && !formData.focusAreas.includes(customArea)) {
      setFormData(prev => ({
        ...prev,
        focusAreas: [...prev.focusAreas, customArea],
        customFocusArea: ''
      }));
    }
  };

  const handleAddCustomSkill = () => {
    const customSkill = formData.customSkill.trim();
    if (customSkill && !formData.skillsWorkedOn.includes(customSkill)) {
      setFormData(prev => ({
        ...prev,
        skillsWorkedOn: [...prev.skillsWorkedOn, customSkill],
        customSkill: ''
      }));
    }
  };

  return (
    <div className="practice-entry">
      <div className="entry-header">
        <h2>Log Practice Session</h2>
        <p>Track your practice time and areas of focus</p>
      </div>

      <form onSubmit={handleSubmit} className="practice-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="date">Practice Date *</label>
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
            <label htmlFor="duration">Duration (minutes) *</label>
            <input
              type="number"
              id="duration"
              value={formData.duration}
              onChange={(e) => handleInputChange('duration', e.target.value)}
              className={errors.duration ? 'error' : ''}
              placeholder="60"
              min="1"
              required
            />
            {errors.duration && <span className="error-text">{errors.duration}</span>}
          </div>
        </div>

        <div className="form-group">
          <label>Focus Areas *</label>
          <div className="checkbox-grid">
            {predefinedFocusAreas.map(area => (
              <label key={area} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.focusAreas.includes(area)}
                  onChange={() => handleFocusAreaToggle(area)}
                />
                {area}
              </label>
            ))}
          </div>
          <div className="custom-input">
            <input
              type="text"
              value={formData.customFocusArea}
              onChange={(e) => handleInputChange('customFocusArea', e.target.value)}
              placeholder="Add custom focus area"
            />
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              onClick={handleAddCustomFocusArea}
              disabled={!formData.customFocusArea.trim()}
            >
              Add
            </button>
          </div>
          {errors.focusAreas && <span className="error-text">{errors.focusAreas}</span>}
        </div>

        <div className="form-group">
          <label>Skills Worked On</label>
          <div className="checkbox-grid">
            {predefinedSkills.map(skill => (
              <label key={skill} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.skillsWorkedOn.includes(skill)}
                  onChange={() => handleSkillToggle(skill)}
                />
                {skill}
              </label>
            ))}
          </div>
          <div className="custom-input">
            <input
              type="text"
              value={formData.customSkill}
              onChange={(e) => handleInputChange('customSkill', e.target.value)}
              placeholder="Add custom skill"
            />
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              onClick={handleAddCustomSkill}
              disabled={!formData.customSkill.trim()}
            >
              Add
            </button>
          </div>
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
                      setFormData(prev => ({ ...prev, bandMembersPresent: newBandMembers }));
                    }}
                  />
                  <span className="checkmark"></span>
                  {member.name} ({member.instrument})
                </label>
              ))
            ) : (
              <p className="no-band-members">
                No band members found. <br />
                <small>Add band members from the dashboard to track group practice sessions.</small>
              </p>
            )}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="notes">Practice Notes</label>
          <textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            placeholder="What went well? What needs improvement? Any breakthroughs?"
            rows={4}
          />
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Logging Session...' : 'Log Practice Session'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PracticeEntry;