import { MusicianProfile, Recommendation } from './types';
import { RECOMMENDATION_CONFIG } from './constants';
import { analyticsService } from '../services/analyticsService';

interface Rule {
  id: string;
  title: string;
  description: string;
  category: Recommendation['category'];
  priority: Recommendation['priority'];
  condition: (profile: MusicianProfile) => boolean;
}

const rules: Rule[] = [
  // Marketing & Promotion Recommendations
  {
    id: 'MKT_01',
    title: 'Build Your Online Presence',
    description: `Start by creating accounts on Instagram and TikTok. Post one high-quality video of you playing each week. Use relevant hashtags like #livemusic and #{instrument}player to reach your target audience.`,
    category: 'marketing',
    priority: 'high',
    condition: (p) => (p.marketingEfforts.length === 0 || p.marketingEfforts.includes('none')) && getCrowdSizeNumber(p.crowdSize) < 50,
  },
  {
    id: 'MKT_02',
    title: 'Amplify Your Existing Audience',
    description: 'You already have a solid fanbase! Create social media accounts to connect with your audience between shows. Share behind-the-scenes content, upcoming gigs, and engage with your fans regularly.',
    category: 'marketing',
    priority: 'high',
    condition: (p) => !p.marketingEfforts.includes('social') && getCrowdSizeNumber(p.crowdSize) >= 50,
  },
  {
    id: 'MKT_03',
    title: 'Start an Email List',
    description: 'Collect email addresses at your gigs and online. Send monthly updates about new songs, upcoming shows, and exclusive content. Email marketing has the highest ROI of all digital marketing channels.',
    category: 'marketing',
    priority: 'medium',
    condition: (p) => !p.marketingEfforts.includes('mailing') && getCrowdSizeNumber(p.crowdSize) >= 10,
  },
  // Performance & Gigging Recommendations
  {
    id: 'PERF_01',
    title: 'Get On Stage!',
    description: "You have the skills - now it's time to perform! Start with open mic nights at local venues. They're low-pressure environments perfect for building stage confidence and meeting other musicians.",
    category: 'performance',
    priority: 'high',
    condition: (p) => p.performanceFrequency === 'never' && p.yearsOfExperience >= 1,
  },
  {
    id: 'PERF_02',
    title: 'Increase Your Performance Frequency',
    description: 'Try to book more regular gigs. Aim for at least one performance per month. Consistency helps build your reputation and grow your audience. Contact local venues, coffee shops, and restaurants.',
    category: 'performance',
    priority: 'medium',
    condition: (p) => ['monthly', 'yearly'].includes(p.performanceFrequency) && getCrowdSizeNumber(p.crowdSize) < 50,
  },
  {
    id: 'PERF_03',
    title: 'Target Larger Venues',
    description: "You're performing regularly - great! Now focus on venues that can accommodate larger audiences. Research venues in nearby cities and submit professional press kits with your best recordings.",
    category: 'performance',
    priority: 'medium',
    condition: (p) => ['weekly', 'multiple'].includes(p.performanceFrequency) && getCrowdSizeNumber(p.crowdSize) < 100,
  },
  // Networking & Collaboration Recommendations
  {
    id: 'NET_01',
    title: 'Connect with Fellow Musicians',
    description: 'Attend local jam sessions and music events. Collaborating with other musicians can expose you to new audiences and opportunities. Consider forming a band or booking joint shows.',
    category: 'networking',
    priority: 'medium',
    condition: (p) => !p.marketingEfforts.includes('networking') && p.yearsOfExperience >= 2,
  },
  {
    id: 'NET_02',
    title: 'Cross-Promote with Local Artists',
    description: "Partner with other local musicians for show swaps and social media cross-promotion. Share each other's content and attend each other's shows to combine your audiences.",
    category: 'networking',
    priority: 'high',
    condition: (p) => getCrowdSizeNumber(p.crowdSize) < 50 && ['weekly', 'multiple'].includes(p.performanceFrequency),
  },
  // Skill Development Recommendations
  {
    id: 'SKILL_01',
    title: 'Focus on Daily Practice',
    description: 'Dedicate at least 30 minutes daily to focused practice. Work on technique, learn new songs, and gradually challenge yourself with more complex pieces. Consistency beats intensity.',
    category: 'skill',
    priority: 'high',
    condition: (p) => p.yearsOfExperience < 2,
  },
  {
    id: 'SKILL_02',
    title: 'Develop Your Unique Sound',
    description: "You have the basics down - now work on developing your signature style. Experiment with different genres, write original material, and find what makes you stand out from other musicians.",
    category: 'skill',
    priority: 'medium',
    condition: (p) => p.yearsOfExperience >= 2 && p.yearsOfExperience < 5,
  },
  {
    id: 'SKILL_03',
    title: 'Share Your Expertise',
    description: 'With your experience, consider teaching lessons or creating educational content. This provides additional income and establishes you as an authority in your field.',
    category: 'skill',
    priority: 'low',
    condition: (p) => p.yearsOfExperience >= 5 && p.performanceFrequency !== 'multiple',
  },
  // Advanced recommendations for experienced musicians
  {
    id: 'ADV_01',
    title: 'Consider Professional Recording',
    description: 'You have a solid fanbase and experience. Invest in professional recording to create high-quality demos or an EP. This opens doors to radio play, streaming playlists, and industry contacts.',
    category: 'skill',
    priority: 'medium',
    condition: (p) => p.yearsOfExperience >= 5 && getCrowdSizeNumber(p.crowdSize) >= 100,
  },
];

export function generateRecommendations(profile: MusicianProfile): Recommendation[] {
  // Generate basic recommendations
  const basicRecommendations = generateBasicRecommendations(profile);
  
  // Generate enhanced recommendations based on historical data
  const enhancedRecommendations = generateEnhancedRecommendations(profile);
  
  // Combine and prioritize recommendations
  const allRecommendations = [...basicRecommendations, ...enhancedRecommendations];
  
  // Remove duplicates and sort by priority
  const uniqueRecommendations = removeDuplicateRecommendations(allRecommendations);
  
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  uniqueRecommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  
  return uniqueRecommendations.slice(0, RECOMMENDATION_CONFIG.MAX_RECOMMENDATIONS);
}

function generateBasicRecommendations(profile: MusicianProfile): Recommendation[] {
  const matchedRecommendations = rules
    .filter(rule => rule.condition(profile))
    .map(rule => ({
      id: rule.id,
      title: rule.title,
      description: rule.description.replace('{instrument}', profile.instrument.toLowerCase()),
      category: rule.category,
      priority: rule.priority,
    }));

  // Ensure we have at least minimum recommendations
  if (matchedRecommendations.length < RECOMMENDATION_CONFIG.MIN_RECOMMENDATIONS) {
    matchedRecommendations.push({
      id: 'GEN_01',
      title: 'Document Your Journey',
      description: 'Create content about your musical journey. Share practice videos, cover songs, and document your progress. This builds your personal brand and connects you with other musicians.',
      category: 'marketing',
      priority: 'medium',
    });
  }

  return matchedRecommendations;
}

function generateEnhancedRecommendations(profile: MusicianProfile): Recommendation[] {
  const recommendations: Recommendation[] = [];
  
  // Performance-based recommendations
  if (profile.shows && profile.shows.length > 0) {
    recommendations.push(...generatePerformanceRecommendations(profile));
  }
  
  // Practice-based recommendations
  if (profile.practiceLog && profile.practiceLog.length > 0) {
    recommendations.push(...generatePracticeRecommendations(profile));
  }
  
  // Goal-based recommendations
  if (profile.goals && profile.goals.length > 0) {
    recommendations.push(...generateGoalRecommendations(profile));
  }
  
  return recommendations;
}

function generatePerformanceRecommendations(profile: MusicianProfile): Recommendation[] {
  const recommendations: Recommendation[] = [];
  const performanceTrends = analyticsService.analyzePerformanceTrends(profile.shows);
  
  // Audience growth recommendations
  if (performanceTrends.showFrequency === 'decreasing') {
    recommendations.push({
      id: 'PERF_TREND_01',
      title: 'Reverse Your Performance Decline',
      description: 'Your performance frequency has been decreasing. Consider booking more regular gigs to maintain momentum. Set a goal to perform at least once per month.',
      category: 'performance',
      priority: 'high'
    });
  }
  
  if (performanceTrends.showFrequency === 'increasing') {
    recommendations.push({
      id: 'PERF_TREND_02',
      title: 'Capitalize on Your Momentum',
      description: 'Great job increasing your performance frequency! Consider reaching out to larger venues or festivals to expand your audience reach.',
      category: 'performance',
      priority: 'medium'
    });
  }
  
  // Venue progression recommendations
  if (performanceTrends.venueProgression === 'declining') {
    recommendations.push({
      id: 'VENUE_01',
      title: 'Aim for Better Venues',
      description: 'Focus on booking higher-quality venues. Research concert halls, music festivals, and established music venues in your area.',
      category: 'performance',
      priority: 'medium'
    });
  }
  
  // Earnings optimization
  if (performanceTrends.totalEarnings > 0 && performanceTrends.averageAudienceSize > 50) {
    const avgPayment = performanceTrends.totalEarnings / profile.shows.length;
    if (avgPayment < 200) {
      recommendations.push({
        id: 'EARN_01',
        title: 'Increase Your Performance Rates',
        description: 'With your growing audience, consider raising your performance fees. Research standard rates for your area and experience level.',
        category: 'performance',
        priority: 'medium'
      });
    }
  }
  
  return recommendations;
}

function generatePracticeRecommendations(profile: MusicianProfile): Recommendation[] {
  const recommendations: Recommendation[] = [];
  const practiceAnalysis = analyticsService.analyzePracticeHabits(profile.practiceLog);
  
  // Practice frequency recommendations
  if (practiceAnalysis.recommendedAdjustment === 'increase') {
    recommendations.push({
      id: 'PRACTICE_01',
      title: 'Increase Your Practice Time',
      description: `Your current practice schedule averages ${Math.round(practiceAnalysis.weeklyAverage)} minutes per week. Consider increasing to 5-7 hours weekly for optimal skill development.`,
      category: 'skill',
      priority: 'high'
    });
  }
  
  if (practiceAnalysis.recommendedAdjustment === 'decrease') {
    recommendations.push({
      id: 'PRACTICE_02',
      title: 'Balance Practice and Performance',
      description: 'While your dedication to practice is admirable, consider balancing practice time with performance opportunities to apply your skills.',
      category: 'skill',
      priority: 'medium'
    });
  }
  
  // Consistency recommendations
  if (practiceAnalysis.consistency === 'needs_improvement') {
    recommendations.push({
      id: 'PRACTICE_03',
      title: 'Improve Practice Consistency',
      description: 'Regular practice is more effective than sporadic long sessions. Try to practice for shorter periods more frequently.',
      category: 'skill',
      priority: 'high'
    });
  }
  
  // Professional lesson recommendations
  if (practiceAnalysis.suggestProfessionalLessons) {
    recommendations.push({
      id: 'PRACTICE_04',
      title: 'Consider Professional Lessons',
      description: 'Based on your practice patterns, professional lessons could help you focus your efforts and accelerate your progress.',
      category: 'skill',
      priority: 'medium'
    });
  }
  
  return recommendations;
}

function generateGoalRecommendations(profile: MusicianProfile): Recommendation[] {
  const recommendations: Recommendation[] = [];
  const activeGoals = profile.goals.filter(goal => goal.status === 'active');
  const completedGoals = profile.goals.filter(goal => goal.status === 'completed');
  
  // Goal completion motivation
  if (activeGoals.length > 0) {
    const overdueGoals = activeGoals.filter(goal => 
      goal.deadline && new Date(goal.deadline) < new Date()
    );
    
    if (overdueGoals.length > 0) {
      recommendations.push({
        id: 'GOAL_01',
        title: 'Review Overdue Goals',
        description: `You have ${overdueGoals.length} overdue goal(s). Consider adjusting deadlines or breaking them into smaller, manageable tasks.`,
        category: 'skill',
        priority: 'high'
      });
    }
  }
  
  // Goal achievement celebration and next steps
  if (completedGoals.length > 0) {
    const recentCompletions = completedGoals.filter(goal => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return new Date(goal.createdAt) > thirtyDaysAgo;
    });
    
    if (recentCompletions.length > 0) {
      recommendations.push({
        id: 'GOAL_02',
        title: 'Set New Challenges',
        description: `Congratulations on completing ${recentCompletions.length} goal(s) recently! Consider setting new, more ambitious goals to continue your growth.`,
        category: 'skill',
        priority: 'medium'
      });
    }
  }
  
  // Goal diversity recommendations
  const goalTypes = new Set(profile.goals.map(goal => goal.type));
  if (goalTypes.size < 3 && profile.shows.length > 5) {
    recommendations.push({
      id: 'GOAL_03',
      title: 'Diversify Your Goals',
      description: 'Consider setting goals in different areas: performance, financial, recording, and skill development to ensure well-rounded growth.',
      category: 'skill',
      priority: 'low'
    });
  }
  
  return recommendations;
}

function removeDuplicateRecommendations(recommendations: Recommendation[]): Recommendation[] {
  const seen = new Set<string>();
  return recommendations.filter(rec => {
    if (seen.has(rec.id)) {
      return false;
    }
    seen.add(rec.id);
    return true;
  });
}

function getCrowdSizeNumber(crowdSize: string): number {
  switch (crowdSize) {
    case '1-10': return 5;
    case '10-50': return 30;
    case '50-100': return 75;
    case '100-500': return 300;
    case '500+': return 500;
    default: return 0;
  }
}
