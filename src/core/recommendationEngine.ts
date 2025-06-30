import { MusicianProfile, Recommendation } from './types';
import { RECOMMENDATION_CONFIG } from './constants';

interface RecommendationInput {
  id: string;
  title: string;
  description: string;
  category: Recommendation['category'];
  priority: Recommendation['priority'];
}

export function generateRecommendations(profile: MusicianProfile): Recommendation[] {
  const recommendations: Recommendation[] = [];

  // Helper function to add recommendations with validation
  const addRecommendation = (input: RecommendationInput): void => {
    if (!input.id || !input.title || !input.description) {
      console.warn('Invalid recommendation input:', input);
      return;
    }
    recommendations.push(input);
  };

  // Analyze marketing efforts
  const hasMinimalMarketing = !profile.marketingEfforts.length || 
    profile.marketingEfforts.includes('none') ||
    profile.marketingEfforts.length === 1;

  const hasSocialMedia = profile.marketingEfforts.includes('social');

  // Analyze performance data
  const crowdSizeNumber = getCrowdSizeNumber(profile.crowdSize);
  const isRegularPerformer = ['weekly', 'multiple'].includes(profile.performanceFrequency);
  const isOccasionalPerformer = ['monthly', 'yearly'].includes(profile.performanceFrequency);
  const isNonPerformer = profile.performanceFrequency === 'never';

  // Marketing & Promotion Recommendations
  if (hasMinimalMarketing && crowdSizeNumber < 50) {
    addRecommendation({
      id: 'MKT_01',
      title: 'Build Your Online Presence',
      description: `Start by creating accounts on Instagram and TikTok. Post one high-quality video of you playing each week. Use relevant hashtags like #livemusic and #${profile.instrument.toLowerCase()}player to reach your target audience.`,
      category: 'marketing',
      priority: 'high'
    });
  }

  if (!hasSocialMedia && crowdSizeNumber >= 50) {
    addRecommendation({
      id: 'MKT_02',
      title: 'Amplify Your Existing Audience',
      description: 'You already have a solid fanbase! Create social media accounts to connect with your audience between shows. Share behind-the-scenes content, upcoming gigs, and engage with your fans regularly.',
      category: 'marketing',
      priority: 'high'
    });
  }

  if (!profile.marketingEfforts.includes('mailing') && crowdSizeNumber >= 10) {
    addRecommendation({
      id: 'MKT_03',
      title: 'Start an Email List',
      description: 'Collect email addresses at your gigs and online. Send monthly updates about new songs, upcoming shows, and exclusive content. Email marketing has the highest ROI of all digital marketing channels.',
      category: 'marketing',
      priority: 'medium'
    });
  }

  // Performance & Gigging Recommendations
  if (isNonPerformer && profile.yearsOfExperience >= 1) {
    addRecommendation({
      id: 'PERF_01',
      title: 'Get On Stage!',
      description: 'You have the skills - now it\'s time to perform! Start with open mic nights at local venues. They\'re low-pressure environments perfect for building stage confidence and meeting other musicians.',
      category: 'performance',
      priority: 'high'
    });
  }

  if (isOccasionalPerformer && crowdSizeNumber < 50) {
    addRecommendation({
      id: 'PERF_02',
      title: 'Increase Your Performance Frequency',
      description: 'Try to book more regular gigs. Aim for at least one performance per month. Consistency helps build your reputation and grow your audience. Contact local venues, coffee shops, and restaurants.',
      category: 'performance',
      priority: 'medium'
    });
  }

  if (isRegularPerformer && crowdSizeNumber < 100) {
    addRecommendation({
      id: 'PERF_03',
      title: 'Target Larger Venues',
      description: 'You\'re performing regularly - great! Now focus on venues that can accommodate larger audiences. Research venues in nearby cities and submit professional press kits with your best recordings.',
      category: 'performance',
      priority: 'medium'
    });
  }

  // Networking & Collaboration Recommendations
  if (!profile.marketingEfforts.includes('networking') && profile.yearsOfExperience >= 2) {
    addRecommendation({
      id: 'NET_01',
      title: 'Connect with Fellow Musicians',
      description: 'Attend local jam sessions and music events. Collaborating with other musicians can expose you to new audiences and opportunities. Consider forming a band or booking joint shows.',
      category: 'networking',
      priority: 'medium'
    });
  }

  if (crowdSizeNumber < 50 && isRegularPerformer) {
    addRecommendation({
      id: 'NET_02',
      title: 'Cross-Promote with Local Artists',
      description: 'Partner with other local musicians for show swaps and social media cross-promotion. Share each other\'s content and attend each other\'s shows to combine your audiences.',
      category: 'networking',
      priority: 'high'
    });
  }

  // Skill Development Recommendations
  if (profile.yearsOfExperience < 2) {
    addRecommendation({
      id: 'SKILL_01',
      title: 'Focus on Daily Practice',
      description: 'Dedicate at least 30 minutes daily to focused practice. Work on technique, learn new songs, and gradually challenge yourself with more complex pieces. Consistency beats intensity.',
      category: 'skill',
      priority: 'high'
    });
  }

  if (profile.yearsOfExperience >= 2 && profile.yearsOfExperience < 5) {
    addRecommendation({
      id: 'SKILL_02',
      title: 'Develop Your Unique Sound',
      description: 'You have the basics down - now work on developing your signature style. Experiment with different genres, write original material, and find what makes you stand out from other musicians.',
      category: 'skill',
      priority: 'medium'
    });
  }

  if (profile.yearsOfExperience >= 5 && !isRegularPerformer) {
    addRecommendation({
      id: 'SKILL_03',
      title: 'Share Your Expertise',
      description: 'With your experience, consider teaching lessons or creating educational content. This provides additional income and establishes you as an authority in your field.',
      category: 'skill',
      priority: 'low'
    });
  }

  // Advanced recommendations for experienced musicians
  if (profile.yearsOfExperience >= 5 && crowdSizeNumber >= 100) {
    addRecommendation({
      id: 'ADV_01',
      title: 'Consider Professional Recording',
      description: 'You have a solid fanbase and experience. Invest in professional recording to create high-quality demos or an EP. This opens doors to radio play, streaming playlists, and industry contacts.',
      category: 'skill',
      priority: 'medium'
    });
  }

  // Ensure we have at least minimum recommendations
  if (recommendations.length < RECOMMENDATION_CONFIG.MIN_RECOMMENDATIONS) {
    addRecommendation({
      id: 'GEN_01',
      title: 'Document Your Journey',
      description: 'Create content about your musical journey. Share practice videos, cover songs, and document your progress. This builds your personal brand and connects you with other musicians.',
      category: 'marketing',
      priority: 'medium'
    });
  }

  // Sort by priority (high, medium, low) and return top recommendations
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  return recommendations
    .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
    .slice(0, RECOMMENDATION_CONFIG.MAX_RECOMMENDATIONS);
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