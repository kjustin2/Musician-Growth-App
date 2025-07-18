import { 
  MusicianProfile, 
  PerformanceRecord, 
  PracticeSession, 
  Goal, 
  Achievement,
  StorageError,
  RecordingSession,
  RecordedSong,
  SurveyResponse,
  Band,
  BandMember,
  SetList
} from '../core/types';
import { Achievement as AchievementType, Notification } from '../core/achievementTypes';
import { loggingService } from './loggingService';
import { 
  validateProfile, 
  repairProfile 
} from '../utils/dataValidation';

const DB_NAME = 'MusicianGrowthApp';
const DB_VERSION = 4; // Incremented to force upgrade for existing databases

export class StorageService {
  private db: IDBDatabase | null = null;
  private isInitialized = false;

  async init(): Promise<void> {
    loggingService.info('Initializing storage service', { dbName: DB_NAME, version: DB_VERSION });
    
    return new Promise((resolve, reject) => {
      try {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => {
          const error: StorageError = new Error('Failed to open database') as StorageError;
          error.type = 'browser_unsupported';
          error.recoverable = true;
          loggingService.error('Database initialization failed', error);
          reject(error);
        };

        request.onsuccess = () => {
          this.db = request.result;
          loggingService.info('Storage service initialized successfully');
          resolve();
        };

        request.onupgradeneeded = (event) => {
          loggingService.info('Database upgrade needed', { 
            oldVersion: event.oldVersion, 
            newVersion: event.newVersion 
          });
          const db = (event.target as IDBOpenDBRequest).result;
          this.createStores(db);
        };
      } catch (error) {
        loggingService.error('Error during storage initialization', error as Error);
        const storageError: StorageError = new Error('Storage initialization failed') as StorageError;
        storageError.type = 'unknown';
        storageError.recoverable = false;
        reject(storageError);
      }
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

    // Recording sessions store
    if (!db.objectStoreNames.contains('recording_sessions')) {
      const sessionStore = db.createObjectStore('recording_sessions', { keyPath: 'id' });
      sessionStore.createIndex('profileId', 'profileId', { unique: false });
      sessionStore.createIndex('date', 'date', { unique: false });
      sessionStore.createIndex('cost', 'cost', { unique: false });
    }

    // Recorded songs store
    if (!db.objectStoreNames.contains('recorded_songs')) {
      const songsStore = db.createObjectStore('recorded_songs', { keyPath: 'id' });
      songsStore.createIndex('profileId', 'profileId', { unique: false });
      songsStore.createIndex('recordingSessionId', 'recordingSessionId', { unique: false });
      songsStore.createIndex('plays', 'plays', { unique: false });
    }

    // Bands store
    if (!db.objectStoreNames.contains('bands')) {
      const bandsStore = db.createObjectStore('bands', { keyPath: 'id' });
      bandsStore.createIndex('profileId', 'profileId', { unique: false });
      bandsStore.createIndex('isActive', 'isActive', { unique: false });
    }

    // Survey responses history store
    if (!db.objectStoreNames.contains('survey_responses')) {
      const surveyStore = db.createObjectStore('survey_responses', { keyPath: 'id' });
      surveyStore.createIndex('profileId', 'profileId', { unique: false });
      surveyStore.createIndex('updatedAt', 'updatedAt', { unique: false });
    }

    // Band members store
    if (!db.objectStoreNames.contains('band_members')) {
      const bandMemberStore = db.createObjectStore('band_members', { keyPath: 'id' });
      bandMemberStore.createIndex('profileId', 'profileId', { unique: false });
      bandMemberStore.createIndex('instrument', 'instrument', { unique: false });
      bandMemberStore.createIndex('joinDate', 'joinDate', { unique: false });
    }

    // Participation records store
    if (!db.objectStoreNames.contains('participation_records')) {
      const participationStore = db.createObjectStore('participation_records', { keyPath: 'id' });
      participationStore.createIndex('bandMemberId', 'bandMemberId', { unique: false });
      participationStore.createIndex('activityType', 'activityType', { unique: false });
      participationStore.createIndex('date', 'date', { unique: false });
      participationStore.createIndex('activityId', 'activityId', { unique: false });
    }

    // Set lists store
    if (!db.objectStoreNames.contains('set_lists')) {
      const setListStore = db.createObjectStore('set_lists', { keyPath: 'id' });
      setListStore.createIndex('profileId', 'profileId', { unique: false });
      setListStore.createIndex('usageCount', 'usageCount', { unique: false });
      setListStore.createIndex('lastUsed', 'lastUsed', { unique: false });
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
    loggingService.info('Saving profile', { profileId: profile.id, profileName: profile.name });
    
    try {
      // Validate and repair profile data before saving
      const validatedProfile = validateProfile(profile);
      if (!validatedProfile) {
        throw new Error('Profile validation failed');
      }

      const repairedProfile = repairProfile(validatedProfile);
      
      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction(['profiles'], 'readwrite');
        const store = transaction.objectStore('profiles');
        
        const request = store.put({
          ...repairedProfile,
          lastUpdated: new Date()
        });

        request.onsuccess = () => {
          loggingService.info('Profile saved successfully', { profileId: profile.id });
          resolve();
        };
        
        request.onerror = () => {
          const error: StorageError = new Error('Failed to save profile') as StorageError;
          error.type = 'unknown';
          error.recoverable = true;
          loggingService.error('Profile save failed', error, { profileId: profile.id });
          reject(error);
        };
      });
    } catch (error) {
      loggingService.error('Profile validation/repair failed', error as Error, { profileId: profile.id });
      const storageError: StorageError = new Error('Profile data validation failed') as StorageError;
      storageError.type = 'data_corruption';
      storageError.recoverable = true;
      throw storageError;
    }
  }

  async loadProfile(profileId: string): Promise<MusicianProfile | null> {
    this.ensureDb();
    loggingService.info('Loading profile', { profileId });
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['profiles'], 'readonly');
      const store = transaction.objectStore('profiles');
      
      const request = store.get(profileId);

      request.onsuccess = () => {
        try {
          const rawProfile = request.result;
          if (rawProfile) {
            // Convert date strings back to Date objects
            rawProfile.createdAt = new Date(rawProfile.createdAt);
            rawProfile.lastUpdated = new Date(rawProfile.lastUpdated);
            
            // Validate and repair the loaded profile
            const validatedProfile = validateProfile(rawProfile);
            if (validatedProfile) {
              const repairedProfile = repairProfile(validatedProfile);
              loggingService.info('Profile loaded and validated successfully', { profileId });
              resolve(repairedProfile);
            } else {
              loggingService.warn('Profile validation failed during load', { profileId });
              // Return null for invalid profiles rather than throwing
              resolve(null);
            }
          } else {
            loggingService.info('Profile not found', { profileId });
            resolve(null);
          }
        } catch (error) {
          loggingService.error('Error processing loaded profile', error as Error, { profileId });
          // Try to return the raw profile if validation fails
          const rawProfile = request.result;
          if (rawProfile) {
            rawProfile.createdAt = new Date(rawProfile.createdAt);
            rawProfile.lastUpdated = new Date(rawProfile.lastUpdated);
            resolve(repairProfile(rawProfile));
          } else {
            resolve(null);
          }
        }
      };
      
      request.onerror = () => {
        const error: StorageError = new Error('Failed to load profile') as StorageError;
        error.type = 'unknown';
        error.recoverable = true;
        loggingService.error('Profile load failed', error, { profileId });
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
    
    return new Promise(async (resolve, reject) => {
      const transaction = this.db!.transaction(['performances'], 'readwrite');
      const store = transaction.objectStore('performances');
      
      const request = store.add({
        ...performance,
        profileId,
        date: new Date(performance.date)
      });

      request.onsuccess = async () => {
        try {
          // Update linked goals after successfully adding performance
          const { goalLinkingService } = await import('./goalLinkingService');
          await goalLinkingService.updateLinkedGoals(profileId, 'performance', performance);
          resolve();
        } catch (error) {
          // Log error but don't fail the performance creation
          loggingService.error('Failed to update linked goals after performance', error as Error);
          resolve();
        }
      };
      
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
    
    return new Promise(async (resolve, reject) => {
      const transaction = this.db!.transaction(['practice_sessions'], 'readwrite');
      const store = transaction.objectStore('practice_sessions');
      
      const request = store.add({
        ...session,
        profileId,
        date: new Date(session.date)
      });

      request.onsuccess = async () => {
        try {
          // Update linked goals after successfully adding practice session
          const { goalLinkingService } = await import('./goalLinkingService');
          await goalLinkingService.updateLinkedGoals(profileId, 'practice', session);
          resolve();
        } catch (error) {
          // Log error but don't fail the practice session creation
          loggingService.error('Failed to update linked goals after practice session', error as Error);
          resolve();
        }
      };
      
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
        unlockedAt: achievement.unlockedAt ? new Date(achievement.unlockedAt) : undefined
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



  // Band Members management
  async getBandMembers(profileId: string): Promise<BandMember[]> {
    this.ensureDb();
    
    return new Promise((resolve, reject) => {
      try {
        // Check if the band_members object store exists
        if (!this.db!.objectStoreNames.contains('band_members')) {
          loggingService.warn('Band members object store does not exist, returning empty array', { profileId });
          resolve([]);
          return;
        }

        const transaction = this.db!.transaction(['band_members'], 'readonly');
        const store = transaction.objectStore('band_members');
        
        // Check if the profileId index exists
        if (!store.indexNames.contains('profileId')) {
          loggingService.warn('ProfileId index does not exist in band_members store, returning empty array', { profileId });
          resolve([]);
          return;
        }

        const index = store.index('profileId');
        const request = index.getAll(profileId);

        request.onsuccess = () => {
          const bandMembers = request.result.map((member: any) => ({
            ...member,
            joinDate: new Date(member.joinDate),
            createdAt: new Date(member.createdAt),
            updatedAt: new Date(member.updatedAt)
          }));
          loggingService.info('Band members loaded successfully', { profileId, count: bandMembers.length });
          resolve(bandMembers);
        };
        
        request.onerror = () => {
          const error: StorageError = new Error('Failed to load band members') as StorageError;
          error.type = 'unknown';
          error.recoverable = true;
          loggingService.error('Failed to load band members', error, { profileId });
          reject(error);
        };

        transaction.onerror = () => {
          const error: StorageError = new Error('Transaction failed while loading band members') as StorageError;
          error.type = 'unknown';
          error.recoverable = true;
          loggingService.error('Transaction failed while loading band members', error, { profileId });
          reject(error);
        };
      } catch (error) {
        loggingService.error('Error in getBandMembers method', error as Error, { profileId });
        // Return empty array instead of rejecting to prevent blocking the UI
        resolve([]);
      }
    });
  }

  // Set Lists management
  async getSetLists(profileId: string): Promise<SetList[]> {
    this.ensureDb();
    
    return new Promise((resolve, reject) => {
      try {
        // Check if the set_lists object store exists
        if (!this.db!.objectStoreNames.contains('set_lists')) {
          loggingService.warn('Set lists object store does not exist, returning empty array', { profileId });
          resolve([]);
          return;
        }

        const transaction = this.db!.transaction(['set_lists'], 'readonly');
        const store = transaction.objectStore('set_lists');
        
        // Check if the profileId index exists
        if (!store.indexNames.contains('profileId')) {
          loggingService.warn('ProfileId index does not exist in set_lists store, returning empty array', { profileId });
          resolve([]);
          return;
        }

        const index = store.index('profileId');
        const request = index.getAll(profileId);

        request.onsuccess = () => {
          const setLists = request.result.map((setList: any) => ({
            ...setList,
            lastUsed: setList.lastUsed ? new Date(setList.lastUsed) : undefined,
            createdAt: new Date(setList.createdAt),
            updatedAt: new Date(setList.updatedAt)
          }));
          loggingService.info('Set lists loaded successfully', { profileId, count: setLists.length });
          resolve(setLists);
        };
        
        request.onerror = () => {
          const error: StorageError = new Error('Failed to load set lists') as StorageError;
          error.type = 'unknown';
          error.recoverable = true;
          loggingService.error('Failed to load set lists', error, { profileId });
          reject(error);
        };

        transaction.onerror = () => {
          const error: StorageError = new Error('Transaction failed while loading set lists') as StorageError;
          error.type = 'unknown';
          error.recoverable = true;
          loggingService.error('Transaction failed while loading set lists', error, { profileId });
          reject(error);
        };
      } catch (error) {
        loggingService.error('Error in getSetLists method', error as Error, { profileId });
        // Return empty array instead of rejecting to prevent blocking the UI
        resolve([]);
      }
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

  // Band management
  async getBands(profileId: string): Promise<Band[]> {
    this.ensureDb();
    
    return new Promise((resolve, reject) => {
      try {
        // Check if the bands object store exists
        if (!this.db!.objectStoreNames.contains('bands')) {
          loggingService.warn('Bands object store does not exist, returning empty array', { profileId });
          resolve([]);
          return;
        }

        const transaction = this.db!.transaction(['bands'], 'readonly');
        const store = transaction.objectStore('bands');
        
        // Check if the profileId index exists
        if (!store.indexNames.contains('profileId')) {
          loggingService.warn('ProfileId index does not exist in bands store, returning empty array', { profileId });
          resolve([]);
          return;
        }

        const index = store.index('profileId');
        const request = index.getAll(profileId);

        request.onsuccess = () => {
          const bands = request.result.map((band: any) => ({
            ...band,
            createdAt: new Date(band.createdAt),
            updatedAt: new Date(band.updatedAt)
          }));
          loggingService.info('Bands loaded successfully', { profileId, count: bands.length });
          resolve(bands);
        };
        
        request.onerror = () => {
          const error: StorageError = new Error('Failed to load bands') as StorageError;
          error.type = 'unknown';
          error.recoverable = true;
          loggingService.error('Failed to load bands', error, { profileId });
          reject(error);
        };

        transaction.onerror = () => {
          const error: StorageError = new Error('Transaction failed while loading bands') as StorageError;
          error.type = 'unknown';
          error.recoverable = true;
          loggingService.error('Transaction failed while loading bands', error, { profileId });
          reject(error);
        };
      } catch (error) {
        loggingService.error('Error in getBands method', error as Error, { profileId });
        // Return empty array instead of rejecting to prevent blocking the UI
        resolve([]);
      }
    });
  }

  async saveBand(profileId: string, band: Band): Promise<void> {
    this.ensureDb();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['bands'], 'readwrite');
      const store = transaction.objectStore('bands');
      
      const request = store.put({
        ...band,
        profileId,
        createdAt: new Date(band.createdAt),
        updatedAt: new Date(band.updatedAt)
      });

      request.onsuccess = () => resolve();
      request.onerror = () => {
        const error: StorageError = new Error('Failed to save band') as StorageError;
        error.type = 'unknown';
        error.recoverable = true;
        reject(error);
      };
    });
  }

  async saveBand(profileId: string, band: Band): Promise<void> {
    this.ensureDb();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['bands'], 'readwrite');
      const store = transaction.objectStore('bands');
      
      const request = store.put({
        ...band,
        profileId,
        createdAt: new Date(band.createdAt),
        updatedAt: new Date(band.updatedAt)
      });

      request.onsuccess = () => resolve();
      request.onerror = () => {
        const error: StorageError = new Error('Failed to save band') as StorageError;
        error.type = 'unknown';
        error.recoverable = true;
        reject(error);
      };
    });
  }

  async deleteBand(profileId: string, bandId: string): Promise<void> {
    this.ensureDb();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['bands'], 'readwrite');
      const store = transaction.objectStore('bands');
      
      const request = store.delete(bandId);

      request.onsuccess = () => resolve();
      request.onerror = () => {
        const error: StorageError = new Error('Failed to delete band') as StorageError;
        error.type = 'unknown';
        error.recoverable = true;
        reject(error);
      };
    });
  }

  // Recording management
  async getRecordingSessions(profileId: string): Promise<RecordingSession[]> {
    this.ensureDb();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['recording_sessions'], 'readonly');
      const store = transaction.objectStore('recording_sessions');
      const index = store.index('profileId');
      
      const request = index.getAll(profileId);

      request.onsuccess = () => {
        const sessions = request.result.map((session: any) => ({
          ...session,
          date: new Date(session.date),
          createdAt: new Date(session.createdAt),
          updatedAt: new Date(session.updatedAt)
        }));
        resolve(sessions);
      };
      
      request.onerror = () => {
        const error: StorageError = new Error('Failed to load recording sessions') as StorageError;
        error.type = 'unknown';
        error.recoverable = true;
        reject(error);
      };
    });
  }

  async addRecordingSession(profileId: string, recording: RecordingSession): Promise<void> {
    this.ensureDb();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['recording_sessions', 'recorded_songs'], 'readwrite');
      const sessionStore = transaction.objectStore('recording_sessions');
      const songsStore = transaction.objectStore('recorded_songs');
      
      // Add recording session
      const sessionRequest = sessionStore.add({
        ...recording,
        profileId,
        date: new Date(recording.date),
        createdAt: new Date(recording.createdAt),
        updatedAt: new Date(recording.updatedAt)
      });

      sessionRequest.onsuccess = () => {
        // Add associated songs
        let songsCompleted = 0;
        const totalSongs = recording.songs.length;

        if (totalSongs === 0) {
          resolve();
          return;
        }

        recording.songs.forEach(song => {
          const songRequest = songsStore.add({
            ...song,
            profileId
          });

          songRequest.onsuccess = () => {
            songsCompleted++;
            if (songsCompleted === totalSongs) {
              // Update linked goals after successfully adding recording session
              this.updateGoalsAfterRecording(profileId, recording)
                .then(() => resolve())
                .catch(() => resolve()); // Don't fail if goal update fails
            }
          };

          songRequest.onerror = () => {
            const error: StorageError = new Error('Failed to add recorded song') as StorageError;
            error.type = 'unknown';
            error.recoverable = true;
            reject(error);
          };
        });
      };

      sessionRequest.onerror = () => {
        const error: StorageError = new Error('Failed to add recording session') as StorageError;
        error.type = 'unknown';
        error.recoverable = true;
        reject(error);
      };
    });
  }

  async getRecordingSessions(profileId: string): Promise<RecordingSession[]> {
    this.ensureDb();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['recording_sessions', 'recorded_songs'], 'readonly');
      const sessionStore = transaction.objectStore('recording_sessions');
      const songsStore = transaction.objectStore('recorded_songs');
      
      const sessionIndex = sessionStore.index('profileId');
      const sessionRequest = sessionIndex.getAll(profileId);

      sessionRequest.onsuccess = () => {
        const sessions = sessionRequest.result;
        
        if (sessions.length === 0) {
          resolve([]);
          return;
        }

        // Get songs for all sessions
        const songsIndex = songsStore.index('profileId');
        const songsRequest = songsIndex.getAll(profileId);

        songsRequest.onsuccess = () => {
          const allSongs = songsRequest.result;
          
          // Group songs by recording session
          const songsBySession = allSongs.reduce((acc, song) => {
            if (!acc[song.recordingSessionId]) {
              acc[song.recordingSessionId] = [];
            }
            acc[song.recordingSessionId].push(song);
            return acc;
          }, {} as Record<string, RecordedSong[]>);

          // Combine sessions with their songs
          const recordings = sessions.map(session => ({
            ...session,
            date: new Date(session.date),
            createdAt: new Date(session.createdAt),
            updatedAt: new Date(session.updatedAt),
            songs: songsBySession[session.id] || []
          }));

          // Sort by date (newest first)
          recordings.sort((a, b) => b.date.getTime() - a.date.getTime());
          resolve(recordings);
        };

        songsRequest.onerror = () => {
          const error: StorageError = new Error('Failed to load recorded songs') as StorageError;
          error.type = 'unknown';
          error.recoverable = true;
          reject(error);
        };
      };
      
      sessionRequest.onerror = () => {
        const error: StorageError = new Error('Failed to load recording sessions') as StorageError;
        error.type = 'unknown';
        error.recoverable = true;
        reject(error);
      };
    });
  }

  async updateSongMetrics(songId: string, plays: number, revenue: number): Promise<void> {
    this.ensureDb();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['recorded_songs', 'recording_sessions'], 'readwrite');
      const songsStore = transaction.objectStore('recorded_songs');
      const sessionStore = transaction.objectStore('recording_sessions');
      
      const getSongRequest = songsStore.get(songId);
      
      getSongRequest.onsuccess = () => {
        const song = getSongRequest.result;
        if (!song) {
          reject(new Error('Song not found'));
          return;
        }

        // Update song metrics
        song.plays = plays;
        song.revenue = revenue;
        
        const updateSongRequest = songsStore.put(song);
        
        updateSongRequest.onsuccess = () => {
          // Update recording session totals
          const songsIndex = songsStore.index('recordingSessionId');
          const sessionSongsRequest = songsIndex.getAll(song.recordingSessionId);
          
          sessionSongsRequest.onsuccess = () => {
            const sessionSongs = sessionSongsRequest.result;
            const totalPlays = sessionSongs.reduce((sum, s) => sum + s.plays, 0);
            const totalRevenue = sessionSongs.reduce((sum, s) => sum + s.revenue, 0);
            
            const getSessionRequest = sessionStore.get(song.recordingSessionId);
            
            getSessionRequest.onsuccess = () => {
              const session = getSessionRequest.result;
              if (session) {
                session.totalPlays = totalPlays;
                session.totalRevenue = totalRevenue;
                session.updatedAt = new Date();
                
                const updateSessionRequest = sessionStore.put(session);
                updateSessionRequest.onsuccess = () => resolve();
                updateSessionRequest.onerror = () => {
                  const error: StorageError = new Error('Failed to update session totals') as StorageError;
                  error.type = 'unknown';
                  error.recoverable = true;
                  reject(error);
                };
              } else {
                resolve();
              }
            };
            
            getSessionRequest.onerror = () => {
              const error: StorageError = new Error('Failed to load session for update') as StorageError;
              error.type = 'unknown';
              error.recoverable = true;
              reject(error);
            };
          };
          
          sessionSongsRequest.onerror = () => {
            const error: StorageError = new Error('Failed to load session songs') as StorageError;
            error.type = 'unknown';
            error.recoverable = true;
            reject(error);
          };
        };
        
        updateSongRequest.onerror = () => {
          const error: StorageError = new Error('Failed to update song metrics') as StorageError;
          error.type = 'unknown';
          error.recoverable = true;
          reject(error);
        };
      };
      
      getSongRequest.onerror = () => {
        const error: StorageError = new Error('Failed to load song for update') as StorageError;
        error.type = 'unknown';
        error.recoverable = true;
        reject(error);
      };
    });
  }

  async bulkAddRecordings(profileId: string, recordings: RecordingSession[]): Promise<void> {
    this.ensureDb();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['recording_sessions', 'recorded_songs'], 'readwrite');
      const sessionStore = transaction.objectStore('recording_sessions');
      const songsStore = transaction.objectStore('recorded_songs');
      
      let completed = 0;
      const total = recordings.length;

      if (total === 0) {
        resolve();
        return;
      }

      recordings.forEach(recording => {
        const sessionRequest = sessionStore.add({
          ...recording,
          profileId,
          date: new Date(recording.date),
          createdAt: new Date(recording.createdAt),
          updatedAt: new Date(recording.updatedAt)
        });

        sessionRequest.onsuccess = () => {
          // Add songs for this recording
          let songsCompleted = 0;
          const totalSongs = recording.songs.length;

          if (totalSongs === 0) {
            completed++;
            if (completed === total) {
              resolve();
            }
            return;
          }

          recording.songs.forEach(song => {
            const songRequest = songsStore.add({
              ...song,
              profileId
            });

            songRequest.onsuccess = () => {
              songsCompleted++;
              if (songsCompleted === totalSongs) {
                completed++;
                if (completed === total) {
                  resolve();
                }
              }
            };

            songRequest.onerror = () => {
              const error: StorageError = new Error('Failed to add song in bulk operation') as StorageError;
              error.type = 'unknown';
              error.recoverable = true;
              reject(error);
            };
          });
        };

        sessionRequest.onerror = () => {
          const error: StorageError = new Error('Failed to add recording in bulk operation') as StorageError;
          error.type = 'unknown';
          error.recoverable = true;
          reject(error);
        };
      });
    });
  }

  // Survey response management
  async saveSurveyResponse(profileId: string, response: SurveyResponse): Promise<void> {
    this.ensureDb();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['survey_responses'], 'readwrite');
      const store = transaction.objectStore('survey_responses');
      
      const request = store.put({
        ...response,
        profileId,
        updatedAt: new Date(response.updatedAt)
      });

      request.onsuccess = () => resolve();
      request.onerror = () => {
        const error: StorageError = new Error('Failed to save survey response') as StorageError;
        error.type = 'unknown';
        error.recoverable = true;
        reject(error);
      };
    });
  }

  async getSurveyResponses(profileId: string): Promise<SurveyResponse[]> {
    this.ensureDb();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['survey_responses'], 'readonly');
      const store = transaction.objectStore('survey_responses');
      const index = store.index('profileId');
      
      const request = index.getAll(profileId);

      request.onsuccess = () => {
        const responses = request.result.map((response: any) => ({
          ...response,
          updatedAt: new Date(response.updatedAt)
        }));
        // Sort by updatedAt (newest first)
        responses.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
        resolve(responses);
      };
      
      request.onerror = () => {
        const error: StorageError = new Error('Failed to load survey responses') as StorageError;
        error.type = 'unknown';
        error.recoverable = true;
        reject(error);
      };
    });
  }

  // Helper method to update goals after recording
  private async updateGoalsAfterRecording(profileId: string, recording: RecordingSession): Promise<void> {
    try {
      const { goalLinkingService } = await import('./goalLinkingService');
      await goalLinkingService.updateLinkedGoals(profileId, 'recording', recording);
    } catch (error) {
      loggingService.error('Failed to update linked goals after recording', error as Error);
      // Don't throw - we don't want to fail the recording creation
    }
  }

  // Band management methods
  async saveBand(profileId: string, band: import('../core/types').Band): Promise<void> {
    this.ensureDb();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['bands'], 'readwrite');
      const store = transaction.objectStore('bands');
      
      const request = store.put({
        ...band,
        profileId,
        createdAt: new Date(band.createdAt),
        updatedAt: new Date()
      });

      request.onsuccess = () => {
        loggingService.info('Band saved successfully', { 
          profileId, 
          bandId: band.id, 
          bandName: band.name 
        });
        resolve();
      };
      
      request.onerror = () => {
        const error: StorageError = new Error('Failed to save band') as StorageError;
        error.type = 'unknown';
        error.recoverable = true;
        loggingService.error('Failed to save band', error);
        reject(error);
      };
    });
  }

  async getBands(profileId: string): Promise<Band[]> {
    this.ensureDb();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['bands'], 'readonly');
      const store = transaction.objectStore('bands');
      const index = store.index('profileId');
      
      const request = index.getAll(profileId);

      request.onsuccess = () => {
        const bands = request.result.map((band: any) => ({
          ...band,
          createdAt: new Date(band.createdAt),
          updatedAt: new Date(band.updatedAt)
        }));
        
        loggingService.info('Bands retrieved successfully', { 
          profileId, 
          bandCount: bands.length 
        });
        resolve(bands);
      };
      
      request.onerror = () => {
        const error: StorageError = new Error('Failed to retrieve bands') as StorageError;
        error.type = 'unknown';
        error.recoverable = true;
        loggingService.error('Failed to retrieve bands', error);
        reject(error);
      };
    });
  }

  async deleteBand(profileId: string, bandId: string): Promise<void> {
    this.ensureDb();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['bands'], 'readwrite');
      const store = transaction.objectStore('bands');
      
      const request = store.delete(bandId);

      request.onsuccess = () => {
        loggingService.info('Band deleted successfully', { 
          profileId, 
          bandId 
        });
        resolve();
      };
      
      request.onerror = () => {
        const error: StorageError = new Error('Failed to delete band') as StorageError;
        error.type = 'unknown';
        error.recoverable = true;
        loggingService.error('Failed to delete band', error);
        reject(error);
      };
    });
  }

  // Recording session management
  async saveRecordingSession(profileId: string, recording: RecordingSession): Promise<void> {
    this.ensureDb();
    loggingService.info('Saving recording session', { profileId, recordingId: recording.id });
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['recording_sessions', 'recorded_songs'], 'readwrite');
      const sessionStore = transaction.objectStore('recording_sessions');
      const songsStore = transaction.objectStore('recorded_songs');
      
      // Save recording session
      const sessionRequest = sessionStore.put({
        ...recording,
        profileId,
        date: new Date(recording.date)
      });

      sessionRequest.onsuccess = () => {
        // Save associated songs
        let songsCompleted = 0;
        const totalSongs = recording.songs.length;
        
        if (totalSongs === 0) {
          resolve();
          return;
        }

        recording.songs.forEach(song => {
          const songRequest = songsStore.put({
            ...song,
            profileId,
            recordingSessionId: recording.id
          });
          
          songRequest.onsuccess = () => {
            songsCompleted++;
            if (songsCompleted === totalSongs) {
              loggingService.info('Recording session saved successfully', { profileId, recordingId: recording.id });
              resolve();
            }
          };
          
          songRequest.onerror = () => {
            const error: StorageError = new Error('Failed to save recorded song') as StorageError;
            error.type = 'unknown';
            error.recoverable = true;
            loggingService.error('Failed to save recorded song', error);
            reject(error);
          };
        });
      };
      
      sessionRequest.onerror = () => {
        const error: StorageError = new Error('Failed to save recording session') as StorageError;
        error.type = 'unknown';
        error.recoverable = true;
        loggingService.error('Failed to save recording session', error);
        reject(error);
      };
    });
  }

  async getRecordingSessions(profileId: string): Promise<RecordingSession[]> {
    this.ensureDb();
    loggingService.info('Loading recording sessions', { profileId });
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['recording_sessions', 'recorded_songs'], 'readonly');
      const sessionStore = transaction.objectStore('recording_sessions');
      const songsStore = transaction.objectStore('recorded_songs');
      
      const sessionIndex = sessionStore.index('profileId');
      const sessionRequest = sessionIndex.getAll(profileId);
      
      sessionRequest.onsuccess = () => {
        const sessions = sessionRequest.result;
        
        if (sessions.length === 0) {
          resolve([]);
          return;
        }

        // Get songs for each session
        const songsIndex = songsStore.index('profileId');
        const songsRequest = songsIndex.getAll(profileId);
        
        songsRequest.onsuccess = () => {
          const allSongs = songsRequest.result;
          
          // Group songs by recording session
          const songsBySession = allSongs.reduce((acc, song) => {
            if (!acc[song.recordingSessionId]) {
              acc[song.recordingSessionId] = [];
            }
            acc[song.recordingSessionId].push(song);
            return acc;
          }, {} as Record<string, RecordedSong[]>);
          
          // Combine sessions with their songs
          const recordings = sessions.map(session => ({
            ...session,
            date: new Date(session.date),
            songs: songsBySession[session.id] || []
          }));
          
          // Sort by date (newest first)
          const sortedRecordings = recordings.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          
          loggingService.info('Recording sessions loaded successfully', { profileId, count: sortedRecordings.length });
          resolve(sortedRecordings);
        };
        
        songsRequest.onerror = () => {
          const error: StorageError = new Error('Failed to load recorded songs') as StorageError;
          error.type = 'unknown';
          error.recoverable = true;
          loggingService.error('Failed to load recorded songs', error);
          reject(error);
        };
      };
      
      sessionRequest.onerror = () => {
        const error: StorageError = new Error('Failed to load recording sessions') as StorageError;
        error.type = 'unknown';
        error.recoverable = true;
        loggingService.error('Failed to load recording sessions', error);
        reject(error);
      };
    });
  }

  async updateSongMetrics(songId: string, plays: number, revenue: number): Promise<void> {
    this.ensureDb();
    loggingService.info('Updating song metrics', { songId, plays, revenue });
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['recorded_songs', 'recording_sessions'], 'readwrite');
      const songsStore = transaction.objectStore('recorded_songs');
      const sessionStore = transaction.objectStore('recording_sessions');
      
      const getSongRequest = songsStore.get(songId);
      
      getSongRequest.onsuccess = () => {
        const song = getSongRequest.result;
        if (!song) {
          const error: StorageError = new Error('Song not found') as StorageError;
          error.type = 'unknown';
          error.recoverable = false;
          reject(error);
          return;
        }
        
        // Update song metrics
        song.plays = plays;
        song.revenue = revenue;
        
        const updateSongRequest = songsStore.put(song);
        
        updateSongRequest.onsuccess = () => {
          // Update recording session totals
          const songsIndex = songsStore.index('recordingSessionId');
          const sessionSongsRequest = songsIndex.getAll(song.recordingSessionId);
          
          sessionSongsRequest.onsuccess = () => {
            const sessionSongs = sessionSongsRequest.result;
            const totalPlays = sessionSongs.reduce((sum, s) => sum + (s.plays || 0), 0);
            const totalRevenue = sessionSongs.reduce((sum, s) => sum + (s.revenue || 0), 0);
            
            const getSessionRequest = sessionStore.get(song.recordingSessionId);
            
            getSessionRequest.onsuccess = () => {
              const session = getSessionRequest.result;
              if (session) {
                session.totalPlays = totalPlays;
                session.totalRevenue = totalRevenue;
                session.updatedAt = new Date();
                
                const updateSessionRequest = sessionStore.put(session);
                updateSessionRequest.onsuccess = () => {
                  loggingService.info('Song metrics updated successfully', { songId });
                  resolve();
                };
                updateSessionRequest.onerror = () => {
                  const error: StorageError = new Error('Failed to update session totals') as StorageError;
                  error.type = 'unknown';
                  error.recoverable = true;
                  reject(error);
                };
              } else {
                resolve(); // Session not found, but song was updated
              }
            };
            
            getSessionRequest.onerror = () => {
              resolve(); // Session not found, but song was updated
            };
          };
          
          sessionSongsRequest.onerror = () => {
            resolve(); // Could not update totals, but song was updated
          };
        };
        
        updateSongRequest.onerror = () => {
          const error: StorageError = new Error('Failed to update song metrics') as StorageError;
          error.type = 'unknown';
          error.recoverable = true;
          reject(error);
        };
      };
      
      getSongRequest.onerror = () => {
        const error: StorageError = new Error('Failed to find song') as StorageError;
        error.type = 'unknown';
        error.recoverable = true;
        reject(error);
      };
    });
  }

  async deleteRecordingSession(recordingId: string): Promise<void> {
    this.ensureDb();
    loggingService.info('Deleting recording session', { recordingId });
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['recording_sessions', 'recorded_songs'], 'readwrite');
      const sessionStore = transaction.objectStore('recording_sessions');
      const songsStore = transaction.objectStore('recorded_songs');
      
      // First, delete all songs for this recording session
      const songsIndex = songsStore.index('recordingSessionId');
      const songsRequest = songsIndex.getAll(recordingId);
      
      songsRequest.onsuccess = () => {
        const songs = songsRequest.result;
        let songsDeleted = 0;
        
        if (songs.length === 0) {
          // No songs to delete, proceed to delete session
          const deleteSessionRequest = sessionStore.delete(recordingId);
          deleteSessionRequest.onsuccess = () => {
            loggingService.info('Recording session deleted successfully', { recordingId });
            resolve();
          };
          deleteSessionRequest.onerror = () => {
            const error: StorageError = new Error('Failed to delete recording session') as StorageError;
            error.type = 'unknown';
            error.recoverable = true;
            reject(error);
          };
          return;
        }
        
        // Delete each song
        songs.forEach(song => {
          const deleteSongRequest = songsStore.delete(song.id);
          
          deleteSongRequest.onsuccess = () => {
            songsDeleted++;
            if (songsDeleted === songs.length) {
              // All songs deleted, now delete the session
              const deleteSessionRequest = sessionStore.delete(recordingId);
              deleteSessionRequest.onsuccess = () => {
                loggingService.info('Recording session deleted successfully', { recordingId });
                resolve();
              };
              deleteSessionRequest.onerror = () => {
                const error: StorageError = new Error('Failed to delete recording session') as StorageError;
                error.type = 'unknown';
                error.recoverable = true;
                reject(error);
              };
            }
          };
          
          deleteSongRequest.onerror = () => {
            const error: StorageError = new Error('Failed to delete recorded song') as StorageError;
            error.type = 'unknown';
            error.recoverable = true;
            reject(error);
          };
        });
      };
      
      songsRequest.onerror = () => {
        const error: StorageError = new Error('Failed to find songs for recording session') as StorageError;
        error.type = 'unknown';
        error.recoverable = true;
        reject(error);
      };
    });
  }
}

export const storageService = new StorageService();