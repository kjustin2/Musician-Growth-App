import React, { useMemo, useCallback } from 'react';
import { useApp, useReset, useSetRecommendations } from '@/context/AppContext';
import RecommendationCard from './RecommendationCard';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import Button from '@/components/common/Button';
import { generateRecommendations } from '@/core/recommendationEngine';
import './RecommendationsList.css';

const RecommendationsList: React.FC = () => {
  const { state } = useApp();
  const reset = useReset();
  const setRecommendations = useSetRecommendations();
  const recommendations = useMemo(() => state.recommendations, [state.recommendations]);

  React.useEffect(() => {
    if (state.musicianProfile && state.recommendations.length === 0) {
      const recommendations = generateRecommendations(state.musicianProfile);
      setRecommendations(recommendations);
    }
  }, [state.musicianProfile, state.recommendations.length, setRecommendations]);

  const handleStartOver = useCallback(() => {
    reset();
  }, [reset]);

  if (state.isLoading) {
    return (
      <div className="recommendations-page">
        <div className="container">
          <LoadingSpinner size="large" message="Analyzing your profile..." />
        </div>
      </div>
    );
  }

  return (
    <div className="recommendations-page">
      <div className="container">
        <div className="recommendations-header">
          <h1>Your Personalized Music Career Plan</h1>
          <p className="recommendations-subtitle">
            Based on your profile, here are our top recommendations to help you grow as a musician.
          </p>
        </div>

        <div className="recommendations-grid">
          {recommendations.map((recommendation) => (
            <RecommendationCard
              key={recommendation.id}
              recommendation={recommendation}
            />
          ))}
        </div>

        <div className="recommendations-footer">
          <Button
            variant="outline"
            onClick={handleStartOver}
            size="large"
          >
            Start Over
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RecommendationsList;