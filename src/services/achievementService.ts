import { Achievement, AchievementProgress, Notification, ACHIEVEMENTS } from '../core/achievementTypes';
import { PerformanceRecord, PracticeSession, Goal } from '../core/types';
import { storageService } from './storageService';
import { generateId } from '../utils';

export class AchievementService {
  private achievements: Achievement[] = [...ACHIEVEMENTS];


  async checkAchievements(
    profileId: string,
    performances: PerformanceRecord[],
    practices: PracticeSession[],
    goals: Goal[]
  ): Promise<Achievement[]> {
    const newlyUnlocked: Achievement[] = [];
    
    // Load existing achievements
    const existingAchievements = await storageService.getAchievements(profileId);
    const existingMap = new Map(existingAchievements.map(a => [a.id, a]));

    for (const achievement of this.achievements) {
      const existing = existingMap.get(achievement.id);
      if (existing?.isUnlocked) continue;

      const progress = this.calculateProgress(achievement, performances, practices, goals);
      
      if (progress >= achievement.requirement && !existing?.isUnlocked) {
        const unlockedAchievement = {
          ...achievement,
          isUnlocked: true,
          unlockedAt: new Date(),
          progress: progress
        };
        
        newlyUnlocked.push(unlockedAchievement);
        
        // Create notification
        await this.createNotification(profileId, {
          type: 'achievement',
          title: 'Achievement Unlocked!',
          message: `You've earned "${achievement.title}" - ${achievement.description}`,
          achievementId: achievement.id,
          icon: achievement.icon
        });

        // Save achievement
        await storageService.saveAchievement(profileId, unlockedAchievement);
      } else if (existing) {
        // Update progress
        const updatedAchievement = {
          ...existing,
          progress: progress
        };
        await storageService.saveAchievement(profileId, updatedAchievement);
      }
    }

    return newlyUnlocked;
  }

  private calculateProgress(
    achievement: Achievement,
    performances: PerformanceRecord[],
    practices: PracticeSession[],
    goals: Goal[]
  ): number {
    switch (achievement.id) {
      case 'first_show':
      case 'ten_shows':
      case 'fifty_shows':
      case 'hundred_shows':
        return performances.length;
      
      case 'first_practice':
        return practices.length > 0 ? 1 : 0;
      
      case 'ten_hours':
      case 'hundred_hours':
      case 'thousand_hours':
        return practices.reduce((total, session) => total + session.duration, 0);
      
      case 'first_goal':
        return goals.length > 0 ? 1 : 0;
      
      case 'goal_achiever':
      case 'goal_crusher':
        return goals.filter(g => g.status === 'completed').length;
      
      case 'earning_milestone':
        return performances.reduce((total, perf) => total + perf.payment, 0);
      
      case 'big_crowd':
        return Math.max(...performances.map(p => p.audienceSize), 0);
      
      case 'consistent_practice':
        return this.calculateConsecutivePracticeDays(practices);
      
      default:
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