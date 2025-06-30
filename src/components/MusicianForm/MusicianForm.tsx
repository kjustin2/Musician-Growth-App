import React, { useState, useCallback } from 'react';
import { MusicianProfile } from '@/core/types';
import { useSetPage, useSetProfile, useSetLoading } from '@/context/AppContext';
import Button from '@/components/common/Button';
import ProgressBar from '@/components/common/ProgressBar';
import { 
  INSTRUMENTS, 
  MARKETING_OPTIONS, 
  FORM_STEPS, 
  STEP_LABELS, 
  RECOMMENDATION_CONFIG,
  EXPERIENCE_LIMITS 
} from '@/core/constants';
import './MusicianForm.css';

const MusicianForm: React.FC = () => {
  const setPage = useSetPage();
  const setProfile = useSetProfile();
  const setLoading = useSetLoading();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<MusicianProfile>>({
    instrument: '',
    performanceFrequency: undefined,
    crowdSize: undefined,
    yearsOfExperience: 0,
    marketingEfforts: []
  });

  const [customInstrument, setCustomInstrument] = useState({
    isOther: false,
    value: ''
  });

  const handleInstrumentChange = useCallback((instrument: string) => {
    if (instrument === 'Other') {
      setCustomInstrument({ isOther: true, value: '' });
      setFormData(prev => ({ ...prev, instrument: '' }));
    } else {
      setCustomInstrument({ isOther: false, value: '' });
      setFormData(prev => ({ ...prev, instrument }));
    }
  }, []);

  const handleCustomInstrumentChange = useCallback((value: string) => {
    setCustomInstrument(prev => ({ ...prev, value }));
    setFormData(prev => ({ ...prev, instrument: value }));
  }, []);

  const handleMarketingChange = useCallback((optionId: string) => {
    setFormData(prev => {
      const currentEfforts = prev.marketingEfforts || [];
      const newEfforts = currentEfforts.includes(optionId)
        ? currentEfforts.filter(id => id !== optionId)
        : [...currentEfforts, optionId];
      
      return { ...prev, marketingEfforts: newEfforts };
    });
  }, []);

  const handleNext = useCallback(() => {
    if (currentStep < FORM_STEPS.TOTAL) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep]);

  const handleBack = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const handleSubmit = useCallback(async () => {
    if (!isFormValid()) {
      console.error('Form validation failed');
      return;
    }

    const finalProfile: MusicianProfile = {
      instrument: customInstrument.isOther ? customInstrument.value : formData.instrument!,
      performanceFrequency: formData.performanceFrequency!,
      crowdSize: formData.crowdSize!,
      yearsOfExperience: formData.yearsOfExperience!,
      marketingEfforts: formData.marketingEfforts!
    };

    setProfile(finalProfile);
    setLoading(true);
    
    // Simulate processing time
    setTimeout(() => {
      setLoading(false);
      setPage('results');
    }, RECOMMENDATION_CONFIG.LOADING_DELAY_MS);
  }, [customInstrument, formData, setProfile, setLoading, setPage]);

  const isFormValid = useCallback((): boolean => {
    const hasValidInstrument = customInstrument.isOther 
      ? customInstrument.value.trim().length > 0
      : Boolean(formData.instrument);
    
    return (
      hasValidInstrument &&
      Boolean(formData.performanceFrequency) &&
      Boolean(formData.crowdSize) &&
      typeof formData.yearsOfExperience === 'number' &&
      formData.yearsOfExperience >= EXPERIENCE_LIMITS.MIN &&
      formData.yearsOfExperience <= EXPERIENCE_LIMITS.MAX &&
      Boolean(formData.marketingEfforts?.length)
    );
  }, [customInstrument, formData]);

  const isStepValid = useCallback(() => {
    switch (currentStep) {
      case FORM_STEPS.INSTRUMENT:
        return customInstrument.isOther 
          ? customInstrument.value.trim().length > 0
          : Boolean(formData.instrument);
      case FORM_STEPS.PERFORMANCE_FREQUENCY:
        return Boolean(formData.performanceFrequency);
      case FORM_STEPS.CROWD_SIZE:
        return Boolean(formData.crowdSize);
      case FORM_STEPS.EXPERIENCE:
        return typeof formData.yearsOfExperience === 'number' &&
               formData.yearsOfExperience >= EXPERIENCE_LIMITS.MIN &&
               formData.yearsOfExperience <= EXPERIENCE_LIMITS.MAX;
      case FORM_STEPS.MARKETING_EFFORTS:
        return Boolean(formData.marketingEfforts?.length);
      default:
        return false;
    }
  }, [currentStep, customInstrument, formData]);

  return (
    <div className="musician-form">
      <div className="container">
        <div className="form-container">
          <ProgressBar 
            currentStep={currentStep} 
            totalSteps={FORM_STEPS.TOTAL} 
            labels={[...STEP_LABELS]}
          />

          <div className="form-content">
            {/* Step 1: Instrument */}
            {currentStep === FORM_STEPS.INSTRUMENT && (
              <div className="form-step">
                <h2>What's your primary instrument?</h2>
                <div className="instrument-grid">
                  {INSTRUMENTS.map(instrument => (
                    <button
                      key={instrument}
                      className={`instrument-option ${formData.instrument === instrument ? 'selected' : ''}`}
                      onClick={() => handleInstrumentChange(instrument)}
                      type="button"
                      aria-pressed={formData.instrument === instrument}
                    >
                      {instrument}
                    </button>
                  ))}
                </div>
                {customInstrument.isOther && (
                  <input
                    type="text"
                    className="other-instrument-input"
                    placeholder="Please specify your instrument"
                    value={customInstrument.value}
                    onChange={(e) => handleCustomInstrumentChange(e.target.value)}
                    aria-label="Custom instrument name"
                    autoFocus
                  />
                )}
              </div>
            )}

            {/* Step 2: Performance Frequency */}
            {currentStep === FORM_STEPS.PERFORMANCE_FREQUENCY && (
              <div className="form-step">
                <h2>How often do you perform live?</h2>
                <div className="radio-group" role="radiogroup" aria-labelledby="performance-frequency-title">
                  <label className="radio-option">
                    <input
                      type="radio"
                      name="frequency"
                      value="never"
                      checked={formData.performanceFrequency === 'never'}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        performanceFrequency: e.target.value as MusicianProfile['performanceFrequency']
                      }))}
                    />
                    <span>Never / Just Practice</span>
                  </label>
                  <label className="radio-option">
                    <input
                      type="radio"
                      name="frequency"
                      value="yearly"
                      checked={formData.performanceFrequency === 'yearly'}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        performanceFrequency: e.target.value as MusicianProfile['performanceFrequency']
                      }))}
                    />
                    <span>A few times a year</span>
                  </label>
                  <label className="radio-option">
                    <input
                      type="radio"
                      name="frequency"
                      value="monthly"
                      checked={formData.performanceFrequency === 'monthly'}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        performanceFrequency: e.target.value as MusicianProfile['performanceFrequency']
                      }))}
                    />
                    <span>Monthly</span>
                  </label>
                  <label className="radio-option">
                    <input
                      type="radio"
                      name="frequency"
                      value="weekly"
                      checked={formData.performanceFrequency === 'weekly'}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        performanceFrequency: e.target.value as MusicianProfile['performanceFrequency']
                      }))}
                    />
                    <span>Weekly</span>
                  </label>
                  <label className="radio-option">
                    <input
                      type="radio"
                      name="frequency"
                      value="multiple"
                      checked={formData.performanceFrequency === 'multiple'}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        performanceFrequency: e.target.value as MusicianProfile['performanceFrequency']
                      }))}
                    />
                    <span>Multiple times a week</span>
                  </label>
                </div>
              </div>
            )}

            {/* Step 3: Crowd Size */}
            {currentStep === FORM_STEPS.CROWD_SIZE && (
              <div className="form-step">
                <h2>What's your average crowd size?</h2>
                <div className="radio-group" role="radiogroup" aria-labelledby="crowd-size-title">
                  <label className="radio-option">
                    <input
                      type="radio"
                      name="crowd"
                      value="1-10"
                      checked={formData.crowdSize === '1-10'}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        crowdSize: e.target.value as MusicianProfile['crowdSize']
                      }))}
                    />
                    <span>1-10 people</span>
                  </label>
                  <label className="radio-option">
                    <input
                      type="radio"
                      name="crowd"
                      value="10-50"
                      checked={formData.crowdSize === '10-50'}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        crowdSize: e.target.value as MusicianProfile['crowdSize']
                      }))}
                    />
                    <span>10-50 people</span>
                  </label>
                  <label className="radio-option">
                    <input
                      type="radio"
                      name="crowd"
                      value="50-100"
                      checked={formData.crowdSize === '50-100'}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        crowdSize: e.target.value as MusicianProfile['crowdSize']
                      }))}
                    />
                    <span>50-100 people</span>
                  </label>
                  <label className="radio-option">
                    <input
                      type="radio"
                      name="crowd"
                      value="100-500"
                      checked={formData.crowdSize === '100-500'}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        crowdSize: e.target.value as MusicianProfile['crowdSize']
                      }))}
                    />
                    <span>100-500 people</span>
                  </label>
                  <label className="radio-option">
                    <input
                      type="radio"
                      name="crowd"
                      value="500+"
                      checked={formData.crowdSize === '500+'}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        crowdSize: e.target.value as MusicianProfile['crowdSize']
                      }))}
                    />
                    <span>500+ people</span>
                  </label>
                </div>
              </div>
            )}

            {/* Step 4: Years of Experience */}
            {currentStep === FORM_STEPS.EXPERIENCE && (
              <div className="form-step">
                <h2>How many years have you been playing?</h2>
                <div className="experience-input">
                  <input
                    type="number"
                    min={EXPERIENCE_LIMITS.MIN}
                    max={EXPERIENCE_LIMITS.MAX}
                    value={formData.yearsOfExperience || ''}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (!isNaN(value) && value >= EXPERIENCE_LIMITS.MIN && value <= EXPERIENCE_LIMITS.MAX) {
                        setFormData(prev => ({ ...prev, yearsOfExperience: value }));
                      }
                    }}
                    className="years-input"
                    aria-label="Years of experience"
                  />
                  <span className="years-label">years</span>
                </div>
                <input
                  type="range"
                  min={EXPERIENCE_LIMITS.MIN}
                  max={EXPERIENCE_LIMITS.MAX}
                  value={formData.yearsOfExperience || 0}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    setFormData(prev => ({ ...prev, yearsOfExperience: value }));
                  }}
                  className="years-slider"
                  aria-label="Years of experience slider"
                />
              </div>
            )}

            {/* Step 5: Marketing Efforts */}
            {currentStep === FORM_STEPS.MARKETING_EFFORTS && (
              <div className="form-step">
                <h2>What marketing efforts are you currently using?</h2>
                <p className="step-subtitle">Select all that apply</p>
                <div className="checkbox-group" role="group" aria-labelledby="marketing-efforts-title">
                  {MARKETING_OPTIONS.map(option => (
                    <label key={option.id} className="checkbox-option">
                      <input
                        type="checkbox"
                        checked={formData.marketingEfforts?.includes(option.id) || false}
                        onChange={() => handleMarketingChange(option.id)}
                        aria-describedby={`marketing-${option.id}-desc`}
                      />
                      <span id={`marketing-${option.id}-desc`}>{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="form-navigation">
            {currentStep > 1 && (
              <Button
                variant="outline"
                onClick={handleBack}
                type="button"
              >
                Back
              </Button>
            )}
            {currentStep < FORM_STEPS.TOTAL ? (
              <Button
                variant="primary"
                onClick={handleNext}
                disabled={!isStepValid()}
                type="button"
              >
                Next
              </Button>
            ) : (
              <Button
                variant="secondary"
                onClick={handleSubmit}
                disabled={!isStepValid()}
                type="button"
              >
                Get My Advice
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicianForm;