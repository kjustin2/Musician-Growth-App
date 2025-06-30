import React from 'react';
import { Recommendation } from '@/core/types';
import './RecommendationCard.css';

interface RecommendationCardProps {
  recommendation: Recommendation;
}

const categoryIcons: Record<Recommendation['category'], string> = {
  marketing: 'M',
  performance: 'P',
  networking: 'N',
  skill: 'S'
};

const categoryLabels: Record<Recommendation['category'], string> = {
  marketing: 'Marketing & Promotion',
  performance: 'Performance & Gigging',
  networking: 'Networking & Collaboration',
  skill: 'Skill Development'
};

const RecommendationCard: React.FC<RecommendationCardProps> = ({ recommendation }) => {
  const icon = categoryIcons[recommendation.category];
  const categoryLabel = categoryLabels[recommendation.category];

  return (
    <div className={`recommendation-card recommendation-card-${recommendation.priority}`}>
      <div className="recommendation-header">
        <div 
          className={`recommendation-icon recommendation-icon-${recommendation.category}`}
          aria-label={categoryLabel}
          title={categoryLabel}
        >
          {icon}
        </div>
        <h3 className="recommendation-title">{recommendation.title}</h3>
      </div>
      <p className="recommendation-description">{recommendation.description}</p>
      <div className="recommendation-footer">
        <span className={`priority-badge priority-${recommendation.priority}`}>
          {recommendation.priority} priority
        </span>
      </div>
    </div>
  );
};

export default RecommendationCard;