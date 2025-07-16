import React, { useState } from 'react';
import { MusicianProfile } from '../../core/types';
// import { useApp } from '../../context/AppContext'; // Reserved for future use
import './OnboardingFlow.css';

interface OnboardingFlowProps {
  profile: MusicianProfile;
  onComplete: () => void;
}

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  content: React.ReactNode;
}

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ profile, onComplete }) => {
  // const { dispatch } = useApp(); // Reserved for future dispatch usage
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Musician Growth App!',
      description: 'Let\'s get you started on your musical journey',
      content: (
        <div className="onboarding-content">
          <div className="welcome-icon">🎵</div>
          <h2>Welcome, {profile.name}!</h2>
          <p>
            You're now part of a community of musicians who are serious about growth. 
            This app will help you track your progress, set goals, and get personalized 
            recommendations to advance your musical career.
          </p>
          <div className="feature-highlights">
            <div className="feature">
              <span className="feature-icon">🎤</span>
              <span>Track Performances</span>
            </div>
            <div className="feature">
              <span className="feature-icon">🎯</span>
              <span>Set & Achieve Goals</span>
            </div>
            <div className="feature">
              <span className="feature-icon">📊</span>
              <span>Monitor Progress</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'dashboard',
      title: 'Your Dashboard',
      description: 'Your central hub for all musical activities',
      content: (
        <div className="onboarding-content">
          <div className="dashboard-preview">
            <h3>Dashboard Overview</h3>
            <p>
              Your dashboard shows everything at a glance:
            </p>
            <ul className="dashboard-features">
              <li>
                <strong>Performance Metrics:</strong> Track your shows, earnings, and audience growth
              </li>
              <li>
                <strong>Practice Statistics:</strong> Monitor your practice time and skill development
              </li>
              <li>
                <strong>Goal Progress:</strong> See how close you are to achieving your musical goals
              </li>
              <li>
                <strong>Recent Activities:</strong> Quick access to your latest performances and practice sessions
              </li>
              <li>
                <strong>Analytics Charts:</strong> Visual representation of your musical journey
              </li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'tracking',
      title: 'Activity Tracking',
      description: 'Log your performances and practice sessions',
      content: (
        <div className="onboarding-content">
          <h3>Track Your Musical Activities</h3>
          <div className="activity-types">
            <div className="activity-type">
              <div className="activity-icon">🎤</div>
              <h4>Performances</h4>
              <p>Log your shows with details like venue, audience size, payment, and setlist.</p>
            </div>
            <div className="activity-type">
              <div className="activity-icon">🎵</div>
              <h4>Practice Sessions</h4>
              <p>Track your practice time, focus areas, and skills you're working on.</p>
            </div>
          </div>
          <div className="tracking-benefits">
            <p><strong>Why track?</strong> The more data you provide, the better recommendations you'll receive!</p>
          </div>
        </div>
      )
    },
    {
      id: 'goals',
      title: 'Goal Management',
      description: 'Set and achieve your musical aspirations',
      content: (
        <div className="onboarding-content">
          <h3>Set Your Musical Goals</h3>
          <p>Goals help you stay focused and motivated. You can create different types of goals:</p>
          <div className="goal-types">
            <div className="goal-type">
              <span className="goal-icon">🎭</span>
              <div>
                <strong>Performance Goals:</strong> Number of shows, audience size targets
              </div>
            </div>
            <div className="goal-type">
              <span className="goal-icon">🎸</span>
              <div>
                <strong>Skill Goals:</strong> Learn new techniques, master songs
              </div>
            </div>
            <div className="goal-type">
              <span className="goal-icon">💰</span>
              <div>
                <strong>Financial Goals:</strong> Earning targets, equipment purchases
              </div>
            </div>
            <div className="goal-type">
              <span className="goal-icon">🎼</span>
              <div>
                <strong>Recording Goals:</strong> Album releases, demo recordings
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'achievements',
      title: 'Achievements & Rewards',
      description: 'Unlock achievements as you progress',
      content: (
        <div className="onboarding-content">
          <h3>Earn Achievements</h3>
          <p>As you track your activities and reach milestones, you'll unlock achievements:</p>
          <div className="achievement-examples">
            <div className="achievement-example">
              <span className="achievement-icon">🎤</span>
              <div>
                <strong>Stage Debut:</strong> Perform your first show
              </div>
            </div>
            <div className="achievement-example">
              <span className="achievement-icon">🎯</span>
              <div>
                <strong>Goal Achiever:</strong> Complete your first goal
              </div>
            </div>
            <div className="achievement-example">
              <span className="achievement-icon">💵</span>
              <div>
                <strong>First Earnings:</strong> Earn your first $100
              </div>
            </div>
          </div>
          <p className="achievement-note">
            <strong>🔔 You'll get notifications when you unlock new achievements!</strong>
          </p>
        </div>
      )
    },
    {
      id: 'ready',
      title: 'You\'re All Set!',
      description: 'Ready to start your musical journey',
      content: (
        <div className="onboarding-content">
          <div className="completion-icon">🚀</div>
          <h2>Ready to Rock!</h2>
          <p>
            You now know how to use all the main features. Here's what you can do next:
          </p>
          <div className="next-steps">
            <div className="next-step">
              <strong>1. Add your first performance</strong> - Start building your performance history
            </div>
            <div className="next-step">
              <strong>2. Set your first goal</strong> - Give yourself something to work towards
            </div>
            <div className="next-step">
              <strong>3. Log practice sessions</strong> - Track your skill development
            </div>
          </div>
          <p className="encouragement">
            Remember: The more you use the app, the better recommendations you'll get!
          </p>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    setTimeout(() => {
      onComplete();
    }, 300);
  };

  const handleSkip = () => {
    handleComplete();
  };

  if (!isVisible) return null;

  const currentStepData = steps[currentStep];

  if (!currentStepData) {
    return null;
  }

  return (
    <div className="onboarding-overlay">
      <div className="onboarding-modal">
        <button 
          className="onboarding-close"
          onClick={handleSkip}
          aria-label="Skip onboarding"
        >
          ✕
        </button>
        
        <div className="onboarding-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
          <span className="progress-text">
            {currentStep + 1} of {steps.length}
          </span>
        </div>

        <div className="onboarding-header">
          <h2>{currentStepData.title}</h2>
          <p className="onboarding-description">{currentStepData.description}</p>
        </div>

        <div className="onboarding-body">
          {currentStepData.content}
        </div>

        <div className="onboarding-footer">
          <div className="onboarding-actions">
            <button 
              className="btn btn-outline-secondary"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              Previous
            </button>
            
            <button 
              className="btn btn-primary"
              onClick={handleNext}
            >
              {currentStep === steps.length - 1 ? 'Get Started!' : 'Next'}
            </button>
          </div>
          
          <button 
            className="skip-button"
            onClick={handleSkip}
          >
            Skip Tour
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingFlow;