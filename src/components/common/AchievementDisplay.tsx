import React, { useState, useEffect } from 'react';
import { Achievement } from '../../core/achievementTypes';
import { achievementService } from '../../services/achievementService';
import './AchievementDisplay.css';

interface AchievementDisplayProps {
  profileId: string;
  showProgress?: boolean;
}

const AchievementDisplay: React.FC<AchievementDisplayProps> = ({ 
  profileId, 
  showProgress = true 
}) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadAchievements();
  }, [profileId]);

  const loadAchievements = async () => {
    try {
      setLoading(true);
      const userAchievements = await achievementService.getAllAchievements(profileId);
      setAchievements(userAchievements);
    } catch (error) {
      console.error('Error loading achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 'all', name: 'All', icon: '🏆' },
    { id: 'performance', name: 'Performance', icon: '🎤' },
    { id: 'practice', name: 'Practice', icon: '🎵' },
    { id: 'goal', name: 'Goals', icon: '🎯' },
    { id: 'milestone', name: 'Milestones', icon: '⭐' }
  ];

  const filteredAchievements = achievements.filter(achievement => 
    selectedCategory === 'all' || achievement.category === selectedCategory
  );

  const unlockedAchievements = filteredAchievements.filter(a => a.isUnlocked);
  const lockedAchievements = filteredAchievements.filter(a => !a.isUnlocked);

  const getTypeColor = (type: string): string => {
    switch (type) {
      case 'bronze': return '#CD7F32';
      case 'silver': return '#C0C0C0';
      case 'gold': return '#FFD700';
      case 'platinum': return '#E5E4E2';
      default: return '#6c757d';
    }
  };

  const getProgressPercentage = (achievement: Achievement): number => {
    if (achievement.isUnlocked) return 100;
    return Math.min((achievement.progress || 0) / achievement.requirement * 100, 100);
  };

  const formatRequirement = (achievement: Achievement): string => {
    const current = achievement.progress || 0;
    const target = achievement.requirement;
    
    if (achievement.id.includes('hours') || achievement.id.includes('practice')) {
      if (target >= 1000) {
        return `${Math.round(current / 60)}h / ${Math.round(target / 60)}h`;
      }
      return `${current}min / ${target}min`;
    }
    
    if (achievement.id.includes('earning')) {
      return `$${current} / $${target}`;
    }
    
    return `${current} / ${target}`;
  };

  if (loading) {
    return (
      <div className="achievement-display loading">
        <div className="spinner"></div>
        <p>Loading achievements...</p>
      </div>
    );
  }

  return (
    <div className="achievement-display">
      <div className="achievement-header">
        <h3>Achievements</h3>
        <div className="achievement-stats">
          <span className="stat">
            <strong>{unlockedAchievements.length}</strong> / {achievements.length} unlocked
          </span>
        </div>
      </div>

      <div className="achievement-categories">
        {categories.map(category => (
          <button
            key={category.id}
            className={`category-button ${selectedCategory === category.id ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category.id)}
          >
            <span className="category-icon">{category.icon}</span>
            <span className="category-name">{category.name}</span>
          </button>
        ))}
      </div>

      <div className="achievement-grid">
        {/* Unlocked achievements first */}
        {unlockedAchievements.map(achievement => (
          <div key={achievement.id} className="achievement-card unlocked">
            <div className="achievement-icon">{achievement.icon}</div>
            <div className="achievement-info">
              <h4 className="achievement-title">{achievement.title}</h4>
              <p className="achievement-description">{achievement.description}</p>
              <div className="achievement-meta">
                <span 
                  className="achievement-type"
                  style={{ color: getTypeColor(achievement.type) }}
                >
                  {achievement.type.toUpperCase()}
                </span>
                {achievement.unlockedAt && (
                  <span className="achievement-date">
                    Unlocked {achievement.unlockedAt.toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
            <div className="achievement-status unlocked-status">
              <span className="checkmark">✓</span>
            </div>
          </div>
        ))}

        {/* Locked achievements */}
        {lockedAchievements.map(achievement => (
          <div key={achievement.id} className="achievement-card locked">
            <div className="achievement-icon dimmed">{achievement.icon}</div>
            <div className="achievement-info">
              <h4 className="achievement-title">{achievement.title}</h4>
              <p className="achievement-description">{achievement.description}</p>
              <div className="achievement-meta">
                <span 
                  className="achievement-type"
                  style={{ color: getTypeColor(achievement.type) }}
                >
                  {achievement.type.toUpperCase()}
                </span>
                {showProgress && (
                  <span className="achievement-progress">
                    {formatRequirement(achievement)}
                  </span>
                )}
              </div>
            </div>
            
            {showProgress && (
              <div className="achievement-progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${getProgressPercentage(achievement)}%` }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredAchievements.length === 0 && (
        <div className="achievement-empty">
          <p>No achievements in this category yet</p>
          <small>Keep tracking your activities to unlock achievements!</small>
        </div>
      )}
    </div>
  );
};

export default AchievementDisplay;