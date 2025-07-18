import { Achievement, AchievementProgress, Notification, ACHIEVEMENTS } from '../core/achievementTypes';
import { PerformanceRecord, PracticeSession, Goal } from '../core/types';
import { storageService } from './storageService';
import { generateId } from '../utils';
import { loggingService } from './loggingService';
import { ensureArray } from '../utils/typeGuards';
import { SafeAccess } from '../utils/safeAccess';

export class AchievementService {
  private achievements: Achievement[] = [...ACHIEVEMENTS];


  async checkAchievements(
    profileId: string,
    performances: PerformanceRecord[],
    practices: PracticeSession[],
    goals: Goal[],
    recordings?: import('../core/types').RecordingSession[]
  ): Promise<Achievement[]> {
    loggingService.info('Checking achievements', { 
      profileId, 
      performanceCount: performances?.length || 0,
      practiceCount: practices?.length || 0,
      goalCount: goals?.length || 0,
      recordingCount: recordings?.length || 0
    });

    const newlyUnlocked: Achievement[] = [];
    
    try {
      // Ensure all inputs are arrays
      const safePerformances = ensureArray(performances);
      const safePractices = ensureArray(practices);
      const safeGoals = ensureArray(goals);
      const safeRecordings = ensureArray(recordings);
      
      // Load existing achievements with error handling
      let existingAchievements: Achievement[] = [];
      try {
        existingAchievements = await storageService.getAchievements(profileId);
      } catch (error) {
        loggingService.error('Failed to load existing achievements', error as Error, { profileId });
        // Continue with empty array - achievements will be recalculated
      }
      
      const existingMap = new Map(existingAchievements.map(a => [a.id, a]));

      for (const achievement of this.achievements) {
        try {
          const existing = existingMap.get(achievement.id);
          if (existing?.isUnlocked) continue;

          const progress = this.calculateProgress(achievement, safePerformances, safePractices, safeGoals, safeRecordings);
          
          if (progress >= achievement.requirement && !existing?.isUnlocked) {
            const unlockedAchievement = {
              ...achievement,
              isUnlocked: true,
              unlockedAt: new Date(),
              progress: progress
            };
            
            newlyUnlocked.push(unlockedAchievement);
            
            loggingService.info('Achievement unlocked', {
              profileId,
              achievementId: achievement.id,
              achievementTitle: achievement.title,
              progress,
              requirement: achievement.requirement
            });
            
            // Create notification with error handling
            try {
              await this.createNotification(profileId, {
                type: 'achievement',
                title: 'Achievement Unlocked!',
                message: `You've earned "${achievement.title}" - ${achievement.description}`,
                achievementId: achievement.id,
                icon: achievement.icon
              });
            } catch (error) {
              loggingService.error('Failed to create achievement notification', error as Error, {
                profileId,
                achievementId: achievement.id
              });
              // Continue - notification failure shouldn't prevent achievement unlock
            }

            // Save achievement with error handling
            try {
              await storageService.saveAchievement(profileId, unlockedAchievement);
            } catch (error) {
              loggingService.error('Failed to save unlocked achievement', error as Error, {
                profileId,
                achievementId: achievement.id
              });
              // Remove from newly unlocked if save failed
              const index = newlyUnlocked.indexOf(unlockedAchievement);
              if (index > -1) {
                newlyUnlocked.splice(index, 1);
              }
            }
          } else if (existing && existing.progress !== progress) {
            // Update progress with error handling
            try {
              const updatedAchievement = {
                ...existing,
                progress: progress
              };
              await storageService.saveAchievement(profileId, updatedAchievement);
              
              loggingService.debug('Achievement progress updated', {
                profileId,
                achievementId: achievement.id,
                oldProgress: existing.progress,
                newProgress: progress
              });
            } catch (error) {
              loggingService.error('Failed to update achievement progress', error as Error, {
                profileId,
                achievementId: achievement.id,
                progress
              });
            }
          }
        } catch (error) {
          loggingService.error('Error processing individual achievement', error as Error, {
            profileId,
            achievementId: achievement.id
          });
          // Continue with next achievement
        }
      }

      loggingService.info('Achievement check completed', {
        profileId,
        newlyUnlockedCount: newlyUnlocked.length,
        newlyUnlockedIds: newlyUnlocked.map(a => a.id)
      });

      return newlyUnlocked;
    } catch (error) {
      loggingService.error('Achievement check failed', error as Error, { profileId });
      return []; // Return empty array on complete failure
    }
  }

  private calculateProgress(
    achievement: Achievement,
    performances: PerformanceRecord[],
    practices: PracticeSession[],
    goals: Goal[],
    recordings?: import('../core/types').RecordingSession[]
  ): number {
    try {
      switch (achievement.id) {
        case 'first_show':
        case 'ten_shows':
        case 'fifty_shows':
        case 'hundred_shows':
        case 'two_hundred_shows':
        case 'five_hundred_shows':
          return SafeAccess.length(performances);
        
        case 'first_practice':
          return SafeAccess.length(practices) > 0 ? 1 : 0;
        
        case 'ten_hours':
        case 'hundred_hours':
        case 'thousand_hours':
          return SafeAccess.reduce(practices, (total, session) => total + (session.duration || 0), 0);
        
        case 'first_goal':
          return SafeAccess.length(goals) > 0 ? 1 : 0;
        
        case 'goal_achiever':
        case 'goal_crusher':
          return SafeAccess.filter(goals, g => g.status === 'completed').length;
        
        case 'earning_milestone':
        case 'first_thousand':
        case 'five_thousand':
        case 'ten_thousand':
          return SafeAccess.reduce(performances, (total, perf) => total + (perf.payment || 0), 0);
        
        case 'big_crowd':
        case 'crowd_grower':
          const audienceSizes = SafeAccess.map(performances, p => p.audienceSize || 0);
          return audienceSizes.length > 0 ? Math.max(...audienceSizes) : 0;
        
        case 'consistent_practice':
        case 'consistency_king':
          return this.calculateConsecutivePracticeDays(practices);
        
        case 'venue_explorer':
          return this.calculateUniqueVenueTypes(performances);
        
        case 'festival_performer':
          return this.calculateFestivalPerformances(performances);
        
        // Recording achievements
        case 'first_recording':
          return SafeAccess.length(recordings);
        
        case 'five_songs':
        case 'album_ready':
        case 'prolific_artist':
          return SafeAccess.reduce(recordings, (total, session) => total + SafeAccess.length(session.songs), 0);
        
        case 'viral_hit':
          const allPlays = SafeAccess.reduce(recordings, (acc, session) => {
            const sessionPlays = SafeAccess.map(session.songs || [], song => song.plays || 0);
            return acc.concat(sessionPlays);
          }, [] as number[]);
          return allPlays.length > 0 ? Math.max(...allPlays) : 0;
        
        case 'streaming_success':
          return SafeAccess.reduce(recordings, (total, session) => 
            total + SafeAccess.reduce(session.songs || [], (songTotal, song) => songTotal + (song.plays || 0), 0), 0
          );
        
        case 'recording_revenue':
          return SafeAccess.reduce(recordings, (total, session) => total + (session.totalRevenue || 0), 0);
        
        case 'diversified_income':
          const performanceEarnings = SafeAccess.reduce(performances, (total, perf) => total + (perf.payment || 0), 0);
          const recordingEarnings = SafeAccess.reduce(recordings, (total, session) => total + (session.totalRevenue || 0), 0);
          return (performanceEarnings > 0 && recordingEarnings > 0) ? 1 : 0;
        
        // Combination achievements
        case 'triple_threat':
          return this.calculateTripleThreat(performances, practices, recordings);
        
        case 'well_rounded':
          return this.calculateWellRoundedGoals(goals);
        
        case 'year_of_music':
          return this.calculateMonthsWithActivity(performances, practices, recordings);
        
        default:
          loggingService.warn('Unknown achievement ID', { achievementId: achievement.id });
          return 0;
      }
    } catch (error) {
      loggingService.error('Error calculating achievement progress', error as Error, {
        achievementId: achievement.id,
        performanceCount: performances?.length || 0,
        practiceCount: practices?.length || 0,
        goalCount: goals?.length || 0,
        recordingCount: recordings?.length || 0
      });
      return 0;
    }
  }

  private calculateConsecutivePracticeDays(practices: PracticeSession[]): number {
    if (practices.length === 0) return 0;

    const practiceDates = practices
      .map(p => p.date.toDateString())
      .filter((date, index, arr) => arr.indexOf(date) === index)
      .sort();

    let maxConsecutive = 1;
    let currentConsecutive = 1;

    for (let i = 1; i < practiceDates.length; i++) {
      const currentDate = new Date(practiceDates[i]!);
      const previousDate = new Date(practiceDates[i - 1]!);
      const dayDiff = (currentDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24);

      if (dayDiff === 1) {
        currentConsecutive++;
        maxConsecutive = Math.max(maxConsecutive, currentConsecutive);
      } else {
        currentConsecutive = 1;
      }
    }

    return maxConsecutive;
  }

  private calculateUniqueVenueTypes(performances: PerformanceRecord[]): number {
    const uniqueVenueTypes = new Set(performances.map(p => p.venueType));
    return uniqueVenueTypes.size;
  }

  private calculateFestivalPerformances(performances: PerformanceRecord[]): number {
    return performances.filter(p => p.venueType === 'festival').length;
  }

  private calculateTripleThreat(
    performances: PerformanceRecord[], 
    practices: PracticeSession[], 
    recordings?: import('../core/types').RecordingSession[]
  ): number {
    const hasEnoughShows = performances.length >= 10;
    const practiceHours = practices.reduce((total, session) => total + session.duration, 0);
    const hasEnoughPractice = practiceHours >= 3000; // 50 hours in minutes
    const recordedSongs = recordings ? recordings.reduce((total, session) => total + session.songs.length, 0) : 0;
    const hasEnoughRecordings = recordedSongs >= 3;
    
    return (hasEnoughShows && hasEnoughPractice && hasEnoughRecordings) ? 1 : 0;
  }

  private calculateWellRoundedGoals(goals: Goal[]): number {
    const completedGoals = goals.filter(g => g.status === 'completed');
    const goalTypes = new Set(completedGoals.map(g => g.type));
    return goalTypes.size;
  }

  private calculateMonthsWithActivity(
    performances: PerformanceRecord[], 
    practices: PracticeSession[], 
    recordings?: import('../core/types').RecordingSession[]
  ): number {
    const monthsWithActivity = new Set<string>();
    
    // Add months with performances
    performances.forEach(p => {
      const monthKey = `${p.date.getFullYear()}-${p.date.getMonth()}`;
      monthsWithActivity.add(monthKey);
    });
    
    // Add months with practice
    practices.forEach(p => {
      const monthKey = `${p.date.getFullYear()}-${p.date.getMonth()}`;
      monthsWithActivity.add(monthKey);
    });
    
    // Add months with recordings
    if (recordings) {
      recordings.forEach(r => {
        const monthKey = `${r.date.getFullYear()}-${r.date.getMonth()}`;
        monthsWithActivity.add(monthKey);
      });
    }
    
    return monthsWithActivity.size;
  }

  async createNotification(profileId: string, notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>): Promise<void> {
    const newNotification: Notification = {
      id: generateId(),
      createdAt: new Date(),
      isRead: false,
      ...notification
    };

    await storageService.saveNotification(profileId, newNotification);
  }

  async getNotifications(profileId: string): Promise<Notification[]> {
    return await storageService.getNotifications(profileId);
  }

  async markNotificationAsRead(profileId: string, notificationId: string): Promise<void> {
    await storageService.markNotificationAsRead(profileId, notificationId);
  }

  async getAchievementProgress(profileId: string): Promise<AchievementProgress[]> {
    const achievements = await storageService.getAchievements(profileId);
    
    return this.achievements.map(baseAchievement => {
      const userAchievement = achievements.find(a => a.id === baseAchievement.id);
      
      return {
        achievementId: baseAchievement.id,
        currentValue: userAchievement?.progress || 0,
        targetValue: baseAchievement.requirement,
        isUnlocked: userAchievement?.isUnlocked || false
      };
    });
  }

  async getAllAchievements(profileId: string): Promise<Achievement[]> {
    const userAchievements = await storageService.getAchievements(profileId);
    const userMap = new Map(userAchievements.map(a => [a.id, a]));

    return this.achievements.map(baseAchievement => {
      const userAchievement = userMap.get(baseAchievement.id);
      
      return {
        ...baseAchievement,
        isUnlocked: userAchievement?.isUnlocked || false,
        unlockedAt: userAchievement?.unlockedAt,
        progress: userAchievement?.progress || 0
      };
    });
  }
}

export const achievementService = new AchievementService();