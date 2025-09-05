import { bandMembershipService, bandService, userService } from '../../database/db.js';
import type { OnboardingData } from '../../database/types.js';
import { validateOnboardingData } from '../../database/validation.js';
import { debugLog, errorLog, infoLog } from '../../logger.js';
import { authService } from '../auth/AuthService.js';

/**
 * Onboarding service to handle complete onboarding process
 */
export class OnboardingService {
  /**
   * Complete onboarding for a user
   */
  async completeOnboarding(userId: number, onboardingData: OnboardingData): Promise<void> {
    debugLog('OnboardingService', 'Completing onboarding', { userId });

    try {
      // Validate onboarding data
      validateOnboardingData(onboardingData as unknown as Record<string, unknown>);

      // Update user with onboarding data
      await userService.updateOnboarding(userId, {
        primaryInstrument: onboardingData.primaryInstrument,
        playFrequency: onboardingData.playFrequency,
        genres: onboardingData.genres,
      });

      // Create bands and memberships if provided
      if (onboardingData.bands?.length > 0) {
        for (const bandData of onboardingData.bands) {
          // Create the band
          const bandId = await bandService.add({
            name: bandData.name,
            userId,
          });

          // Create the membership
          await bandMembershipService.add({
            userId,
            bandId,
            role: bandData.role,
            instrument: bandData.instrument,
            joinedAt: new Date(),
          });
        }
      }

      // Refresh the current user in AuthService to pick up the updated onboarding status
      await authService.refreshCurrentUser();

      infoLog('OnboardingService', 'Onboarding completed successfully', {
        userId,
        bandsCreated: onboardingData.bands?.length ?? 0,
      });
    } catch (error) {
      errorLog('OnboardingService', 'Failed to complete onboarding', error, { userId });
      throw error;
    }
  }

  /**
   * Check if user has completed onboarding
   */
  async isOnboardingComplete(userId: number): Promise<boolean> {
    try {
      const user = await userService.get(userId);
      return user?.onboardingCompleted || false;
    } catch (error) {
      errorLog('OnboardingService', 'Failed to check onboarding status', error, { userId });
      return false;
    }
  }

  /**
   * Get user's onboarding data
   */
  async getOnboardingData(userId: number): Promise<OnboardingData | null> {
    try {
      const user = await userService.get(userId);
      if (!user?.onboardingCompleted) {
        return null;
      }

      const userBands = await bandMembershipService.getUserBands(userId);

      return {
        primaryInstrument: user.primaryInstrument ?? '',
        playFrequency: user.playFrequency ?? 'weekly',
        genres: user.genres ?? [],
        bands: userBands.map(band => ({
          name: band.name,
          role: band.role,
          instrument: band.instrument,
        })),
      };
    } catch (error) {
      errorLog('OnboardingService', 'Failed to get onboarding data', error, { userId });
      return null;
    }
  }
}

// Export singleton instance
export const onboardingService = new OnboardingService();
