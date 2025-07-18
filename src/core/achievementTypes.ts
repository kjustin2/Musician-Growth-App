export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'performance' | 'practice' | 'goal' | 'milestone' | 'recording';
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
  },
  
  // Recording Achievements
  {
    id: 'first_recording',
    title: 'Studio Debut',
    description: 'Complete your first recording session',
    category: 'recording',
    type: 'bronze',
    icon: '🎙️',
    requirement: 1,
    isUnlocked: false
  },
  {
    id: 'five_songs',
    title: 'Songwriter',
    description: 'Record 5 songs',
    category: 'recording',
    type: 'silver',
    icon: '🎶',
    requirement: 5,
    isUnlocked: false
  },
  {
    id: 'album_ready',
    title: 'Album Ready',
    description: 'Record 10 songs',
    category: 'recording',
    type: 'gold',
    icon: '💿',
    requirement: 10,
    isUnlocked: false
  },
  {
    id: 'prolific_artist',
    title: 'Prolific Artist',
    description: 'Record 25 songs',
    category: 'recording',
    type: 'platinum',
    icon: '🎵',
    requirement: 25,
    isUnlocked: false
  },
  {
    id: 'viral_hit',
    title: 'Viral Hit',
    description: 'Get 1,000 plays on a single song',
    category: 'recording',
    type: 'gold',
    icon: '🚀',
    requirement: 1000,
    isUnlocked: false
  },
  {
    id: 'streaming_success',
    title: 'Streaming Success',
    description: 'Reach 10,000 total plays across all songs',
    category: 'recording',
    type: 'platinum',
    icon: '📈',
    requirement: 10000,
    isUnlocked: false
  },
  
  // Long-term Performance Milestones
  {
    id: 'two_hundred_shows',
    title: 'Touring Veteran',
    description: 'Complete 200 performances',
    category: 'performance',
    type: 'platinum',
    icon: '🚌',
    requirement: 200,
    isUnlocked: false
  },
  {
    id: 'five_hundred_shows',
    title: 'Performance Master',
    description: 'Complete 500 performances',
    category: 'performance',
    type: 'platinum',
    icon: '🎪',
    requirement: 500,
    isUnlocked: false
  },
  {
    id: 'venue_explorer',
    title: 'Venue Explorer',
    description: 'Perform at 5 different venue types',
    category: 'performance',
    type: 'gold',
    icon: '🗺️',
    requirement: 5,
    isUnlocked: false
  },
  {
    id: 'festival_performer',
    title: 'Festival Performer',
    description: 'Perform at 3 festivals',
    category: 'performance',
    type: 'gold',
    icon: '🎪',
    requirement: 3,
    isUnlocked: false
  },
  
  // Financial Achievement Milestones
  {
    id: 'first_thousand',
    title: 'First Grand',
    description: 'Earn $1,000 from performances',
    category: 'milestone',
    type: 'silver',
    icon: '💰',
    requirement: 1000,
    isUnlocked: false
  },
  {
    id: 'five_thousand',
    title: 'Serious Income',
    description: 'Earn $5,000 from performances',
    category: 'milestone',
    type: 'gold',
    icon: '💎',
    requirement: 5000,
    isUnlocked: false
  },
  {
    id: 'ten_thousand',
    title: 'Professional Earnings',
    description: 'Earn $10,000 from performances',
    category: 'milestone',
    type: 'platinum',
    icon: '🏆',
    requirement: 10000,
    isUnlocked: false
  },
  {
    id: 'recording_revenue',
    title: 'Recording Revenue',
    description: 'Earn $500 from recorded music',
    category: 'recording',
    type: 'gold',
    icon: '💵',
    requirement: 500,
    isUnlocked: false
  },
  {
    id: 'diversified_income',
    title: 'Diversified Income',
    description: 'Earn money from both performances and recordings',
    category: 'milestone',
    type: 'gold',
    icon: '📊',
    requirement: 1,
    isUnlocked: false
  },
  
  // Combination Achievements
  {
    id: 'triple_threat',
    title: 'Triple Threat',
    description: 'Complete 10 shows, 50 hours of practice, and record 3 songs',
    category: 'milestone',
    type: 'gold',
    icon: '⭐',
    requirement: 1,
    isUnlocked: false
  },
  {
    id: 'well_rounded',
    title: 'Well Rounded',
    description: 'Complete goals in 3 different categories',
    category: 'goal',
    type: 'gold',
    icon: '🎯',
    requirement: 3,
    isUnlocked: false
  },
  {
    id: 'consistency_king',
    title: 'Consistency King',
    description: 'Practice for 30 consecutive days',
    category: 'practice',
    type: 'platinum',
    icon: '👑',
    requirement: 30,
    isUnlocked: false
  },
  {
    id: 'year_of_music',
    title: 'Year of Music',
    description: 'Log activity every month for 12 months',
    category: 'milestone',
    type: 'platinum',
    icon: '📅',
    requirement: 12,
    isUnlocked: false
  },
  {
    id: 'crowd_grower',
    title: 'Crowd Grower',
    description: 'Perform for audiences of 500+ people',
    category: 'performance',
    type: 'platinum',
    icon: '🌟',
    requirement: 500,
    isUnlocked: false
  }
];