import React, { useState, useEffect } from 'react';
import { MusicianProfile } from '../../core/types';
import { ACHIEVEMENTS, Achievement } from '../../core/achievementTypes';

interface AchievementsTabProps {
  profile: MusicianProfile;
}

const AchievementsTab: React.FC<AchievementsTabProps> = ({ profile }) => {
  const [userAchievements, setUserAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    // Calculate which achievements should be unlocked based on user data
    const updatedAchievements = ACHIEVEMENTS.map(achievement => {
      let isUnlocked = false;
      
      // Check achievement requirements based on user profile data
      switch (achievement.id) {
        case 'first_show':
          isUnlocked = (profile.shows?.length || 0) >= 1;
          break;
        case 'ten_shows':
          isUnlocked = (profile.shows?.length || 0) >= 10;
          break;
        case 'fifty_shows':
          isUnlocked = (profile.shows?.length || 0) >= 50;
          break;
        case 'hundred_shows':
          isUnlocked = (profile.shows?.length || 0) >= 100;
          break;
        case 'first_practice':
          isUnlocked = (profile.practiceLog?.length || 0) >= 1;
          break;
        case 'ten_hours':
          const totalPracticeMinutes = profile.practiceLog?.reduce((total, session) => total + session.duration, 0) || 0;
          isUnlocked = totalPracticeMinutes >= 600; // 10 hours
          break;
        case 'hundred_hours':
          const totalPracticeMinutes100 = profile.practiceLog?.reduce((total, session) => total + session.duration, 0) || 0;
          isUnlocked = totalPracticeMinutes100 >= 6000; // 100 hours
          break;
        case 'first_goal':
          isUnlocked = (profile.goals?.length || 0) >= 1;
          break;
        case 'goal_achiever':
          isUnlocked = (profile.goals?.filter(g => g.status === 'completed').length || 0) >= 1;
          break;
        case 'goal_crusher':
          isUnlocked = (profile.goals?.filter(g => g.status === 'completed').length || 0) >= 5;
          break;
        case 'first_recording':
          isUnlocked = (profile.recordings?.length || 0) >= 1;
          break;
        case 'earning_milestone':
          const totalEarnings = profile.shows?.reduce((total, show) => total + (show.payment || 0), 0) || 0;
          isUnlocked = totalEarnings >= 100;
          break;
        default:
          isUnlocked = achievement.isUnlocked;
      }
      
      return {
        ...achievement,
        isUnlocked,
        unlockedAt: isUnlocked && !achievement.isUnlocked ? new Date() : achievement.unlockedAt
      };
    });
    
    setUserAchievements(updatedAchievements);
  }, [profile]);

  const getAchievementColor = (type: string) => {
    const colors: Record<string, string> = {
      bronze: 'warning',
      silver: 'secondary', 
      gold: 'primary',
      platinum: 'success'
    };
    return colors[type] || 'secondary';
  };

  // Separate completed and locked achievements
  const completedAchievements = userAchievements.filter(achievement => achievement.isUnlocked);
  const lockedAchievements = userAchievements.filter(achievement => !achievement.isUnlocked);

  // Sort completed achievements by unlock date (most recent first)
  const sortedCompletedAchievements = completedAchievements.sort((a, b) => {
    if (!a.unlockedAt || !b.unlockedAt) return 0;
    return new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime();
  });

  const renderCompletedAchievement = (achievement: Achievement) => (
    <div key={achievement.id} className="col-md-6 col-lg-4 mb-4">
      <div className="achievement-card card h-100 unlocked completed-achievement">
        <div className="achievement-glow"></div>
        <div className="card-body text-center position-relative">
          <div className="achievement-completion-badge">
            <i className="fas fa-trophy text-warning"></i>
          </div>
          
          <div className="achievement-icon mb-3">
            <div className="achievement-emoji completed" style={{ fontSize: '3.5rem' }}>
              {achievement.icon}
            </div>
            <div className="achievement-checkmark">
              <i className="fas fa-check-circle text-success"></i>
            </div>
          </div>
          
          <h5 className="achievement-title text-success fw-bold">
            {achievement.title}
            <div className="achievement-sparkles">
              <i className="fas fa-sparkles text-warning ms-2"></i>
            </div>
          </h5>
          
          <p className="achievement-description text-dark mb-3 fw-medium">
            {achievement.description}
          </p>
          
          <div className="achievement-badges mb-3">
            <span className={`badge bg-${getAchievementColor(achievement.type)} me-2 fs-6`}>
              {achievement.type.charAt(0).toUpperCase() + achievement.type.slice(1)}
            </span>
            <span className="badge bg-success text-white fs-6">
              COMPLETED
            </span>
          </div>
          
          {achievement.unlockedAt && (
            <div className="achievement-date">
              <div className="completion-celebration mb-2">
                <i className="fas fa-star text-warning me-1"></i>
                <strong className="text-success">Achieved!</strong>
                <i className="fas fa-star text-warning ms-1"></i>
              </div>
              <small className="text-success fw-medium">
                <i className="fas fa-calendar-check me-1"></i>
                {new Date(achievement.unlockedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </small>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderLockedAchievement = (achievement: Achievement) => (
    <div key={achievement.id} className="col-md-6 col-lg-4 mb-4">
      <div className="achievement-card card h-100 locked">
        <div className="card-body text-center">
          <div className="achievement-icon mb-3">
            <div className="achievement-emoji locked-emoji" style={{ fontSize: '3rem', opacity: 0.4 }}>
              {achievement.icon}
            </div>
            <div className="achievement-lock-overlay">
              <i className="fas fa-lock text-muted"></i>
            </div>
          </div>
          
          <h5 className="achievement-title text-muted">
            {achievement.title}
          </h5>
          
          <p className="achievement-description text-muted mb-3" style={{ opacity: 0.7 }}>
            {achievement.description}
          </p>
          
          <div className="achievement-badges mb-2">
            <span className={`badge bg-light text-muted me-2`}>
              {achievement.type.charAt(0).toUpperCase() + achievement.type.slice(1)}
            </span>
            <span className="badge bg-light text-muted">
              {achievement.category.charAt(0).toUpperCase() + achievement.category.slice(1)}
            </span>
          </div>
          
          <div className="achievement-progress mt-2">
            <small className="text-muted">
              <i className="fas fa-hourglass-half me-1"></i>
              Keep going to unlock this achievement!
            </small>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="achievements-tab">
      <div className="achievements-header mb-4">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h4 className="mb-1">Achievements</h4>
            <p className="text-muted mb-0">Track your musical journey and unlock new milestones</p>
          </div>
          <div className="achievements-stats">
            <div className="d-flex align-items-center">
              <div className="stat-item me-4">
                <span className="stat-value h5 text-success mb-0">{completedAchievements.length}</span>
                <small className="stat-label text-muted d-block">Completed</small>
              </div>
              <div className="stat-item">
                <span className="stat-value h5 text-muted mb-0">{lockedAchievements.length}</span>
                <small className="stat-label text-muted d-block">Remaining</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Completed Achievements Section */}
      {completedAchievements.length > 0 && (
        <div className="completed-achievements-section mb-5">
          <div className="section-header mb-4">
            <h5 className="text-success d-flex align-items-center">
              <i className="fas fa-trophy text-warning me-2"></i>
              Completed Achievements
              <span className="badge bg-success ms-2">{completedAchievements.length}</span>
            </h5>
            <p className="text-muted mb-0">Celebrate your musical accomplishments!</p>
          </div>
          
          <div className="row">
            {sortedCompletedAchievements.map(renderCompletedAchievement)}
          </div>
        </div>
      )}

      {/* Locked Achievements Section */}
      {lockedAchievements.length > 0 && (
        <div className="locked-achievements-section">
          <div className="section-header mb-4">
            <h5 className="text-muted d-flex align-items-center">
              <i className="fas fa-lock me-2"></i>
              Achievements to Unlock
              <span className="badge bg-light text-muted ms-2">{lockedAchievements.length}</span>
            </h5>
            <p className="text-muted mb-0">Keep practicing and performing to unlock these achievements!</p>
          </div>
          
          <div className="row">
            {lockedAchievements.map(renderLockedAchievement)}
          </div>
        </div>
      )}

      {/* Empty State */}
      {userAchievements.length === 0 && (
        <div className="empty-achievements text-center py-5">
          <div className="empty-icon mb-3">
            <i className="fas fa-trophy fa-3x text-muted"></i>
          </div>
          <h5 className="text-muted">No Achievements Yet</h5>
          <p className="text-muted">Start your musical journey to unlock achievements!</p>
        </div>
      )}
    </div>
  );
};

export default AchievementsTab;