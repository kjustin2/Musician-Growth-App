import { Goal, PerformanceRecord, PracticeSession, RecordingSession } from '../core/types';
import { storageService } from './storageService';
import { loggingService } from './loggingService';

export class GoalLinkingError extends Error {
  constructor(
    message: string,
    public code: 'GOAL_NOT_FOUND' | 'INVALID_METRIC' | 'CALCULATION_FAILED',
    public goalId?: string
  ) {
    super(message);
    this.name = 'GoalLinkingError';
  }
}

class GoalLinkingService {
  /**
   * Update all linked goals when a new activity is added
   */
  async updateLinkedGoals(
    profileId: string,
    activityType: 'performance' | 'practice' | 'recording',
    activityData: PerformanceRecord | PracticeSession | RecordingSession
  ): Promise<void> {
    try {
      loggingService.info('Updating linked goals', {
        profileId,
        activityType,
        activityId: activityData.id
      });

      const goals = await storageService.getGoals(profileId);
      const linkedGoals = goals.filter(goal => 
        goal.autoUpdate && 
        this.isGoalLinkedToActivity(goal, activityType)
      );

      for (const goal of linkedGoals) {
        await this.updateGoalProgress(profileId, goal, activityData);
      }

      loggingService.info('Successfully updated linked goals', {
        profileId,
        updatedGoalsCount: linkedGoals.length
      });
    } catch (error) {
      loggingService.error('Goal linking update failed', error as Error, {
        profileId,
        activityType
      });
      // Continue execution - don't block activity creation
    }
  }

  /**
   * Check if a goal is linked to a specific activity type
   */
  private isGoalLinkedToActivity(goal: Goal, activityType: string): boolean {
    const activityMetrics = {
      performance: ['show_count', 'audience_size', 'performance_earnings', 'total_earnings'],
      practice: ['practice_time', 'practice_sessions'],
      recording: ['recording_count', 'songs_recorded']
    };

    const relevantMetrics = activityMetrics[activityType as keyof typeof activityMetrics] || [];
    return relevantMetrics.includes(goal.linkedMetric);
  }

  /**
   * Update a specific goal's progress based on new activity
   */
  private async updateGoalProgress(
    profileId: string,
    goal: Goal,
    activityData: PerformanceRecord | PracticeSession | RecordingSession
  ): Promise<void> {
    try {
      const newValue = await this.calculateNewGoalValue(profileId, goal);
      
      if (newValue !== goal.currentValue) {
        // Add progress history entry
        const progressEntry = {
          date: new Date(),
          value: newValue,
          triggeredBy: activityData.id
        };

        const updatedGoal: Goal = {
          ...goal,
          currentValue: newValue,
          progressHistory: [...goal.progressHistory, progressEntry],
          lastAutoUpdate: new Date()
        };

        // Check if goal is completed
        if (goal.targetValue && newValue >= goal.targetValue && goal.status === 'active') {
          updatedGoal.status = 'completed';
          loggingService.info('Goal completed automatically', {
            profileId,
            goalId: goal.id,
            goalTitle: goal.title
          });
        }

        await storageService.saveGoal(profileId, updatedGoal);
        
        loggingService.info('Goal progress updated', {
          profileId,
          goalId: goal.id,
          oldValue: goal.currentValue,
          newValue,
          triggeredBy: activityData.id
        });
      }
    } catch (error) {
      throw new GoalLinkingError(
        `Failed to update goal progress: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'CALCULATION_FAILED',
        goal.id
      );
    }
  }

  /**
   * Calculate the new value for a goal based on current data
   */
  private async calculateNewGoalValue(profileId: string, goal: Goal): Promise<number> {
    try {
      switch (goal.linkedMetric) {
        case 'show_count':
          return await this.calculateShowCount(profileId, goal);
        
        case 'audience_size':
          return await this.calculateTotalAudienceSize(profileId, goal);
        
        case 'performance_earnings':
          return await this.calculatePerformanceEarnings(profileId, goal);
        
        case 'total_earnings':
          return await this.calculateTotalEarnings(profileId, goal);
        
        case 'practice_time':
          return await this.calculatePracticeTime(profileId);
        
        case 'practice_sessions':
          return await this.calculatePracticeSessions(profileId);
        
        case 'recording_count':
          return await this.calculateRecordingCount(profileId);
        
        case 'songs_recorded':
          return await this.calculateSongsRecorded(profileId);
        
        default:
          loggingService.warn('Unknown metric type', { metric: goal.linkedMetric });
          return goal.currentValue;
      }
    } catch (error) {
      loggingService.error('Error calculating goal value', error as Error, {
        profileId,
        goalId: goal.id,
        metric: goal.linkedMetric
      });
      return goal.currentValue;
    }
  }

  // Metric calculation methods
  private async calculateShowCount(profileId: string, goal: Goal): Promise<number> {
    const performances = await storageService.getPerformances(profileId);
    
    if (goal.bandSpecific && goal.selectedBands.length > 0) {
      return performances.filter(p => 
        goal.selectedBands.includes((p as any).bandId || '')
      ).length;
    }
    
    return performances.length;
  }

  private async calculateTotalAudienceSize(profileId: string, goal: Goal): Promise<number> {
    const performances = await storageService.getPerformances(profileId);
    
    let relevantPerformances = performances;
    if (goal.bandSpecific && goal.selectedBands.length > 0) {
      relevantPerformances = performances.filter(p => 
        goal.selectedBands.includes((p as any).bandId || '')
      );
    }
    
    return relevantPerformances.reduce((sum, p) => sum + p.audienceSize, 0);
  }

  private async calculatePerformanceEarnings(profileId: string, goal: Goal): Promise<number> {
    const performances = await storageService.getPerformances(profileId);
    
    let relevantPerformances = performances;
    if (goal.bandSpecific && goal.selectedBands.length > 0) {
      relevantPerformances = performances.filter(p => 
        goal.selectedBands.includes((p as any).bandId || '')
      );
    }
    
    return relevantPerformances.reduce((sum, p) => sum + p.payment, 0);
  }

  private async calculateTotalEarnings(profileId: string, goal: Goal): Promise<number> {
    const [performances, recordings] = await Promise.all([
      storageService.getPerformances(profileId),
      storageService.getRecordingSessions(profileId)
    ]);
    
    const performanceEarnings = performances.reduce((sum, p) => sum + p.payment, 0);
    const recordingEarnings = recordings.reduce((sum, r) => sum + (r.totalRevenue || 0), 0);
    
    return performanceEarnings + recordingEarnings;
  }

  private async calculatePracticeTime(profileId: string): Promise<number> {
    const practiceSessions = await storageService.getPracticeSessions(profileId);
    return practiceSessions.reduce((sum, p) => sum + p.duration, 0);
  }

  private async calculatePracticeSessions(profileId: string): Promise<number> {
    const practiceSessions = await storageService.getPracticeSessions(profileId);
    return practiceSessions.length;
  }

  private async calculateRecordingCount(profileId: string): Promise<number> {
    const recordings = await storageService.getRecordingSessions(profileId);
    return recordings.length;
  }

  private async calculateSongsRecorded(profileId: string): Promise<number> {
    const recordings = await storageService.getRecordingSessions(profileId);
    return recordings.reduce((sum, r) => sum + (r.songs?.length || 0), 0);
  }

  /**
   * Manually update a goal's progress (for non-linked goals or manual adjustments)
   */
  async updateGoalManually(
    profileId: string,
    goalId: string,
    newValue: number,
    note?: string
  ): Promise<void> {
    try {
      const goals = await storageService.getGoals(profileId);
      const goal = goals.find(g => g.id === goalId);
      
      if (!goal) {
        throw new GoalLinkingError('Goal not found', 'GOAL_NOT_FOUND', goalId);
      }

      const progressEntry = {
        date: new Date(),
        value: newValue,
        triggeredBy: note || 'manual_update'
      };

      const updatedGoal: Goal = {
        ...goal,
        currentValue: newValue,
        progressHistory: [...goal.progressHistory, progressEntry]
      };

      // Check if goal is completed
      if (goal.targetValue && newValue >= goal.targetValue && goal.status === 'active') {
        updatedGoal.status = 'completed';
      }

      await storageService.saveGoal(profileId, updatedGoal);
      
      loggingService.info('Goal manually updated', {
        profileId,
        goalId,
        oldValue: goal.currentValue,
        newValue,
        note
      });
    } catch (error) {
      loggingService.error('Manual goal update failed', error as Error, {
        profileId,
        goalId,
        newValue
      });
      throw error;
    }
  }

  /**
   * Update goals for a specific action (alias for updateLinkedGoals for backward compatibility)
   */
  async updateGoalsForAction(
    profileId: string,
    actionType: 'performance' | 'practice' | 'recording',
    actionData: PerformanceRecord | PracticeSession | RecordingSession
  ): Promise<void> {
    return this.updateLinkedGoals(profileId, actionType, actionData);
  }

  /**
   * Recalculate all linked goals for a profile (useful for data consistency)
   */
  async recalculateAllGoals(profileId: string): Promise<void> {
    try {
      loggingService.info('Recalculating all goals', { profileId });
      
      const goals = await storageService.getGoals(profileId);
      const linkedGoals = goals.filter(goal => goal.autoUpdate);

      for (const goal of linkedGoals) {
        const newValue = await this.calculateNewGoalValue(profileId, goal);
        
        if (newValue !== goal.currentValue) {
          const progressEntry = {
            date: new Date(),
            value: newValue,
            triggeredBy: 'recalculation'
          };

          const updatedGoal: Goal = {
            ...goal,
            currentValue: newValue,
            progressHistory: [...goal.progressHistory, progressEntry],
            lastAutoUpdate: new Date()
          };

          // Check if goal is completed
          if (goal.targetValue && newValue >= goal.targetValue && goal.status === 'active') {
            updatedGoal.status = 'completed';
          }

          await storageService.saveGoal(profileId, updatedGoal);
        }
      }

      loggingService.info('Successfully recalculated all goals', {
        profileId,
        processedGoals: linkedGoals.length
      });
    } catch (error) {
      loggingService.error('Goal recalculation failed', error as Error, { profileId });
      throw error;
    }
  }
}

export const goalLinkingService = new GoalLinkingService();