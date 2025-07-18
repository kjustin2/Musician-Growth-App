import { 
  Goal, 
  PerformanceRecord, 
  PracticeSession, 
  RecordingSession 
} from '../core/types';

export interface ActionGoalMapping {
  actionType: 'performance' | 'practice' | 'recording';
  metrics: string[];
  validator: (goal: Goal) => boolean;
}

/**
 * Mapping of action types to their related goal metrics
 */
export const ACTION_GOAL_MAPPINGS: ActionGoalMapping[] = [
  {
    actionType: 'performance',
    metrics: [
      'show_count',
      'performance_earnings',
      'average_audience_size',
      'total_earnings',
      'net_income'
    ],
    validator: (goal: Goal) => 
      goal.type === 'performance' || 
      goal.type === 'financial'
  },
  {
    actionType: 'practice',
    metrics: [
      'practice_time_total',
      'practice_sessions_count',
      'practice_frequency'
    ],
    validator: (goal: Goal) => 
      goal.type === 'skill'
  },
  {
    actionType: 'recording',
    metrics: [
      'recorded_songs_count',
      'recording_sessions_count',
      'recording_revenue',
      'recording_investment',
      'total_earnings',
      'net_income'
    ],
    validator: (goal: Goal) => 
      goal.type === 'recording' || 
      goal.type === 'financial'
  }
];

/**
 * Get goals that should be updated for a specific action type
 */
export function getGoalsForAction(
  goals: Goal[], 
  actionType: 'performance' | 'practice' | 'recording'
): Goal[] {
  const mapping = ACTION_GOAL_MAPPINGS.find(m => m.actionType === actionType);
  if (!mapping) return [];

  return goals.filter(goal => 
    goal.autoUpdate && 
    mapping.validator(goal) &&
    mapping.metrics.includes(goal.linkedMetric)
  );
}

/**
 * Validate if a goal metric is compatible with an action type
 */
export function isMetricCompatibleWithAction(
  metric: string, 
  actionType: 'performance' | 'practice' | 'recording'
): boolean {
  const mapping = ACTION_GOAL_MAPPINGS.find(m => m.actionType === actionType);
  return mapping ? mapping.metrics.includes(metric) : false;
}

/**
 * Get all metrics that can be updated by a specific action type
 */
export function getMetricsForActionType(actionType: 'performance' | 'practice' | 'recording'): string[] {
  const mapping = ACTION_GOAL_MAPPINGS.find(m => m.actionType === actionType);
  return mapping ? mapping.metrics : [];
}

/**
 * Determine which action types can update a specific metric
 */
export function getActionTypesForMetric(metric: string): ('performance' | 'practice' | 'recording')[] {
  return ACTION_GOAL_MAPPINGS
    .filter(mapping => mapping.metrics.includes(metric))
    .map(mapping => mapping.actionType);
}

/**
 * Validate goal configuration for linking
 */
export function validateGoalLinking(goal: Goal): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check if linkedMetric is provided when autoUpdate is true
  if (goal.autoUpdate && !goal.linkedMetric) {
    errors.push('Linked metric is required for auto-updating goals');
  }

  // Check if linkedActionType matches the metric
  if (goal.linkedMetric && goal.linkedActionType) {
    const compatibleActions = getActionTypesForMetric(goal.linkedMetric);
    if (!compatibleActions.includes(goal.linkedActionType)) {
      errors.push(`Metric '${goal.linkedMetric}' is not compatible with action type '${goal.linkedActionType}'`);
    }
  }

  // Check if targetValue is reasonable for the metric
  if (goal.targetValue !== undefined && goal.targetValue <= 0) {
    errors.push('Target value must be positive');
  }

  // Validate specific metrics
  if (goal.linkedMetric) {
    const metricValidation = validateMetricSpecificRules(goal.linkedMetric, goal.targetValue);
    errors.push(...metricValidation);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate metric-specific rules
 */
function validateMetricSpecificRules(metric: string, targetValue?: number): string[] {
  const errors: string[] = [];

  switch (metric) {
    case 'practice_frequency':
      if (targetValue && targetValue > 7) {
        errors.push('Practice frequency cannot exceed 7 times per week');
      }
      break;
    
    case 'average_audience_size':
      if (targetValue && targetValue > 10000) {
        errors.push('Average audience size target seems unrealistic (>10,000)');
      }
      break;
    
    case 'practice_time_total':
      if (targetValue && targetValue > 100000) { // ~1667 hours
        errors.push('Total practice time target seems unrealistic (>1667 hours)');
      }
      break;
  }

  return errors;
}

/**
 * Calculate goal progress percentage
 */
export function calculateGoalProgressPercentage(goal: Goal): number {
  if (!goal.targetValue || goal.targetValue === 0) return 0;
  return Math.min((goal.currentValue / goal.targetValue) * 100, 100);
}

/**
 * Determine goal status based on progress
 */
export function determineGoalStatus(goal: Goal): 'active' | 'completed' | 'overdue' {
  if (goal.targetValue && goal.currentValue >= goal.targetValue) {
    return 'completed';
  }
  
  if (goal.deadline && new Date() > goal.deadline) {
    return 'overdue';
  }
  
  return 'active';
}

/**
 * Get goal priority based on deadline and progress
 */
export function calculateGoalPriority(goal: Goal): 'high' | 'medium' | 'low' {
  const progressPercentage = calculateGoalProgressPercentage(goal);
  const now = new Date();
  
  // High priority: close to deadline or very low progress
  if (goal.deadline) {
    const daysUntilDeadline = Math.ceil((goal.deadline.getTime() - now.getTime()) / (1000 * 3600 * 24));
    
    if (daysUntilDeadline <= 7 && progressPercentage < 80) {
      return 'high';
    }
    
    if (daysUntilDeadline <= 30 && progressPercentage < 50) {
      return 'high';
    }
  }
  
  // Medium priority: moderate progress or medium-term deadline
  if (progressPercentage >= 25 && progressPercentage < 75) {
    return 'medium';
  }
  
  if (goal.deadline) {
    const daysUntilDeadline = Math.ceil((goal.deadline.getTime() - now.getTime()) / (1000 * 3600 * 24));
    if (daysUntilDeadline <= 90) {
      return 'medium';
    }
  }
  
  // Low priority: high progress or long-term goals
  return 'low';
}

/**
 * Group goals by their linked action type
 */
export function groupGoalsByActionType(goals: Goal[]): Record<string, Goal[]> {
  return goals.reduce((groups, goal) => {
    const actionType = goal.linkedActionType || 'unlinked';
    if (!groups[actionType]) {
      groups[actionType] = [];
    }
    groups[actionType].push(goal);
    return groups;
  }, {} as Record<string, Goal[]>);
}

/**
 * Get suggested target value for a metric based on user's current activity level
 */
export function getSuggestedTargetValue(
  metric: string,
  currentValue: number,
  userActivityLevel: 'beginner' | 'intermediate' | 'advanced'
): number {
  const multipliers = {
    beginner: 1.5,
    intermediate: 2.0,
    advanced: 2.5
  };

  const baseTargets: Record<string, number> = {
    'show_count': 5,
    'performance_earnings': 500,
    'average_audience_size': 25,
    'practice_time_total': 1800, // 30 hours in minutes
    'practice_sessions_count': 12,
    'practice_frequency': 2,
    'recorded_songs_count': 3,
    'recording_sessions_count': 2,
    'recording_revenue': 200,
    'total_earnings': 1000,
    'net_income': 750
  };

  const baseTarget = baseTargets[metric] || 10;
  const multiplier = multipliers[userActivityLevel];
  
  // Use the higher of: base target * multiplier or current value * 1.25
  return Math.max(
    Math.round(baseTarget * multiplier),
    Math.round(currentValue * 1.25)
  );
}

/**
 * Check if an action should trigger goal updates
 */
export function shouldTriggerGoalUpdate(
  actionType: 'performance' | 'practice' | 'recording',
  actionData: PerformanceRecord | PracticeSession | RecordingSession,
  goals: Goal[]
): boolean {
  // Always trigger if there are linked goals for this action type
  const relevantGoals = getGoalsForAction(goals, actionType);
  if (relevantGoals.length === 0) return false;

  // Additional validation based on action type
  switch (actionType) {
    case 'performance':
      const performance = actionData as PerformanceRecord;
      return performance.payment >= 0 && performance.audienceSize >= 0;
    
    case 'practice':
      const practice = actionData as PracticeSession;
      return practice.duration > 0;
    
    case 'recording':
      const recording = actionData as RecordingSession;
      return recording.songs.length > 0;
    
    default:
      return true;
  }
}

/**
 * Get metric display information
 */
export function getMetricDisplayInfo(metric: string): {
  name: string;
  unit: string;
  description: string;
  category: 'performance' | 'practice' | 'recording' | 'financial';
} {
  const metricInfo: Record<string, any> = {
    'show_count': {
      name: 'Show Count',
      unit: 'shows',
      description: 'Total number of performances',
      category: 'performance'
    },
    'performance_earnings': {
      name: 'Performance Earnings',
      unit: '$',
      description: 'Total earnings from live performances',
      category: 'financial'
    },
    'average_audience_size': {
      name: 'Average Audience Size',
      unit: 'people',
      description: 'Average number of people in audience',
      category: 'performance'
    },
    'practice_time_total': {
      name: 'Total Practice Time',
      unit: 'minutes',
      description: 'Total time spent practicing',
      category: 'practice'
    },
    'practice_sessions_count': {
      name: 'Practice Sessions',
      unit: 'sessions',
      description: 'Number of practice sessions completed',
      category: 'practice'
    },
    'practice_frequency': {
      name: 'Practice Frequency',
      unit: 'times/week',
      description: 'Average practice sessions per week',
      category: 'practice'
    },
    'recorded_songs_count': {
      name: 'Recorded Songs',
      unit: 'songs',
      description: 'Total number of songs recorded',
      category: 'recording'
    },
    'recording_sessions_count': {
      name: 'Recording Sessions',
      unit: 'sessions',
      description: 'Number of recording sessions completed',
      category: 'recording'
    },
    'recording_revenue': {
      name: 'Recording Revenue',
      unit: '$',
      description: 'Total earnings from recorded music',
      category: 'financial'
    },
    'total_earnings': {
      name: 'Total Earnings',
      unit: '$',
      description: 'Total earnings from all sources',
      category: 'financial'
    },
    'net_income': {
      name: 'Net Income',
      unit: '$',
      description: 'Total earnings minus expenses',
      category: 'financial'
    }
  };

  return metricInfo[metric] || {
    name: metric,
    unit: '',
    description: 'Custom metric',
    category: 'performance'
  };
}

/**
 * Format metric value for display
 */
export function formatMetricValue(metric: string, value: number): string {
  const info = getMetricDisplayInfo(metric);
  
  switch (info.unit) {
    case '$':
      return `$${value.toFixed(2)}`;
    case 'minutes':
      const hours = Math.floor(value / 60);
      const minutes = value % 60;
      return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
    case 'times/week':
      return `${value.toFixed(1)}/week`;
    default:
      return value.toString();
  }
}