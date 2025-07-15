import { 
  MusicianProfile, 
  PerformanceRecord, 
  PracticeSession, 
  Goal, 
  Achievement,
  StorageError
} from '../core/types';
import { Achievement as AchievementType, Notification } from '../core/achievementTypes';

const DB_NAME = 'MusicianGrowthApp';
const DB_VERSION = 1;

export class StorageService {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        const error: StorageError = new Error('Failed to open database') as StorageError;
        error.type = 'browser_unsupported';
        error.recoverable = true;
        reject(error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        this.createStores(db);
      };
    });
  }

  private createStores(db: IDBDatabase): void {
    // Profiles store
    if (!db.objectStoreNames.contains('profiles')) {
      const profileStore = db.createObjectStore('profiles', { keyPath: 'id' });
      profileStore.createIndex('lastUpdated', 'lastUpdated');
    }

    // Performances store
    if (!db.objectStoreNames.contains('performances')) {
      const performanceStore = db.createObjectStore('performances', { keyPath: 'id' });
      performanceStore.createIndex('profileId', 'profileId');
      performanceStore.createIndex('date', 'date');
    }

    // Practice sessions store
    if (!db.objectStoreNames.contains('practice_sessions')) {
      const practiceStore = db.createObjectStore('practice_sessions', { keyPath: 'id' });
      practiceStore.createIndex('profileId', 'profileId');
      practiceStore.createIndex('date', 'date');
    }

    // Goals store
    if (!db.objectStoreNames.contains('goals')) {
      const goalStore = db.createObjectStore('goals', { keyPath: 'id' });
      goalStore.createIndex('profileId', 'profileId');
      goalStore.createIndex('status', 'status');
    }

    // Achievements store
    if (!db.objectStoreNames.contains('achievements')) {
      const achievementStore = db.createObjectStore('achievements', { keyPath: 'id' });
      achievementStore.createIndex('profileId', 'profileId');
      achievementStore.createIndex('category', 'category');
    }

    // Notifications store
    if (!db.objectStoreNames.contains('notifications')) {
      const notificationStore = db.createObjectStore('notifications', { keyPath: 'id' });
      notificationStore.createIndex('profileId', 'profileId');
      notificationStore.createIndex('createdAt', 'createdAt');
      notificationStore.createIndex('isRead', 'isRead');
    }
  }

  private ensureDb(): void {
    if (!this.db) {
      throw new Error('Database not initialized. Call init() first.');
    }
  }

  // Profile management
  async saveProfile(profile: MusicianProfile): Promise<void> {
    this.ensureDb();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['profiles'], 'readwrite');
      const store = transaction.objectStore('profiles');
      
      const request = store.put({
        ...profile,
        lastUpdated: new Date()
      });

      request.onsuccess = () => resolve();
      request.onerror = () => {
        const error: StorageError = new Error('Failed to save profile') as StorageError;
        error.type = 'unknown';
        error.recoverable = true;
        reject(error);
      };
    });
  }

  async loadProfile(profileId: string): Promise<MusicianProfile | null> {
    this.ensureDb();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['profiles'], 'readonly');
      const store = transaction.objectStore('profiles');
      
      const request = store.get(profileId);

      request.onsuccess = () => {
        const profile = request.result;
        if (profile) {
          // Convert date strings back to Date objects
          profile.createdAt = new Date(profile.createdAt);
          profile.lastUpdated = new Date(profile.lastUpdated);
          resolve(profile);
        } else {
          resolve(null);
        }
      };
      
      request.onerror = () => {
        const error: StorageError = new Error('Failed to load profile') as StorageError;
        error.type = 'unknown';
        error.recoverable = true;
        reject(error);
      };
    });
  }

  async getAllProfiles(): Promise<MusicianProfile[]> {
    this.ensureDb();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['profiles'], 'readonly');
      const store = transaction.objectStore('profiles');
      
      const request = store.getAll();

      request.onsuccess = () => {
        const profiles = request.result.map((profile: any) => ({
          ...profile,
          createdAt: new Date(profile.createdAt),
          lastUpdated: new Date(profile.lastUpdated)
        }));
        resolve(profiles);
      };
      
      request.onerror = () => {
        const error: StorageError = new Error('Failed to load profiles') as StorageError;
        error.type = 'unknown';
        error.recoverable = true;
        reject(error);
      };
    });
  }

  async deleteProfile(profileId: string): Promise<void> {
    this.ensureDb();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['profiles'], 'readwrite');
      const store = transaction.objectStore('profiles');
      
      const request = store.delete(profileId);

      request.onsuccess = () => resolve();
      request.onerror = () => {
        const error: StorageError = new Error('Failed to delete profile') as StorageError;
        error.type = 'unknown';
        error.recoverable = true;
        reject(error);
      };
    });
  }

  // Activity tracking
  async addPerformance(profileId: string, performance: PerformanceRecord): Promise<void> {
    this.ensureDb();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['performances'], 'readwrite');
      const store = transaction.objectStore('performances');
      
      const request = store.add({
        ...performance,
        profileId,
        date: new Date(performance.date)
      });

      request.onsuccess = () => resolve();
      request.onerror = () => {
        const error: StorageError = new Error('Failed to add performance') as StorageError;
        error.type = 'unknown';
        error.recoverable = true;
        reject(error);
      };
    });
  }

  async addPracticeSession(profileId: string, session: PracticeSession): Promise<void> {
    this.ensureDb();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['practice_sessions'], 'readwrite');
      const store = transaction.objectStore('practice_sessions');
      
      const request = store.add({
        ...session,
        profileId,
        date: new Date(session.date)
      });

      request.onsuccess = () => resolve();
      request.onerror = () => {
        const error: StorageError = new Error('Failed to add practice session') as StorageError;
        error.type = 'unknown';
        error.recoverable = true;
        reject(error);
      };
    });
  }

  async getPerformances(profileId: string): Promise<PerformanceRecord[]> {
    this.ensureDb();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['performances'], 'readonly');
      const store = transaction.objectStore('performances');
      const index = store.index('profileId');
      
      const request = index.getAll(profileId);

      request.onsuccess = () => {
        const performances = request.result.map((performance: any) => ({
          ...performance,
          date: new Date(performance.date)
        }));
        resolve(performances);
      };
      
      request.onerror = () => {
        const error: StorageError = new Error('Failed to load performances') as StorageError;
        error.type = 'unknown';
        error.recoverable = true;
        reject(error);
      };
    });
  }

  async getPracticeSessions(profileId: string): Promise<PracticeSession[]> {
    this.ensureDb();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['practice_sessions'], 'readonly');
      const store = transaction.objectStore('practice_sessions');
      const index = store.index('profileId');
      
      const request = index.getAll(profileId);

      request.onsuccess = () => {
        const sessions = request.result.map((session: any) => ({
          ...session,
          date: new Date(session.date)
        }));
        resolve(sessions);
      };
      
      request.onerror = () => {
        const error: StorageError = new Error('Failed to load practice sessions') as StorageError;
        error.type = 'unknown';
        error.recoverable = true;
        reject(error);
      };
    });
  }

  // Goal management
  async saveGoal(profileId: string, goal: Goal): Promise<void> {
    this.ensureDb();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['goals'], 'readwrite');
      const store = transaction.objectStore('goals');
      
      const request = store.put({
        ...goal,
        profileId,
        createdAt: new Date(goal.createdAt),
        deadline: goal.deadline ? new Date(goal.deadline) : undefined
      });

      request.onsuccess = () => resolve();
      request.onerror = () => {
        const error: StorageError = new Error('Failed to save goal') as StorageError;
        error.type = 'unknown';
        error.recoverable = true;
        reject(error);
      };
    });
  }

  async getGoals(profileId: string): Promise<Goal[]> {
    this.ensureDb();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['goals'], 'readonly');
      const store = transaction.objectStore('goals');
      const index = store.index('profileId');
      
      const request = index.getAll(profileId);

      request.onsuccess = () => {
        const goals = request.result.map((goal: any) => ({
          ...goal,
          createdAt: new Date(goal.createdAt),
          deadline: goal.deadline ? new Date(goal.deadline) : undefined
        }));
        resolve(goals);
      };
      
      request.onerror = () => {
        const error: StorageError = new Error('Failed to load goals') as StorageError;
        error.type = 'unknown';
        error.recoverable = true;
        reject(error);
      };
    });
  }

  async updateGoalProgress(profileId: string, goalId: string, progress: number): Promise<void> {
    this.ensureDb();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['goals'], 'readwrite');
      const store = transaction.objectStore('goals');
      
      const getRequest = store.get(goalId);
      
      getRequest.onsuccess = () => {
        const goal = getRequest.result;
        if (goal && goal.profileId === profileId) {
          goal.currentValue = progress;
          if (goal.targetValue && progress >= goal.targetValue) {
            goal.status = 'completed';
          }
          
          const putRequest = store.put(goal);
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => {
            const error: StorageError = new Error('Failed to update goal progress') as StorageError;
            error.type = 'unknown';
            error.recoverable = true;
            reject(error);
          };
        } else {
          reject(new Error('Goal not found or access denied'));
        }
      };
      
      getRequest.onerror = () => {
        const error: StorageError = new Error('Failed to load goal for update') as StorageError;
        error.type = 'unknown';
        error.recoverable = true;
        reject(error);
      };
    });
  }

  // Achievement management
  async addAchievement(profileId: string, achievement: Achievement): Promise<void> {
    this.ensureDb();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['achievements'], 'readwrite');
      const store = transaction.objectStore('achievements');
      
      const request = store.add({
        ...achievement,
        profileId,
        unlockedAt: new Date(achievement.unlockedAt)
      });

      request.onsuccess = () => resolve();
      request.onerror = () => {
        const error: StorageError = new Error('Failed to add achievement') as StorageError;
        error.type = 'unknown';
        error.recoverable = true;
        reject(error);
      };
    });
  }

  async getAchievements(profileId: string): Promise<Achievement[]> {
    this.ensureDb();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['achievements'], 'readonly');
      const store = transaction.objectStore('achievements');
      const index = store.index('profileId');
      
      const request = index.getAll(profileId);

      request.onsuccess = () => {
        const achievements = request.result.map((achievement: any) => ({
          ...achievement,
          unlockedAt: new Date(achievement.unlockedAt)
        }));
        resolve(achievements);
      };
      
      request.onerror = () => {
        const error: StorageError = new Error('Failed to load achievements') as StorageError;
        error.type = 'unknown';
        error.recoverable = true;
        reject(error);
      };
    });
  }

  // Bulk operations
  async bulkAddActivities(
    profileId: string, 
    activities: (PerformanceRecord | PracticeSession)[]
  ): Promise<void> {
    this.ensureDb();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['performances', 'practice_sessions'], 'readwrite');
      const performanceStore = transaction.objectStore('performances');
      const practiceStore = transaction.objectStore('practice_sessions');
      
      let completed = 0;
      const total = activities.length;

      const checkCompletion = () => {
        completed++;
        if (completed === total) {
          resolve();
        }
      };

      activities.forEach(activity => {
        const activityWithProfile = {
          ...activity,
          profileId,
          date: new Date(activity.date)
        };

        let request: IDBRequest;
        if ('venueName' in activity) {
          // It's a performance
          request = performanceStore.add(activityWithProfile);
        } else {
          // It's a practice session
          request = practiceStore.add(activityWithProfile);
        }

        request.onsuccess = checkCompletion;
        request.onerror = () => {
          const error: StorageError = new Error('Failed to add activity in bulk operation') as StorageError;
          error.type = 'unknown';
          error.recoverable = true;
          reject(error);
        };
      });
    });
  }

  // Achievement management
  async saveAchievement(profileId: string, achievement: AchievementType): Promise<void> {
    this.ensureDb();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['achievements'], 'readwrite');
      const store = transaction.objectStore('achievements');
      
      const request = store.put({
        ...achievement,
        profileId,
        id: `${profileId}_${achievement.id}`
      });

      request.onsuccess = () => resolve();
      request.onerror = () => {
        const error: StorageError = new Error('Failed to save achievement') as StorageError;
        error.type = 'unknown';
        error.recoverable = true;
        reject(error);
      };
    });
  }

  async getAchievements(profileId: string): Promise<AchievementType[]> {
    this.ensureDb();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['achievements'], 'readonly');
      const store = transaction.objectStore('achievements');
      const index = store.index('profileId');
      
      const request = index.getAll(profileId);
      
      request.onsuccess = () => {
        const achievements = request.result.map((achievement: any) => ({
          ...achievement,
          id: achievement.id.replace(`${profileId}_`, ''),
          unlockedAt: achievement.unlockedAt ? new Date(achievement.unlockedAt) : undefined
        }));
        resolve(achievements);
      };
      
      request.onerror = () => {
        const error: StorageError = new Error('Failed to load achievements') as StorageError;
        error.type = 'unknown';
        error.recoverable = true;
        reject(error);
      };
    });
  }

  // Notification management
  async saveNotification(profileId: string, notification: Notification): Promise<void> {
    this.ensureDb();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['notifications'], 'readwrite');
      const store = transaction.objectStore('notifications');
      
      const request = store.put({
        ...notification,
        profileId,
        id: `${profileId}_${notification.id}`
      });

      request.onsuccess = () => resolve();
      request.onerror = () => {
        const error: StorageError = new Error('Failed to save notification') as StorageError;
        error.type = 'unknown';
        error.recoverable = true;
        reject(error);
      };
    });
  }

  async getNotifications(profileId: string): Promise<Notification[]> {
    this.ensureDb();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['notifications'], 'readonly');
      const store = transaction.objectStore('notifications');
      const index = store.index('profileId');
      
      const request = index.getAll(profileId);
      
      request.onsuccess = () => {
        const notifications = request.result
          .map((notification: any) => ({
            ...notification,
            id: notification.id.replace(`${profileId}_`, ''),
            createdAt: new Date(notification.createdAt)
          }))
          .sort((a: Notification, b: Notification) => b.createdAt.getTime() - a.createdAt.getTime());
        resolve(notifications);
      };
      
      request.onerror = () => {
        const error: StorageError = new Error('Failed to load notifications') as StorageError;
        error.type = 'unknown';
        error.recoverable = true;
        reject(error);
      };
    });
  }

  async markNotificationAsRead(profileId: string, notificationId: string): Promise<void> {
    this.ensureDb();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['notifications'], 'readwrite');
      const store = transaction.objectStore('notifications');
      
      const getRequest = store.get(`${profileId}_${notificationId}`);
      
      getRequest.onsuccess = () => {
        const notification = getRequest.result;
        if (notification) {
          notification.isRead = true;
          const updateRequest = store.put(notification);
          
          updateRequest.onsuccess = () => resolve();
          updateRequest.onerror = () => {
            const error: StorageError = new Error('Failed to mark notification as read') as StorageError;
            error.type = 'unknown';
            error.recoverable = true;
            reject(error);
          };
        } else {
          resolve();
        }
      };
      
      getRequest.onerror = () => {
        const error: StorageError = new Error('Failed to find notification') as StorageError;
        error.type = 'unknown';
        error.recoverable = true;
        reject(error);
      };
    });
  }
}

export const storageService = new StorageService();