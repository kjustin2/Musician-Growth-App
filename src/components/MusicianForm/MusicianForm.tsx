import React, { useReducer, useCallback, useMemo } from 'react';
import { MusicianProfile } from '@/core/types';
import { useSubmitProfile } from '@/context/AppContext';
import { createBasicProfile } from '@/utils/profileUtils';
import Button from '@/components/common/Button';
import ProgressBar from '@/components/common/ProgressBar';
import NameStep from './steps/NameStep';
import InstrumentStep from './steps/InstrumentStep';
import PerformanceStep from './steps/PerformanceStep';
import CrowdStep from './steps/CrowdStep';
import ExperienceStep from './steps/ExperienceStep';
import MarketingStep from './steps/MarketingStep';
import { FORM_STEPS, STEP_LABELS, EXPERIENCE_LIMITS } from '@/core/constants';
import './MusicianForm.css';

// Form state and actions
interface FormState {
  currentStep: number;
  formData: Partial<MusicianProfile>;
  customInstrument: {
    isOther: boolean;
    value: string;
  };
  isSubmitting: boolean;
}

type FormAction = 
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'SET_NAME', payload: string }
  | { type: 'SET_INSTRUMENT', payload: string }
  | { type: 'SET_CUSTOM_INSTRUMENT', payload: string }
  | { type: 'SET_PERFORMANCE_FREQUENCY', payload: MusicianProfile['performanceFrequency'] }
  | { type: 'SET_CROWD_SIZE', payload: MusicianProfile['crowdSize'] }
  | { type: 'SET_YEARS_OF_EXPERIENCE', payload: number }
  | { type: 'TOGGLE_MARKETING_EFFORT', payload: string }
  | { type: 'SET_SUBMITTING', payload: boolean };

const initialState: FormState = {
  currentStep: 1,
  formData: {
    name: '',
    instrument: '',
    performanceFrequency: undefined,
    crowdSize: undefined,
    yearsOfExperience: 0,
    marketingEfforts: []
  },
  customInstrument: {
    isOther: false,
    value: ''
  },
  isSubmitting: false
};

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'NEXT_STEP':
      return { ...state, currentStep: Math.min(state.currentStep + 1, FORM_STEPS.TOTAL) };
    case 'PREV_STEP':
      return { ...state, currentStep: Math.max(state.currentStep - 1, 1) };
    case 'SET_NAME':
      return { ...state, formData: { ...state.formData, name: action.payload } };
    case 'SET_INSTRUMENT':
      if (action.payload === 'Other') {
        return { ...state, customInstrument: { isOther: true, value: '' }, formData: { ...state.formData, instrument: '' } };
      } else {
        return { ...state, customInstrument: { isOther: false, value: '' }, formData: { ...state.formData, instrument: action.payload } };
      }
    case 'SET_CUSTOM_INSTRUMENT':
      return { ...state, customInstrument: { ...state.customInstrument, value: action.payload }, formData: { ...state.formData, instrument: action.payload } };
    case 'SET_PERFORMANCE_FREQUENCY':
      return { ...state, formData: { ...state.formData, performanceFrequency: action.payload } };
    case 'SET_CROWD_SIZE':
      return { ...state, formData: { ...state.formData, crowdSize: action.payload } };
    case 'SET_YEARS_OF_EXPERIENCE':
      return { ...state, formData: { ...state.formData, yearsOfExperience: action.payload } };
    case 'TOGGLE_MARKETING_EFFORT': {
      const currentEfforts = state.formData.marketingEfforts || [];
      const newEfforts = currentEfforts.includes(action.payload)
        ? currentEfforts.filter(id => id !== action.payload)
        : [...currentEfforts, action.payload];
      return { ...state, formData: { ...state.formData, marketingEfforts: newEfforts } };
    }
    case 'SET_SUBMITTING':
      return { ...state, isSubmitting: action.payload };
    default:
      return state;
  }
}

const MusicianForm: React.FC = () => {
  const submitProfile = useSubmitProfile();

  const [state, dispatch] = useReducer(formReducer, initialState);
  const { currentStep, formData, customInstrument, isSubmitting } = state;

  const handleSubmit = useCallback(async () => {
    if (isSubmitting) return; // Prevent double submission
    
    try {
      dispatch({ type: 'SET_SUBMITTING', payload: true });
      
      // Validate required fields before submission
      if (!formData.name?.trim() || 
          !formData.performanceFrequency || 
          !formData.crowdSize || 
          typeof formData.yearsOfExperience !== 'number' ||
          !formData.marketingEfforts?.length) {
        console.error('Form validation failed during submission');
        return;
      }

      const instrument = customInstrument.isOther ? customInstrument.value : formData.instrument;
      if (!instrument?.trim()) {
        console.error('Instrument validation failed during submission');
        return;
      }

      const finalProfile = createBasicProfile({
        name: formData.name.trim(),
        instrument: instrument.trim(),
        performanceFrequency: formData.performanceFrequency,
        crowdSize: formData.crowdSize,
        yearsOfExperience: formData.yearsOfExperience,
        marketingEfforts: formData.marketingEfforts
      });

      await submitProfile(finalProfile);
    } catch (error) {
      console.error('Failed to submit profile:', error);
      // In a real app, you'd want to show user-friendly error messages
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  }, [customInstrument, formData, submitProfile, isSubmitting]);

  const isStepValid = useCallback(() => {
    switch (currentStep) {
      case FORM_STEPS.NAME:
        return Boolean(formData.name?.trim().length);
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
            {useMemo(() => {
              switch (currentStep) {
                case FORM_STEPS.NAME:
                  return (
                    <NameStep 
                      name={formData.name || ''} 
                      onNameChange={(name) => dispatch({ type: 'SET_NAME', payload: name })}
                    />
                  );
                case FORM_STEPS.INSTRUMENT:
                  return (
                    <InstrumentStep 
                      instrument={formData.instrument || ''} 
                      customInstrument={customInstrument} 
                      onInstrumentChange={(instrument) => dispatch({ type: 'SET_INSTRUMENT', payload: instrument })} 
                      onCustomInstrumentChange={(value) => dispatch({ type: 'SET_CUSTOM_INSTRUMENT', payload: value })}
                    />
                  );
                case FORM_STEPS.PERFORMANCE_FREQUENCY:
                  return (
                    <PerformanceStep 
                      performanceFrequency={formData.performanceFrequency}
                      onPerformanceFrequencyChange={(value) => dispatch({ type: 'SET_PERFORMANCE_FREQUENCY', payload: value })}
                    />
                  );
                case FORM_STEPS.CROWD_SIZE:
                  return (
                    <CrowdStep 
                      crowdSize={formData.crowdSize}
                      onCrowdSizeChange={(value) => dispatch({ type: 'SET_CROWD_SIZE', payload: value })}
                    />
                  );
                case FORM_STEPS.EXPERIENCE:
                  return (
                    <ExperienceStep 
                      yearsOfExperience={formData.yearsOfExperience || 0}
                      onYearsOfExperienceChange={(value) => dispatch({ type: 'SET_YEARS_OF_EXPERIENCE', payload: value })}
                    />
                  );
                case FORM_STEPS.MARKETING_EFFORTS:
                  return (
                    <MarketingStep 
                      marketingEfforts={formData.marketingEfforts || []}
                      onMarketingChange={(optionId) => dispatch({ type: 'TOGGLE_MARKETING_EFFORT', payload: optionId })}
                    />
                  );
                default:
                  return null;
              }
            }, [currentStep, formData, customInstrument])}
          </div>

          <div className="form-navigation">
            {currentStep > 1 && (
              <Button
                variant="outline"
                onClick={() => dispatch({ type: 'PREV_STEP' })}
                type="button"
              >
                Back
              </Button>
            )}
            {currentStep < FORM_STEPS.TOTAL ? (
              <Button
                variant="primary"
                onClick={() => dispatch({ type: 'NEXT_STEP' })}
                disabled={!isStepValid()}
                type="button"
              >
                Next
              </Button>
            ) : (
              <Button
                variant="secondary"
                onClick={handleSubmit}
                disabled={!isStepValid() || isSubmitting}
                type="button"
              >
                {isSubmitting ? 'Processing...' : 'Get My Advice'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicianForm;
