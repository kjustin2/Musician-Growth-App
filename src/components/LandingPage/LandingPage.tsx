import React from 'react';
import { useSetPage } from '@/context/AppContext';
import Button from '@/components/common/Button';
import './LandingPage.css';

const LandingPage: React.FC = () => {
  const setPage = useSetPage();

  const handleGetStarted = () => {
    setPage('form');
  };

  return (
    <div className="landing-page">
      <div className="container">
        <section className="hero-section">
          <h1 className="hero-title">Find Your Next Step as a Musician</h1>
          <p className="hero-subtitle">
            Get personalized advice to grow your music career based on your current journey
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
              <h3>Tell Us About You</h3>
              <p>Share details about your musical journey and current activities</p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <h3>Get Instant Analysis</h3>
              <p>Our smart engine analyzes your profile and identifies growth opportunities</p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <h3>Grow Your Career</h3>
              <p>Receive actionable recommendations tailored to your unique situation</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default LandingPage;