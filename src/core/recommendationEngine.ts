import { MusicianProfile, Recommendation } from './types';
import { RECOMMENDATION_CONFIG } from './constants';
import { analyticsService } from '../services/analyticsService';
// import { bandMemberService } from '../services/bandMemberService';
// import { setListService } from '../services/setListService';

// Industry knowledge data
const INDUSTRY_BENCHMARKS = {
  // Average performance fees by venue type and experience level
  performanceFees: {
    'bar': { beginner: 75, intermediate: 150, advanced: 300, professional: 500 },
    'restaurant': { beginner: 100, intermediate: 200, advanced: 400, professional: 600 },
    'concert_hall': { beginner: 250, intermediate: 500, advanced: 1000, professional: 2000 },
    'festival': { beginner: 300, intermediate: 750, advanced: 1500, professional: 3000 },
    'private_event': { beginner: 150, intermediate: 300, advanced: 600, professional: 1200 },
    'other': { beginner: 100, intermediate: 200, advanced: 400, professional: 600 }
  },
  
  // Typical audience sizes by venue type
  audienceSizes: {
    'bar': { min: 10, max: 100, optimal: 50 },
    'restaurant': { min: 20, max: 80, optimal: 40 },
    'concert_hall': { min: 50, max: 2000, optimal: 300 },
    'festival': { min: 100, max: 10000, optimal: 1000 },
    'private_event': { min: 20, max: 300, optimal: 75 },
    'other': { min: 15, max: 200, optimal: 60 }
  },
  
  // Genre-specific insights
  genreInsights: {
    'rock': { 
      optimalBandSize: 4, 
      keyInstruments: ['guitar', 'bass', 'drums', 'vocals'],
      typicalVenues: ['bar', 'concert_hall', 'festival'],
      seasonalPeak: 'summer'
    },
    'jazz': { 
      optimalBandSize: 5, 
      keyInstruments: ['piano', 'bass', 'drums', 'saxophone', 'trumpet'],
      typicalVenues: ['restaurant', 'concert_hall', 'bar'],
      seasonalPeak: 'winter'
    },
    'folk': { 
      optimalBandSize: 2, 
      keyInstruments: ['guitar', 'vocals'],
      typicalVenues: ['restaurant', 'private_event', 'other'],
      seasonalPeak: 'fall'
    },
    'pop': { 
      optimalBandSize: 4, 
      keyInstruments: ['vocals', 'guitar', 'bass', 'drums'],
      typicalVenues: ['bar', 'concert_hall', 'festival'],
      seasonalPeak: 'summer'
    },
    'country': { 
      optimalBandSize: 4, 
      keyInstruments: ['guitar', 'bass', 'drums', 'vocals'],
      typicalVenues: ['bar', 'festival', 'private_event'],
      seasonalPeak: 'summer'
    },
    'classical': { 
      optimalBandSize: 12, 
      keyInstruments: ['violin', 'cello', 'piano', 'flute'],
      typicalVenues: ['concert_hall', 'private_event'],
      seasonalPeak: 'winter'
    }
  },
  
  // Practice time recommendations by skill level
  practiceTime: {
    beginner: { daily: 30, weekly: 210 }, // 30 min daily, 3.5 hours weekly
    intermediate: { daily: 45, weekly: 315 }, // 45 min daily, 5.25 hours weekly
    advanced: { daily: 60, weekly: 420 }, // 1 hour daily, 7 hours weekly
    professional: { daily: 90, weekly: 630 } // 1.5 hours daily, 10.5 hours weekly
  },
  
  // Typical show frequency by experience level
  showFrequency: {
    beginner: { monthly: 1, yearly: 12 },
    intermediate: { monthly: 2, yearly: 24 },
    advanced: { monthly: 4, yearly: 48 },
    professional: { monthly: 8, yearly: 96 }
  }
};

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
  // Create recommendation context for personalization
  const context = createRecommendationContext(profile);
  
  // Generate basic recommendations
  const basicRecommendations = generateBasicRecommendations(profile);
  
  // Generate enhanced recommendations based on historical data
  const enhancedRecommendations = generateEnhancedRecommendations(profile);
  
  // Combine all recommendations
  const allRecommendations = [...basicRecommendations, ...enhancedRecommendations];
  
  // Remove duplicates
  const uniqueRecommendations = removeDuplicateRecommendations(allRecommendations);
  
  // Apply personalization and weighting
  const personalizedRecommendations = applyPersonalizationWeighting(uniqueRecommendations, context);
  
  // Sort by weighted priority score
  personalizedRecommendations.sort((a, b) => (b as any).weightedScore - (a as any).weightedScore);
  
  return personalizedRecommendations.slice(0, RECOMMENDATION_CONFIG.MAX_RECOMMENDATIONS);
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
  
  // Recording-based recommendations
  if (profile.recordings && profile.recordings.length > 0) {
    recommendations.push(...generateRecordingRecommendations(profile));
  }
  
  // Band-specific recommendations
  recommendations.push(...generateBandRecommendations(profile));
  
  // Set list recommendations
  recommendations.push(...generateSetListRecommendations(profile));
  
  // Industry benchmark recommendations
  recommendations.push(...generateIndustryBenchmarkRecommendations(profile));
  
  // Advanced category recommendations
  recommendations.push(...generateAdvancedRecommendations(profile));
  
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

function generateRecordingRecommendations(profile: MusicianProfile): Recommendation[] {
  const recommendations: Recommendation[] = [];
  
  if (!profile.recordings || profile.recordings.length === 0) {
    return recommendations;
  }
  
  // Calculate recording metrics
  const totalSongs = profile.recordings.reduce((sum, session) => sum + session.songs.length, 0);
  const totalCost = profile.recordings.reduce((sum, session) => sum + session.cost, 0);
  const totalRevenue = profile.recordings.reduce((sum, session) => sum + session.totalRevenue, 0);
  const totalPlays = profile.recordings.reduce((sum, session) => sum + session.totalPlays, 0);
  const avgPlaysPerSong = totalSongs > 0 ? totalPlays / totalSongs : 0;
  const avgRevenuePerSong = totalSongs > 0 ? totalRevenue / totalSongs : 0;
  const costEfficiency = totalRevenue / totalCost;
  
  // Recent recording activity (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const recentRecordings = profile.recordings.filter(session => 
    new Date(session.date) > sixMonthsAgo
  );
  
  // Low recording frequency recommendations
  if (recentRecordings.length === 0 && profile.recordings.length > 0) {
    recommendations.push({
      id: 'REC_01',
      title: 'Resume Your Recording Activity',
      description: 'You haven\'t recorded any new material in the past 6 months. Consider scheduling regular recording sessions to maintain creative momentum and build your catalog.',
      category: 'skill',
      priority: 'high'
    });
  }
  
  // High recording costs vs revenue recommendations
  if (totalCost > 1000 && costEfficiency < 0.3) {
    recommendations.push({
      id: 'REC_02',
      title: 'Optimize Your Recording Budget',
      description: `You've invested $${totalCost.toFixed(0)} in recordings but earned only $${totalRevenue.toFixed(0)} back. Consider home recording setups, collaboration with other artists to split costs, or focus on promotion to increase revenue.`,
      category: 'marketing',
      priority: 'high'
    });
  }
  
  // Low plays per song recommendations
  if (avgPlaysPerSong < 100 && totalSongs >= 3) {
    recommendations.push({
      id: 'REC_03',
      title: 'Boost Your Song Promotion',
      description: `Your songs average ${Math.round(avgPlaysPerSong)} plays each. Focus on digital marketing, playlist submissions, and social media promotion to increase visibility. Consider creating music videos or behind-the-scenes content.`,
      category: 'marketing',
      priority: 'high'
    });
  }
  
  // Recording quality vs quantity recommendations
  if (totalSongs > 10 && avgPlaysPerSong < 50) {
    recommendations.push({
      id: 'REC_04',
      title: 'Focus on Quality Over Quantity',
      description: 'You have many recordings but low engagement per song. Consider focusing on fewer, higher-quality releases with better production values and more targeted promotion.',
      category: 'skill',
      priority: 'medium'
    });
  }
  
  // Distribution and promotion recommendations
  if (avgRevenuePerSong < 10 && totalSongs >= 5) {
    recommendations.push({
      id: 'REC_05',
      title: 'Expand Your Distribution Strategy',
      description: 'Your songs are generating low revenue. Explore additional streaming platforms, consider sync licensing opportunities, and investigate direct-to-fan sales through platforms like Bandcamp.',
      category: 'marketing',
      priority: 'medium'
    });
  }
  
  // Venue diversity based on recording activity
  const venueTypes = new Set(profile.shows?.map(show => show.venueType) || []);
  if (totalSongs >= 5 && venueTypes.size < 3) {
    recommendations.push({
      id: 'REC_06',
      title: 'Diversify Your Performance Venues',
      description: 'With your growing catalog of recorded material, explore different venue types like festivals, house concerts, and music venues that appreciate original music.',
      category: 'performance',
      priority: 'medium'
    });
  }
  
  // Practice-to-performance ratio analysis
  const practiceHours = profile.practiceLog?.reduce((sum, session) => sum + session.duration, 0) || 0;
  const performanceHours = profile.shows?.reduce((sum, show) => sum + show.duration, 0) || 0;
  
  if (practiceHours > 0 && performanceHours > 0) {
    const practiceToPerformanceRatio = practiceHours / performanceHours;
    
    if (practiceToPerformanceRatio > 20 && totalSongs >= 3) {
      recommendations.push({
        id: 'REC_07',
        title: 'Balance Studio Time with Live Performance',
        description: 'You spend significantly more time practicing than performing. With your recorded material, consider booking more live shows to test your songs with audiences and build a fanbase.',
        category: 'performance',
        priority: 'medium'
      });
    }
    
    if (practiceToPerformanceRatio < 3 && recentRecordings.length > 0) {
      recommendations.push({
        id: 'REC_08',
        title: 'Increase Practice Time for Recording Quality',
        description: 'Your performance-to-practice ratio suggests you might benefit from more focused practice time to improve the quality of your recordings.',
        category: 'skill',
        priority: 'medium'
      });
    }
  }
  
  return recommendations;
}

function generateBandRecommendations(profile: MusicianProfile): Recommendation[] {
  const recommendations: Recommendation[] = [];
  
  // Check if user has band members
  const bandMembers = profile.bandMembers || [];
  const currentGenres = profile.genres || [];
  
  // No band members - recommend finding band members
  if (bandMembers.length === 0) {
    const primaryGenre = currentGenres[0]?.toLowerCase();
    const genreInfo = INDUSTRY_BENCHMARKS.genreInsights[primaryGenre as keyof typeof INDUSTRY_BENCHMARKS.genreInsights];
    
    if (genreInfo && genreInfo.optimalBandSize > 1) {
      recommendations.push({
        id: 'BAND_FORMATION_01',
        title: 'Form a Band for Better Opportunities',
        description: `${primaryGenre} music typically works best with ${genreInfo.optimalBandSize} members. Consider recruiting ${genreInfo.keyInstruments.join(', ')} players. Bands typically earn 30-50% more per show and have access to better venues.`,
        category: 'networking',
        priority: 'high'
      });
    }
  }
  
  // Too few band members for genre
  if (bandMembers.length > 0 && bandMembers.length < 3) {
    const primaryGenre = currentGenres[0]?.toLowerCase();
    const genreInfo = INDUSTRY_BENCHMARKS.genreInsights[primaryGenre as keyof typeof INDUSTRY_BENCHMARKS.genreInsights];
    
    if (genreInfo && bandMembers.length < genreInfo.optimalBandSize) {
      const missingInstruments = genreInfo.keyInstruments.filter(instrument => 
        !bandMembers.some(member => member.instrument.toLowerCase().includes(instrument))
      );
      
      if (missingInstruments.length > 0) {
        recommendations.push({
          id: 'BAND_EXPAND_01',
          title: `Complete Your ${primaryGenre} Band Setup`,
          description: `Your ${primaryGenre} band could benefit from adding ${missingInstruments.slice(0, 2).join(' and ')} players. This would give you access to more complex arrangements and better venue opportunities.`,
          category: 'networking',
          priority: 'medium'
        });
      }
    }
  }
  
  // Band member experience balance
  if (bandMembers.length >= 2) {
    const avgExperience = bandMembers.reduce((sum, member) => sum + member.yearsExperience, 0) / bandMembers.length;
    const experienceGap = Math.max(...bandMembers.map(m => m.yearsExperience)) - Math.min(...bandMembers.map(m => m.yearsExperience));
    
    if (experienceGap > 3) {
      recommendations.push({
        id: 'BAND_BALANCE_01',
        title: 'Balance Band Member Experience Levels',
        description: `Your band has a ${experienceGap}-year experience gap between members. Consider organizing group practice sessions and encouraging less experienced members to practice with more skilled players.`,
        category: 'skill',
        priority: 'medium'
      });
    }
  }
  
  // Band performance activity
  const bandPerformances = profile.shows?.filter(show => 
    show.bandMembersPresent && show.bandMembersPresent.length > 0
  ) || [];
  
  if (bandMembers.length >= 2 && bandPerformances.length === 0) {
    recommendations.push({
      id: 'BAND_PERFORM_01',
      title: 'Start Performing with Your Band',
      description: 'You have band members but haven\'t performed together yet. Start with smaller venues to build chemistry, then work toward larger opportunities. Band performances typically pay 2-3x more than solo shows.',
      category: 'performance',
      priority: 'high'
    });
  }
  
  // Band member participation tracking
  if (bandMembers.length >= 2 && bandPerformances.length >= 3) {
    const memberParticipation = bandMembers.map(member => ({
      member,
      showCount: bandPerformances.filter(show => 
        show.bandMembersPresent?.includes(member.id)
      ).length
    }));
    
    const avgParticipation = memberParticipation.reduce((sum, mp) => sum + mp.showCount, 0) / memberParticipation.length;
    const lowParticipationMembers = memberParticipation.filter(mp => mp.showCount < avgParticipation * 0.6);
    
    if (lowParticipationMembers.length > 0) {
      recommendations.push({
        id: 'BAND_PARTICIPATION_01',
        title: 'Improve Band Member Consistency',
        description: `${lowParticipationMembers.length} band member(s) have low show participation. Consider addressing scheduling conflicts or finding more reliable members for consistent performance quality.`,
        category: 'networking',
        priority: 'medium'
      });
    }
  }
  
  return recommendations;
}

function generateSetListRecommendations(profile: MusicianProfile): Recommendation[] {
  const recommendations: Recommendation[] = [];
  
  const setLists = profile.setLists || [];
  const shows = profile.shows || [];
  
  // No set lists created
  if (setLists.length === 0 && shows.length > 2) {
    recommendations.push({
      id: 'SETLIST_CREATE_01',
      title: 'Create Structured Set Lists',
      description: 'Organize your songs into structured set lists for different venue types and audience sizes. This will help you prepare faster and deliver more consistent performances.',
      category: 'skill',
      priority: 'high'
    });
  }
  
  // Limited set list variety
  if (setLists.length > 0 && setLists.length < 3 && shows.length > 5) {
    recommendations.push({
      id: 'SETLIST_VARIETY_01',
      title: 'Diversify Your Set Lists',
      description: 'Create multiple set lists for different occasions: acoustic/intimate, high-energy/dance, and venue-specific sets. This flexibility will help you book more diverse gigs.',
      category: 'skill',
      priority: 'medium'
    });
  }
  
  // Set list usage analysis
  if (setLists.length >= 2) {
    const setListUsage = setLists.map(setList => ({
      setList,
      usageCount: shows.filter(show => show.setListUsed === setList.id).length
    }));
    
    const unusedSetLists = setListUsage.filter(usage => usage.usageCount === 0);
    if (unusedSetLists.length > 0) {
      recommendations.push({
        id: 'SETLIST_USAGE_01',
        title: 'Utilize Your Created Set Lists',
        description: `You have ${unusedSetLists.length} unused set list(s). Try incorporating them into upcoming shows or consider refining them based on audience feedback.`,
        category: 'performance',
        priority: 'low'
      });
    }
  }
  
  // Genre diversity in set lists
  if (setLists.length >= 1) {
    const allGenres = new Set<string>();
    setLists.forEach(setList => {
      setList.genres.forEach(genre => allGenres.add(genre));
    });
    
    const profileGenres = profile.genres || [];
    const missingGenres = profileGenres.filter(genre => !allGenres.has(genre));
    
    if (missingGenres.length > 0) {
      recommendations.push({
        id: 'SETLIST_GENRE_01',
        title: 'Include All Your Genres in Set Lists',
        description: `Your set lists don't include songs from ${missingGenres.join(', ')}. Consider creating genre-specific sets or mixing genres to showcase your full range.`,
        category: 'skill',
        priority: 'medium'
      });
    }
  }
  
  return recommendations;
}

function generateIndustryBenchmarkRecommendations(profile: MusicianProfile): Recommendation[] {
  const recommendations: Recommendation[] = [];
  
  const shows = profile.shows || [];
  const careerStage = determineCareerStage(profile);
  
  if (shows.length === 0) return recommendations;
  
  // Performance fee analysis
  const avgPayment = shows.reduce((sum, show) => sum + show.payment, 0) / shows.length;
  const venueTypes = shows.map(show => show.venueType);
  const primaryVenueType = venueTypes.sort((a, b) => 
    venueTypes.filter(v => v === a).length - venueTypes.filter(v => v === b).length
  ).pop();
  
  if (primaryVenueType) {
    const benchmarkFee = INDUSTRY_BENCHMARKS.performanceFees[primaryVenueType as keyof typeof INDUSTRY_BENCHMARKS.performanceFees][careerStage];
    
    if (avgPayment < benchmarkFee * 0.8) {
      recommendations.push({
        id: 'INDUSTRY_FEE_01',
        title: 'Increase Your Performance Rates',
        description: `Your average payment of $${avgPayment.toFixed(0)} is below industry standard for ${careerStage} ${primaryVenueType} performers ($${benchmarkFee}). Research local rates and gradually increase your fees.`,
        category: 'performance',
        priority: 'high'
      });
    }
  }
  
  // Audience size analysis
  const avgAudienceSize = shows.reduce((sum, show) => sum + show.audienceSize, 0) / shows.length;
  if (primaryVenueType) {
    const benchmarkAudience = INDUSTRY_BENCHMARKS.audienceSizes[primaryVenueType as keyof typeof INDUSTRY_BENCHMARKS.audienceSizes];
    
    if (avgAudienceSize < benchmarkAudience.optimal * 0.6) {
      recommendations.push({
        id: 'INDUSTRY_AUDIENCE_01',
        title: 'Focus on Audience Development',
        description: `Your average audience of ${avgAudienceSize.toFixed(0)} is below optimal for ${primaryVenueType} venues (${benchmarkAudience.optimal}). Improve your marketing and fan engagement strategies.`,
        category: 'marketing',
        priority: 'high'
      });
    }
  }
  
  // Show frequency analysis
  const showsPerMonth = shows.length / 12; // Assuming shows are from the last year
  const benchmarkFrequency = INDUSTRY_BENCHMARKS.showFrequency[careerStage].monthly;
  
  if (showsPerMonth < benchmarkFrequency * 0.5) {
    recommendations.push({
      id: 'INDUSTRY_FREQUENCY_01',
      title: 'Increase Performance Frequency',
      description: `You're performing ${showsPerMonth.toFixed(1)} times per month, but ${careerStage} musicians typically perform ${benchmarkFrequency} times monthly. Increased frequency leads to better stage presence and more income.`,
      category: 'performance',
      priority: 'medium'
    });
  }
  
  // Practice time analysis
  const practiceLog = profile.practiceLog || [];
  if (practiceLog.length > 0) {
    const totalPracticeMinutes = practiceLog.reduce((sum, session) => sum + session.duration, 0);
    const avgWeeklyPractice = (totalPracticeMinutes / practiceLog.length) * 7; // Rough estimate
    const benchmarkPractice = INDUSTRY_BENCHMARKS.practiceTime[careerStage].weekly;
    
    if (avgWeeklyPractice < benchmarkPractice * 0.7) {
      recommendations.push({
        id: 'INDUSTRY_PRACTICE_01',
        title: 'Align Practice Time with Industry Standards',
        description: `Your practice time of ${(avgWeeklyPractice / 60).toFixed(1)} hours per week is below the ${(benchmarkPractice / 60).toFixed(1)} hours recommended for ${careerStage} musicians. Consistent practice is key to professional development.`,
        category: 'skill',
        priority: 'medium'
      });
    }
  }
  
  // Genre-specific venue recommendations
  const primaryGenre = profile.genres?.[0]?.toLowerCase();
  if (primaryGenre) {
    const genreInfo = INDUSTRY_BENCHMARKS.genreInsights[primaryGenre as keyof typeof INDUSTRY_BENCHMARKS.genreInsights];
    
    if (genreInfo) {
      const currentVenueTypes = new Set(shows.map(show => show.venueType));
      const recommendedVenues = genreInfo.typicalVenues.filter(venue => !currentVenueTypes.has(venue));
      
      if (recommendedVenues.length > 0) {
        recommendations.push({
          id: 'INDUSTRY_VENUE_01',
          title: `Explore ${primaryGenre} Music Venues`,
          description: `${primaryGenre} musicians typically perform at ${recommendedVenues.join(', ')} venues. Consider reaching out to these venue types to expand your performance opportunities.`,
          category: 'performance',
          priority: 'medium'
        });
      }
    }
  }
  
  return recommendations;
}

function generateAdvancedRecommendations(profile: MusicianProfile): Recommendation[] {
  const recommendations: Recommendation[] = [];
  
  // Calculate comprehensive metrics
  const totalShows = profile.shows?.length || 0;
  const totalEarnings = profile.shows?.reduce((sum, show) => sum + show.payment, 0) || 0;
  const avgEarningsPerShow = totalShows > 0 ? totalEarnings / totalShows : 0;
  const totalRecordings = profile.recordings?.length || 0;
  const totalRecordingCost = profile.recordings?.reduce((sum, session) => sum + session.cost, 0) || 0;
  const totalRecordingRevenue = profile.recordings?.reduce((sum, session) => sum + session.totalRevenue, 0) || 0;
  
  // Recent activity analysis (last 3 months)
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  const recentShows = profile.shows?.filter(show => new Date(show.date) > threeMonthsAgo) || [];
  const recentPractice = profile.practiceLog?.filter(session => new Date(session.date) > threeMonthsAgo) || [];
  
  // Revenue Optimization Recommendations
  if (totalEarnings > 0 && avgEarningsPerShow < 150 && totalShows >= 5) {
    recommendations.push({
      id: 'REV_OPT_01',
      title: 'Implement Dynamic Pricing Strategy',
      description: `Your average earnings of $${avgEarningsPerShow.toFixed(0)} per show suggest room for improvement. Research market rates, create tiered pricing for different venue types, and negotiate based on audience size and venue capacity.`,
      category: 'performance',
      priority: 'high'
    });
  }
  
  if (totalShows >= 10 && !profile.marketingEfforts.includes('mailing')) {
    recommendations.push({
      id: 'REV_OPT_02',
      title: 'Launch Merchandise Strategy',
      description: 'With your performance experience, consider selling merchandise at shows. Start with simple items like stickers, t-shirts, or physical copies of your music. This can increase revenue by 20-40% per show.',
      category: 'marketing',
      priority: 'medium'
    });
  }
  
  if (totalEarnings > 2000 && totalRecordings === 0) {
    recommendations.push({
      id: 'REV_OPT_03',
      title: 'Diversify Revenue with Recording Sales',
      description: 'Your strong performance earnings indicate market demand. Recording and selling your music could create passive income streams through streaming, downloads, and sync licensing.',
      category: 'skill',
      priority: 'medium'
    });
  }
  
  // Creative Development Recommendations
  const recordingSongs = profile.recordings?.reduce((sum, session) => sum + session.songs.length, 0) || 0;
  const avgAudienceSize = totalShows > 0 ? (profile.shows?.reduce((sum, show) => sum + show.audienceSize, 0) || 0) / totalShows : 0;
  
  if (recordingSongs >= 5 && avgAudienceSize < 30) {
    recommendations.push({
      id: 'CREATIVE_01',
      title: 'Seek Strategic Collaborations',
      description: 'Your recording activity shows creative output, but audience growth is slow. Partner with artists in complementary genres, feature on each other\'s tracks, or organize collaborative shows to cross-pollinate audiences.',
      category: 'networking',
      priority: 'high'
    });
  }
  
  const venueTypes = new Set(profile.shows?.map(show => show.venueType) || []);
  if (venueTypes.size <= 2 && totalShows >= 8) {
    recommendations.push({
      id: 'CREATIVE_02',
      title: 'Explore Genre-Specific Venues',
      description: 'You\'re performing regularly but in limited venue types. Research genre-specific venues, festivals, and events. Different venues attract different audiences and can inspire creative growth.',
      category: 'performance',
      priority: 'medium'
    });
  }
  
  // Business Development Recommendations
  if (totalEarnings > 5000 && profile.yearsOfExperience >= 3) {
    recommendations.push({
      id: 'BUSINESS_01',
      title: 'Establish Professional Contracts',
      description: 'Your earnings level warrants professional contracts. Create standard performance agreements, establish cancellation policies, and consider working with a booking agent or manager.',
      category: 'performance',
      priority: 'medium'
    });
  }
  
  if (totalEarnings > 3000 && totalRecordingCost > 1000) {
    recommendations.push({
      id: 'BUSINESS_02',
      title: 'Implement Financial Planning System',
      description: 'Track business expenses for tax deductions, set aside money for equipment and recording investments, and consider opening a separate business account for music income.',
      category: 'skill',
      priority: 'medium'
    });
  }
  
  if (profile.yearsOfExperience >= 5 && totalShows >= 20) {
    recommendations.push({
      id: 'BUSINESS_03',
      title: 'Pursue Professional Development',
      description: 'Your experience level qualifies you for industry workshops, music business courses, and professional networking events. Consider joining musician unions or professional organizations.',
      category: 'networking',
      priority: 'low'
    });
  }
  
  // Seasonal and Market Timing Recommendations
  const currentMonth = new Date().getMonth();
  const isHolidaySeason = currentMonth >= 10 || currentMonth <= 1; // Nov-Jan
  
  if (isHolidaySeason && recentShows.length < 2) {
    recommendations.push({
      id: 'SEASONAL_01',
      title: 'Capitalize on Holiday Season Demand',
      description: 'Holiday seasons offer increased booking opportunities. Prepare holiday repertoire, reach out to restaurants and event planners, and consider corporate holiday parties.',
      category: 'performance',
      priority: 'high'
    });
  }
  
  const summerMonths = [5, 6, 7, 8]; // Jun-Sep
  if (summerMonths.includes(currentMonth) && venueTypes.size < 3) {
    recommendations.push({
      id: 'SEASONAL_02',
      title: 'Target Summer Festival Circuit',
      description: 'Summer is festival season. Research local festivals, outdoor venues, and summer concert series. Apply early as many book 6-12 months in advance.',
      category: 'performance',
      priority: 'medium'
    });
  }
  
  // Audience Engagement Recommendations
  const recentAudienceGrowth = recentShows.length > 0 ? 
    recentShows.reduce((sum, show) => sum + show.audienceSize, 0) / recentShows.length : 0;
  const overallAvgAudience = avgAudienceSize;
  
  if (recentAudienceGrowth < overallAvgAudience && totalShows >= 5) {
    recommendations.push({
      id: 'AUDIENCE_01',
      title: 'Implement Social Media Engagement Strategy',
      description: 'Your recent shows have smaller audiences than your average. Increase social media activity, engage with fans between shows, and create content that builds anticipation for upcoming performances.',
      category: 'marketing',
      priority: 'high'
    });
  }
  
  if (totalShows >= 10 && !profile.marketingEfforts.includes('social')) {
    recommendations.push({
      id: 'AUDIENCE_02',
      title: 'Develop Fan Retention Program',
      description: 'Create a system to stay connected with your audience. Collect contact information at shows, send thank-you messages, and offer exclusive content to repeat attendees.',
      category: 'marketing',
      priority: 'medium'
    });
  }
  
  // Technical Skill Recommendations
  const practiceHours = profile.practiceLog?.reduce((sum, session) => sum + session.duration, 0) || 0;
  const recentPracticeHours = recentPractice.reduce((sum, session) => sum + session.duration, 0);
  
  if (practiceHours > 0 && recentPracticeHours < (practiceHours / 12)) { // Less than monthly average
    recommendations.push({
      id: 'TECHNICAL_01',
      title: 'Enroll in Advanced Training',
      description: 'Your practice time has decreased recently. Consider advanced workshops, masterclasses, or online courses to reignite your passion and learn new techniques.',
      category: 'skill',
      priority: 'medium'
    });
  }
  
  if (profile.yearsOfExperience >= 3 && totalShows >= 15 && recordingSongs === 0) {
    recommendations.push({
      id: 'TECHNICAL_02',
      title: 'Invest in Recording Equipment',
      description: 'Your performance experience shows you\'re ready for recording. Consider a home studio setup to capture ideas, create demos, and reduce recording costs.',
      category: 'skill',
      priority: 'medium'
    });
  }
  
  return recommendations;
}

interface RecommendationContext {
  profile: MusicianProfile;
  careerStage: 'beginner' | 'intermediate' | 'advanced' | 'professional';
  focusAreas: string[];
  recentActivityLevel: 'low' | 'medium' | 'high';
  financialStatus: 'starting' | 'growing' | 'established';
  dismissedRecommendations: string[];
}

interface WeightedRecommendation extends Recommendation {
  weightedScore: number;
  relevanceFactors: string[];
}

function createRecommendationContext(profile: MusicianProfile): RecommendationContext {
  // Determine career stage
  const careerStage = determineCareerStage(profile);
  
  // Identify focus areas based on survey responses and activity
  const focusAreas = identifyFocusAreas(profile);
  
  // Assess recent activity level
  const recentActivityLevel = assessRecentActivityLevel(profile);
  
  // Determine financial status
  const financialStatus = determineFinancialStatus(profile);
  
  // Get dismissed recommendations (would be stored in user preferences)
  const dismissedRecommendations = profile.preferences?.dismissedRecommendations || [];
  
  return {
    profile,
    careerStage,
    focusAreas,
    recentActivityLevel,
    financialStatus,
    dismissedRecommendations
  };
}

function determineCareerStage(profile: MusicianProfile): RecommendationContext['careerStage'] {
  const totalShows = profile.shows?.length || 0;
  const totalEarnings = profile.shows?.reduce((sum, show) => sum + show.payment, 0) || 0;
  const yearsExperience = profile.yearsOfExperience;
  
  // Professional: High earnings, many shows, extensive experience
  if (totalEarnings > 10000 && totalShows > 50 && yearsExperience >= 5) {
    return 'professional';
  }
  
  // Advanced: Regular performer with good earnings
  if (totalEarnings > 2000 && totalShows > 15 && yearsExperience >= 3) {
    return 'advanced';
  }
  
  // Intermediate: Some performance experience
  if (totalShows > 5 || yearsExperience >= 2) {
    return 'intermediate';
  }
  
  // Beginner: New to performing or music
  return 'beginner';
}

function identifyFocusAreas(profile: MusicianProfile): string[] {
  const focusAreas: string[] = [];
  
  // Based on performance frequency
  if (profile.performanceFrequency === 'never' || profile.performanceFrequency === 'yearly') {
    focusAreas.push('performance');
  }
  
  // Based on marketing efforts
  if (profile.marketingEfforts.length === 0 || profile.marketingEfforts.includes('none')) {
    focusAreas.push('marketing');
  }
  
  // Based on recording activity
  const hasRecordings = profile.recordings && profile.recordings.length > 0;
  if (!hasRecordings && profile.yearsOfExperience >= 2) {
    focusAreas.push('recording');
  }
  
  // Based on goals
  const goalTypes = new Set(profile.goals?.map(goal => goal.type) || []);
  if (goalTypes.has('financial')) {
    focusAreas.push('financial');
  }
  if (goalTypes.has('skill')) {
    focusAreas.push('skill');
  }
  
  // Default focus areas if none identified
  if (focusAreas.length === 0) {
    focusAreas.push('skill', 'performance');
  }
  
  return focusAreas;
}

function assessRecentActivityLevel(profile: MusicianProfile): RecommendationContext['recentActivityLevel'] {
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  
  const recentShows = profile.shows?.filter(show => new Date(show.date) > threeMonthsAgo).length || 0;
  const recentPractice = profile.practiceLog?.filter(session => new Date(session.date) > threeMonthsAgo).length || 0;
  const recentRecordings = profile.recordings?.filter(session => new Date(session.date) > threeMonthsAgo).length || 0;
  
  const totalRecentActivity = recentShows + recentPractice + recentRecordings;
  
  if (totalRecentActivity >= 10) return 'high';
  if (totalRecentActivity >= 3) return 'medium';
  return 'low';
}

function determineFinancialStatus(profile: MusicianProfile): RecommendationContext['financialStatus'] {
  const totalEarnings = profile.shows?.reduce((sum, show) => sum + show.payment, 0) || 0;
  const totalRecordingRevenue = profile.recordings?.reduce((sum, session) => sum + session.totalRevenue, 0) || 0;
  const totalRevenue = totalEarnings + totalRecordingRevenue;
  
  if (totalRevenue > 5000) return 'established';
  if (totalRevenue > 500) return 'growing';
  return 'starting';
}

function applyPersonalizationWeighting(
  recommendations: Recommendation[], 
  context: RecommendationContext
): WeightedRecommendation[] {
  return recommendations
    .filter(rec => !context.dismissedRecommendations.includes(rec.id))
    .map(rec => {
      const weightedRec: WeightedRecommendation = {
        ...rec,
        weightedScore: 0,
        relevanceFactors: []
      };
      
      // Base priority score
      const priorityScores = { high: 100, medium: 60, low: 30 };
      weightedRec.weightedScore = priorityScores[rec.priority];
      
      // Career stage weighting
      const careerStageWeight = calculateCareerStageWeight(rec, context.careerStage);
      weightedRec.weightedScore *= careerStageWeight;
      if (careerStageWeight > 1) {
        weightedRec.relevanceFactors.push(`Optimized for ${context.careerStage} musicians`);
      }
      
      // Focus area weighting
      const focusAreaWeight = calculateFocusAreaWeight(rec, context.focusAreas);
      weightedRec.weightedScore *= focusAreaWeight;
      if (focusAreaWeight > 1) {
        weightedRec.relevanceFactors.push('Matches your current focus areas');
      }
      
      // Activity level weighting
      const activityWeight = calculateActivityLevelWeight(rec, context.recentActivityLevel);
      weightedRec.weightedScore *= activityWeight;
      if (activityWeight > 1) {
        weightedRec.relevanceFactors.push('Suited to your activity level');
      }
      
      // Financial status weighting
      const financialWeight = calculateFinancialStatusWeight(rec, context.financialStatus);
      weightedRec.weightedScore *= financialWeight;
      if (financialWeight > 1) {
        weightedRec.relevanceFactors.push('Appropriate for your financial stage');
      }
      
      // Seasonal relevance
      const seasonalWeight = calculateSeasonalWeight(rec);
      weightedRec.weightedScore *= seasonalWeight;
      if (seasonalWeight > 1) {
        weightedRec.relevanceFactors.push('Timely for current season');
      }
      
      return weightedRec;
    });
}

function calculateCareerStageWeight(rec: Recommendation, careerStage: RecommendationContext['careerStage']): number {
  // Skill recommendations are more important for beginners
  if (rec.category === 'skill') {
    switch (careerStage) {
      case 'beginner': return 1.5;
      case 'intermediate': return 1.2;
      case 'advanced': return 0.8;
      case 'professional': return 0.6;
    }
  }
  
  // Performance recommendations scale with experience
  if (rec.category === 'performance') {
    switch (careerStage) {
      case 'beginner': return 1.3;
      case 'intermediate': return 1.4;
      case 'advanced': return 1.2;
      case 'professional': return 1.0;
    }
  }
  
  // Marketing becomes more important as you advance
  if (rec.category === 'marketing') {
    switch (careerStage) {
      case 'beginner': return 0.8;
      case 'intermediate': return 1.2;
      case 'advanced': return 1.4;
      case 'professional': return 1.3;
    }
  }
  
  // Networking is crucial for intermediate and advanced
  if (rec.category === 'networking') {
    switch (careerStage) {
      case 'beginner': return 0.7;
      case 'intermediate': return 1.3;
      case 'advanced': return 1.5;
      case 'professional': return 1.2;
    }
  }
  
  return 1.0;
}

function calculateFocusAreaWeight(rec: Recommendation, focusAreas: string[]): number {
  // Map recommendation categories to focus areas
  const categoryToFocusMap: Record<string, string[]> = {
    'skill': ['skill', 'recording'],
    'performance': ['performance'],
    'marketing': ['marketing', 'financial'],
    'networking': ['performance', 'marketing']
  };
  
  const recFocusAreas = categoryToFocusMap[rec.category] || [];
  const hasMatchingFocus = recFocusAreas.some(area => focusAreas.includes(area));
  
  return hasMatchingFocus ? 1.3 : 1.0;
}

function calculateActivityLevelWeight(rec: Recommendation, activityLevel: RecommendationContext['recentActivityLevel']): number {
  // High activity users might need different recommendations than low activity users
  if (rec.id.includes('PRACTICE') || rec.id.includes('SKILL')) {
    switch (activityLevel) {
      case 'low': return 1.4;
      case 'medium': return 1.1;
      case 'high': return 0.9;
    }
  }
  
  if (rec.id.includes('PERF') || rec.id.includes('VENUE')) {
    switch (activityLevel) {
      case 'low': return 1.2;
      case 'medium': return 1.3;
      case 'high': return 1.1;
    }
  }
  
  return 1.0;
}

function calculateFinancialStatusWeight(rec: Recommendation, financialStatus: RecommendationContext['financialStatus']): number {
  // Revenue optimization recommendations are more relevant for growing/established musicians
  if (rec.id.includes('REV_OPT') || rec.id.includes('BUSINESS')) {
    switch (financialStatus) {
      case 'starting': return 0.7;
      case 'growing': return 1.3;
      case 'established': return 1.4;
    }
  }
  
  // Basic skill and performance recommendations are more important when starting
  if (rec.id.includes('SKILL_01') || rec.id.includes('PERF_01')) {
    switch (financialStatus) {
      case 'starting': return 1.3;
      case 'growing': return 1.0;
      case 'established': return 0.8;
    }
  }
  
  return 1.0;
}

function calculateSeasonalWeight(rec: Recommendation): number {
  const currentMonth = new Date().getMonth();
  
  // Holiday season recommendations
  if (rec.id.includes('SEASONAL_01') && (currentMonth >= 10 || currentMonth <= 1)) {
    return 1.5;
  }
  
  // Summer festival recommendations
  if (rec.id.includes('SEASONAL_02') && currentMonth >= 5 && currentMonth <= 8) {
    return 1.4;
  }
  
  // Recording recommendations might be better in winter months (more indoor time)
  if (rec.id.includes('REC_') && (currentMonth >= 11 || currentMonth <= 2)) {
    return 1.1;
  }
  
  return 1.0;
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
