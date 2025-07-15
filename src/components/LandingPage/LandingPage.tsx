import React from 'react';
import { useSetPage } from '@/context/AppContext';
import Button from '@/components/common/Button';
import './LandingPage.css';

const LandingPage: React.FC = () => {
  const setPage = useSetPage();

  const handleGetStarted = () => {
    setPage('profile-selection');
  };

  return (
    <div className="landing-page">
      <div className="container">
        <section className="hero-section">
          <h1 className="hero-title">Track Your Musical Journey</h1>
          <p className="hero-subtitle">
            Track performances, practice sessions, and goals while getting personalized recommendations to grow your music career
          </p>
          <Button 
            variant="primary" 
            size="large"
            onClick={handleGetStarted}
            className="cta-button"
          >
            Get Started
          </Button>
        </section>

        <section className="how-it-works">
          <h2>How It Works</h2>
          <div className="steps-container">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Create Your Profile</h3>
              <p>Set up your musician profile with your instrument, experience, and goals</p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <h3>Track Your Activities</h3>
              <p>Log performances, practice sessions, and progress toward your goals</p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <h3>Get Smart Recommendations</h3>
              <p>Receive personalized advice based on your tracked data and progress trends</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default LandingPage;