export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'performance' | 'practice' | 'goal' | 'milestone';
  type: 'bronze' | 'silver' | 'gold' | 'platinum';
  icon: string;
  unlockedAt?: Date;
  progress?: number;
  requirement: number;
  isUnlocked: boolean;
}

export interface AchievementProgress {
  achievementId: string;
  currentValue: number;
  targetValue: number;
  isUnlocked: boolean;
}

export interface Notification {
  id: string;
  type: 'achievement' | 'goal_completed' | 'milestone' | 'reminder';
  title: string;
  message: string;
  achievementId?: string;
  createdAt: Date;
  isRead: boolean;
  icon?: string;
}

export const ACHIEVEMENTS: Achievement[] = [
  // Performance Achievements
  {
    id: 'first_show',
    title: 'Stage Debut',
    description: 'Perform your first show',
    category: 'performance',
    type: 'bronze',
    icon: '🎤',
    requirement: 1,
    isUnlocked: false
  },
  {
    id: 'ten_shows',
    title: 'Regular Performer',
    description: 'Complete 10 performances',
    category: 'performance',
    type: 'silver',
    icon: '🎭',
    requirement: 10,
    isUnlocked: false
  },
  {
    id: 'fifty_shows',
    title: 'Seasoned Pro',
    description: 'Complete 50 performances',
    category: 'performance',
    type: 'gold',
    icon: '🌟',
    requirement: 50,
    isUnlocked: false
  },
  {
    id: 'hundred_shows',
    title: 'Performance Legend',
    description: 'Complete 100 performances',
    category: 'performance',
    type: 'platinum',
    icon: '👑',
    requirement: 100,
    isUnlocked: false
  },
  
  // Practice Achievements
  {
    id: 'first_practice',
    title: 'Practice Makes Perfect',
    description: 'Log your first practice session',
    category: 'practice',
    type: 'bronze',
    icon: '🎵',
    requirement: 1,
    isUnlocked: false
  },
  {
    id: 'ten_hours',
    title: 'Dedicated Student',
    description: 'Practice for 10 hours total',
    category: 'practice',
    type: 'bronze',
    icon: '📚',
    requirement: 600, // 10 hours in minutes
    isUnlocked: false
  },
  {
    id: 'hundred_hours',
    title: 'Serious Musician',
    description: 'Practice for 100 hours total',
    category: 'practice',
    type: 'silver',
    icon: '🎯',
    requirement: 6000, // 100 hours in minutes
    isUnlocked: false
  },
  {
    id: 'thousand_hours',
    title: 'Master Craftsman',
    description: 'Practice for 1,000 hours total',
    category: 'practice',
    type: 'gold',
    icon: '🏆',
    requirement: 60000, // 1000 hours in minutes
    isUnlocked: false
  },
  
  // Goal Achievements
  {
    id: 'first_goal',
    title: 'Goal Setter',
    description: 'Create your first goal',
    category: 'goal',
    type: 'bronze',
    icon: '🎯',
    requirement: 1,
    isUnlocked: false
  },
  {
    id: 'goal_achiever',
    title: 'Goal Achiever',
    description: 'Complete your first goal',
    category: 'goal',
    type: 'silver',
    icon: '✅',
    requirement: 1,
    isUnlocked: false
  },
  {
    id: 'goal_crusher',
    title: 'Goal Crusher',
    description: 'Complete 5 goals',
    category: 'goal',
    type: 'gold',
    icon: '💪',
    requirement: 5,
    isUnlocked: false
  },
  
  // Milestone Achievements
  {
    id: 'earning_milestone',
    title: 'First Earnings',
    description: 'Earn your first $100 from performances',
    category: 'milestone',
    type: 'bronze',
    icon: '💵',
    requirement: 100,
    isUnlocked: false
  },
  {
    id: 'big_crowd',
    title: 'Crowd Pleaser',
    description: 'Perform for an audience of 100+ people',
    category: 'milestone',
    type: 'silver',
    icon: '👥',
    requirement: 100,
    isUnlocked: false
  },
  {
    id: 'consistent_practice',
    title: 'Daily Devotion',
    description: 'Practice for 7 consecutive days',
    category: 'practice',
    type: 'silver',
    icon: '🔥',
    requirement: 7,
    isUnlocked: false
  }
];