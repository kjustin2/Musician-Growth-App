import React, { useReducer, useCallback } from 'react';
import { MusicianProfile } from '@/core/types';
import { useSetPage, useSetProfile, useSetLoading } from '@/context/AppContext';
import Button from '@/components/common/Button';
import ProgressBar from '@/components/common/ProgressBar';
import InstrumentStep from './steps/InstrumentStep';
import PerformanceStep from './steps/PerformanceStep';
import CrowdStep from './steps/CrowdStep';
import ExperienceStep from './steps/ExperienceStep';
import MarketingStep from './steps/MarketingStep';
import { FORM_STEPS, STEP_LABELS, RECOMMENDATION_CONFIG, EXPERIENCE_LIMITS } from '@/core/constants';
import './MusicianForm.css';

// Form state and actions
interface FormState {
  currentStep: number;
  formData: Partial<MusicianProfile>;
  customInstrument: {
    isOther: boolean;
    value: string;
  };
}

type FormAction = 
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'SET_INSTRUMENT', payload: string }
  | { type: 'SET_CUSTOM_INSTRUMENT', payload: string }
  | { type: 'SET_PERFORMANCE_FREQUENCY', payload: MusicianProfile['performanceFrequency'] }
  | { type: 'SET_CROWD_SIZE', payload: MusicianProfile['crowdSize'] }
  | { type: 'SET_YEARS_OF_EXPERIENCE', payload: number }
  | { type: 'TOGGLE_MARKETING_EFFORT', payload: string };

const initialState: FormState = {
  currentStep: 1,
  formData: {
    instrument: '',
    performanceFrequency: undefined,
    crowdSize: undefined,
    yearsOfExperience: 0,
    marketingEfforts: []
  },
  customInstrument: {
    isOther: false,
    value: ''
  }
};

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'NEXT_STEP':
      return { ...state, currentStep: Math.min(state.currentStep + 1, FORM_STEPS.TOTAL) };
    case 'PREV_STEP':
      return { ...state, currentStep: Math.max(state.currentStep - 1, 1) };
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
    case 'TOGGLE_MARKETING_EFFORT':
      const currentEfforts = state.formData.marketingEfforts || [];
      const newEfforts = currentEfforts.includes(action.payload)
        ? currentEfforts.filter(id => id !== action.payload)
        : [...currentEfforts, action.payload];
      return { ...state, formData: { ...state.formData, marketingEfforts: newEfforts } };
    default:
      return state;
  }
}

const MusicianForm: React.FC = () => {
  const setPage = useSetPage();
  const setProfile = useSetProfile();
  const setLoading = useSetLoading();

  const [state, dispatch] = useReducer(formReducer, initialState);
  const { currentStep, formData, customInstrument } = state;

  const handleSubmit = useCallback(async () => {
    const finalProfile: MusicianProfile = {
      instrument: customInstrument.isOther ? customInstrument.value : formData.instrument!,
      performanceFrequency: formData.performanceFrequency!,
      crowdSize: formData.crowdSize!,
      yearsOfExperience: formData.yearsOfExperience!,
      marketingEfforts: formData.marketingEfforts!
    };

    setProfile(finalProfile);
    setLoading(true);
    
    setTimeout(() => {
      setLoading(false);
      setPage('results');
    }, RECOMMENDATION_CONFIG.LOADING_DELAY_MS);
  }, [customInstrument, formData, setProfile, setLoading, setPage]);

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
            {currentStep === FORM_STEPS.INSTRUMENT && (
              <InstrumentStep 
                instrument={formData.instrument!} 
                customInstrument={customInstrument} 
                onInstrumentChange={(instrument) => dispatch({ type: 'SET_INSTRUMENT', payload: instrument })} 
                onCustomInstrumentChange={(value) => dispatch({ type: 'SET_CUSTOM_INSTRUMENT', payload: value })}
              />
            )}
            {currentStep === FORM_STEPS.PERFORMANCE_FREQUENCY && (
              <PerformanceStep 
                performanceFrequency={formData.performanceFrequency}
                onPerformanceFrequencyChange={(value) => dispatch({ type: 'SET_PERFORMANCE_FREQUENCY', payload: value })}
              />
            )}
            {currentStep === FORM_STEPS.CROWD_SIZE && (
              <CrowdStep 
                crowdSize={formData.crowdSize}
                onCrowdSizeChange={(value) => dispatch({ type: 'SET_CROWD_SIZE', payload: value })}
              />
            )}
            {currentStep === FORM_STEPS.EXPERIENCE && (
              <ExperienceStep 
                yearsOfExperience={formData.yearsOfExperience!}
                onYearsOfExperienceChange={(value) => dispatch({ type: 'SET_YEARS_OF_EXPERIENCE', payload: value })}
              />
            )}
            {currentStep === FORM_STEPS.MARKETING_EFFORTS && (
              <MarketingStep 
                marketingEfforts={formData.marketingEfforts!}
                onMarketingChange={(optionId) => dispatch({ type: 'TOGGLE_MARKETING_EFFORT', payload: optionId })}
              />
            )}
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
