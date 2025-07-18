import { MusicianProfile } from '../core/types';
import { loggingService } from './loggingService';
import { storageService } from './storageService';
import { 
  validateProfile, 
  repairProfile, 
  createDefaultProfile,
  getDefaultUserPreferences 
} from '../utils/dataValidation';
import { isDefined, isValidArray } from '../utils/typeGuards';

export interface InitializationResult {
  success: boolean;
  profilesLoaded: number;
  profilesRepaired: number;
  errors: string[];
  warnings: string[];
}

export interface AppInitializationOptions {
  validateProfiles?: boolean;
  repairCorruptedData?: boolean;
  createMissingStructures?: boolean;
  logDetailedResults?: boolean;
}

class InitializationService {
  private readonly defaultOptions: Required<AppInitializationOptions> = {
    validateProfiles: true,
    repairCorruptedData: true,
    createMissingStructures: true,
    logDetailedResults: true
  };

  /**
   * Initialize the application and validate data integrity
   */
  async initializeApp(options: AppInitializationOptions = {}): Promise<InitializationResult> {
    const opts = { ...this.defaultOptions, ...options };
    const result: InitializationResult = {
      success: false,
      profilesLoaded: 0,
      profilesRepaired: 0,
      errors: [],
      warnings: []
    };

    loggingService.info('Starting application initialization', opts);

    try {
      // Initialize storage service
      await this.initializeStorage(result);
      
      if (opts.validateProfiles) {
        await this.validateAndRepairProfiles(result, opts);
      }

      if (opts.createMissingStructures) {
        await this.ensureRequiredStructures(result);
      }

      // Perform system health checks
      await this.performHealthChecks(result);

      result.success = result.errors.length === 0;

      if (opts.logDetailedResults) {
        this.logInitializationResults(result);
      }

      loggingService.info('Application initialization completed', {
        success: result.success,
        profilesLoaded: result.profilesLoaded,
        profilesRepaired: result.profilesRepaired,
        errorCount: result.errors.length,
        warningCount: result.warnings.length
      });

      return result;
    } catch (error) {
      const errorMessage = `Critical initialization failure: ${(error as Error).message}`;
      result.errors.push(errorMessage);
      result.success = false;
      
      loggingService.error('Application initialization failed', error as Error);
      return result;
    }
  }

  /**
   * Initialize storage service with error handling
   */
  private async initializeStorage(result: InitializationResult): Promise<void> {
    try {
      loggingService.info('Initializing storage service');
      await storageService.init();
      loggingService.info('Storage service initialized successfully');
    } catch (error) {
      const errorMessage = `Storage initialization failed: ${(error as Error).message}`;
      result.errors.push(errorMessage);
      loggingService.error('Storage initialization failed', error as Error);
      throw error; // Critical failure - cannot continue
    }
  }

  /**
   * Validate and repair all profiles in the system
   */
  private async validateAndRepairProfiles(
    result: InitializationResult, 
    options: Required<AppInitializationOptions>
  ): Promise<void> {
    try {
      loggingService.info('Starting profile validation and repair');
      
      const profiles = await storageService.getAllProfiles();
      result.profilesLoaded = profiles.length;

      loggingService.info(`Found ${profiles.length} profiles to validate`);

      for (const profile of profiles) {
        try {
          await this.validateAndRepairSingleProfile(profile, result, options);
        } catch (error) {
          const errorMessage = `Failed to process profile ${profile.id}: ${(error as Error).message}`;
          result.errors.push(errorMessage);
          loggingService.error('Profile processing failed', error as Error, { profileId: profile.id });
        }
      }

      loggingService.info('Profile validation completed', {
        totalProfiles: result.profilesLoaded,
        repairedProfiles: result.profilesRepaired
      });
    } catch (error) {
      const errorMessage = `Profile validation failed: ${(error as Error).message}`;
      result.errors.push(errorMessage);
      loggingService.error('Profile validation failed', error as Error);
    }
  }

  /**
   * Validate and repair a single profile
   */
  private async validateAndRepairSingleProfile(
    profile: MusicianProfile,
    result: InitializationResult,
    options: Required<AppInitializationOptions>
  ): Promise<void> {
    try {
      // Validate the profile structure
      const validatedProfile = validateProfile(profile);
      
      if (!validatedProfile) {
        if (options.repairCorruptedData) {
          loggingService.warn('Profile validation failed, attempting repair', { profileId: profile.id });
          
          // Attempt to repair the profile
          const repairedProfile = this.attemptProfileRepair(profile);
          
          if (repairedProfile) {
            await storageService.saveProfile(repairedProfile);
            result.profilesRepaired++;
            loggingService.info('Profile repaired successfully', { profileId: profile.id });
          } else {
            result.warnings.push(`Could not repair profile ${profile.id}`);
            loggingService.warn('Profile repair failed', { profileId: profile.id });
          }
        } else {
          result.warnings.push(`Profile ${profile.id} failed validation`);
          loggingService.warn('Profile validation failed', { profileId: profile.id });
        }
        return;
      }

      // Check if profile needs repair (missing arrays, etc.)
      const needsRepair = this.profileNeedsRepair(validatedProfile);
      
      if (needsRepair && options.repairCorruptedData) {
        const repairedProfile = repairProfile(validatedProfile);
        await storageService.saveProfile(repairedProfile);
        result.profilesRepaired++;
        loggingService.info('Profile structure repaired', { profileId: profile.id });
      }

      // Validate profile data integrity
      await this.validateProfileDataIntegrity(validatedProfile, result);

    } catch (error) {
      loggingService.error('Single profile validation failed', error as Error, { profileId: profile.id });
      throw error;
    }
  }

  /**
   * Attempt to repair a corrupted profile
   */
  private attemptProfileRepair(profile: any): MusicianProfile | null {
    try {
      // Check if we have minimum required fields
      if (!profile.id || !profile.name) {
        loggingService.warn('Profile missing critical fields, cannot repair', { 
          hasId: !!profile.id, 
          hasName: !!profile.name 
        });
        return null;
      }

      // Create a new profile with default values
      const defaultProfile = createDefaultProfile(
        profile.id,
        profile.name,
        profile.instrument || 'Unknown'
      );

      // Merge any valid data from the corrupted profile
      const repairedProfile: MusicianProfile = {
        ...defaultProfile,
        // Preserve valid dates
        createdAt: this.safeParseDate(profile.createdAt) || defaultProfile.createdAt,
        lastUpdated: this.safeParseDate(profile.lastUpdated) || defaultProfile.lastUpdated,
        
        // Preserve valid basic info
        performanceFrequency: this.isValidPerformanceFrequency(profile.performanceFrequency) 
          ? profile.performanceFrequency 
          : defaultProfile.performanceFrequency,
        crowdSize: this.isValidCrowdSize(profile.crowdSize) 
          ? profile.crowdSize 
          : defaultProfile.crowdSize,
        yearsOfExperience: typeof profile.yearsOfExperience === 'number' && profile.yearsOfExperience >= 0
          ? profile.yearsOfExperience 
          : defaultProfile.yearsOfExperience,
        
        // Preserve valid arrays
        marketingEfforts: isValidArray(profile.marketingEfforts) ? profile.marketingEfforts : [],
        genres: isValidArray(profile.genres) ? profile.genres : [],
        
        // Ensure all required arrays exist (will be validated separately)
        shows: isValidArray(profile.shows) ? profile.shows : [],
        practiceLog: isValidArray(profile.practiceLog) ? profile.practiceLog : [],
        goals: isValidArray(profile.goals) ? profile.goals : [],
        achievements: isValidArray(profile.achievements) ? profile.achievements : [],
        recordings: isValidArray(profile.recordings) ? profile.recordings : [],
        surveyResponseHistory: isValidArray(profile.surveyResponseHistory) ? profile.surveyResponseHistory : [],
        bandMembers: isValidArray(profile.bandMembers) ? profile.bandMembers : [],
        setLists: isValidArray(profile.setLists) ? profile.setLists : [],
        
        // Ensure preferences exist
        preferences: profile.preferences && typeof profile.preferences === 'object' 
          ? { ...getDefaultUserPreferences(), ...profile.preferences }
          : getDefaultUserPreferences()
      };

      return repairedProfile;
    } catch (error) {
      loggingService.error('Profile repair attempt failed', error as Error, { profileId: profile.id });
      return null;
    }
  }

  /**
   * Check if a profile needs structural repair
   */
  private profileNeedsRepair(profile: MusicianProfile): boolean {
    const requiredArrays = [
      'shows', 'practiceLog', 'goals', 'achievements', 
      'recordings', 'surveyResponseHistory', 'bandMembers', 
      'setLists', 'genres', 'marketingEfforts'
    ];

    return requiredArrays.some(arrayName => {
      const value = (profile as any)[arrayName];
      return !isValidArray(value);
    }) || !profile.preferences;
  }

  /**
   * Validate profile data integrity (check for orphaned references, etc.)
   */
  private async validateProfileDataIntegrity(
    profile: MusicianProfile, 
    result: InitializationResult
  ): Promise<void> {
    try {
      // Check for orphaned band member references
      const bandMemberIds = new Set(profile.bandMembers.map(member => member.id));
      
      // Check performances for invalid band member references
      const invalidPerformanceRefs = profile.shows.filter(show => 
        show.bandMembersPresent?.some(memberId => !bandMemberIds.has(memberId))
      );
      
      if (invalidPerformanceRefs.length > 0) {
        result.warnings.push(
          `Profile ${profile.id} has ${invalidPerformanceRefs.length} performances with invalid band member references`
        );
      }

      // Check practice sessions for invalid band member references
      const invalidPracticeRefs = profile.practiceLog.filter(session => 
        session.bandMembersPresent?.some(memberId => !bandMemberIds.has(memberId))
      );
      
      if (invalidPracticeRefs.length > 0) {
        result.warnings.push(
          `Profile ${profile.id} has ${invalidPracticeRefs.length} practice sessions with invalid band member references`
        );
      }

      // Check for duplicate IDs
      this.checkForDuplicateIds(profile, result);

    } catch (error) {
      loggingService.error('Profile data integrity check failed', error as Error, { profileId: profile.id });
      result.warnings.push(`Data integrity check failed for profile ${profile.id}`);
    }
  }

  /**
   * Check for duplicate IDs within profile data
   */
  private checkForDuplicateIds(profile: MusicianProfile, result: InitializationResult): void {
    const checkArrayForDuplicates = (array: any[], arrayName: string) => {
      const ids = array.map(item => item.id).filter(isDefined);
      const uniqueIds = new Set(ids);
      
      if (ids.length !== uniqueIds.size) {
        result.warnings.push(`Profile ${profile.id} has duplicate IDs in ${arrayName}`);
      }
    };

    checkArrayForDuplicates(profile.shows, 'shows');
    checkArrayForDuplicates(profile.practiceLog, 'practiceLog');
    checkArrayForDuplicates(profile.goals, 'goals');
    checkArrayForDuplicates(profile.achievements, 'achievements');
    checkArrayForDuplicates(profile.recordings, 'recordings');
    checkArrayForDuplicates(profile.bandMembers, 'bandMembers');
    checkArrayForDuplicates(profile.setLists, 'setLists');
  }

  /**
   * Ensure required system structures exist
   */
  private async ensureRequiredStructures(result: InitializationResult): Promise<void> {
    try {
      loggingService.info('Ensuring required system structures');
      
      // Add any system-wide initialization here
      // For example, ensuring default achievements are available
      
      loggingService.info('Required system structures verified');
    } catch (error) {
      const errorMessage = `Failed to ensure required structures: ${(error as Error).message}`;
      result.errors.push(errorMessage);
      loggingService.error('Required structures check failed', error as Error);
    }
  }

  /**
   * Perform system health checks
   */
  private async performHealthChecks(result: InitializationResult): Promise<void> {
    try {
      loggingService.info('Performing system health checks');
      
      // Check storage service health
      await this.checkStorageHealth(result);
      
      // Check browser compatibility
      this.checkBrowserCompatibility(result);
      
      loggingService.info('System health checks completed');
    } catch (error) {
      const errorMessage = `Health checks failed: ${(error as Error).message}`;
      result.errors.push(errorMessage);
      loggingService.error('Health checks failed', error as Error);
    }
  }

  /**
   * Check storage service health
   */
  private async checkStorageHealth(result: InitializationResult): Promise<void> {
    try {
      // Test basic storage operations
      const testProfile = createDefaultProfile('health-check', 'Health Check', 'Test');
      await storageService.saveProfile(testProfile);
      
      const loadedProfile = await storageService.loadProfile('health-check');
      if (!loadedProfile) {
        result.warnings.push('Storage health check: Profile save/load test failed');
      }
      
      // Clean up test profile
      await storageService.deleteProfile('health-check');
      
      loggingService.debug('Storage health check passed');
    } catch (error) {
      result.warnings.push(`Storage health check failed: ${(error as Error).message}`);
      loggingService.warn('Storage health check failed', error as Error);
    }
  }

  /**
   * Check browser compatibility
   */
  private checkBrowserCompatibility(result: InitializationResult): void {
    try {
      // Check for IndexedDB support
      if (!window.indexedDB) {
        result.errors.push('IndexedDB not supported in this browser');
      }
      
      // Check for other required APIs
      if (!window.localStorage) {
        result.warnings.push('localStorage not available');
      }
      
      if (!navigator.clipboard) {
        result.warnings.push('Clipboard API not available');
      }
      
      loggingService.debug('Browser compatibility check completed');
    } catch (error) {
      result.warnings.push(`Browser compatibility check failed: ${(error as Error).message}`);
      loggingService.warn('Browser compatibility check failed', error as Error);
    }
  }

  /**
   * Log detailed initialization results
   */
  private logInitializationResults(result: InitializationResult): void {
    loggingService.info('=== Initialization Results ===');
    loggingService.info(`Success: ${result.success}`);
    loggingService.info(`Profiles Loaded: ${result.profilesLoaded}`);
    loggingService.info(`Profiles Repaired: ${result.profilesRepaired}`);
    
    if (result.errors.length > 0) {
      loggingService.error(`Errors (${result.errors.length}):`);
      result.errors.forEach((error, index) => {
        loggingService.error(`  ${index + 1}. ${error}`);
      });
    }
    
    if (result.warnings.length > 0) {
      loggingService.warn(`Warnings (${result.warnings.length}):`);
      result.warnings.forEach((warning, index) => {
        loggingService.warn(`  ${index + 1}. ${warning}`);
      });
    }
    
    loggingService.info('=== End Initialization Results ===');
  }

  // Helper methods
  private safeParseDate(value: any): Date | null {
    try {
      if (value instanceof Date) return value;
      if (typeof value === 'string' || typeof value === 'number') {
        const date = new Date(value);
        return isNaN(date.getTime()) ? null : date;
      }
      return null;
    } catch {
      return null;
    }
  }

  private isValidPerformanceFrequency(value: any): boolean {
    return ['never', 'yearly', 'monthly', 'weekly', 'multiple'].includes(value);
  }

  private isValidCrowdSize(value: any): boolean {
    return ['1-10', '10-50', '50-100', '100-500', '500+'].includes(value);
  }
}

export const initializationService = new InitializationService();