import { describe, it, expect } from 'vitest';
import { generateRecommendations } from './recommendationEngine';
import { createBasicProfile } from '../utils/profileUtils';

describe('recommendationEngine', () => {
  it('generates marketing recommendations for beginners with minimal marketing', () => {
    const profile = createBasicProfile({
      instrument: 'Guitar',
      performanceFrequency: 'never',
      crowdSize: '1-10',
      yearsOfExperience: 1,
      marketingEfforts: ['none'],
    });

    const recommendations = generateRecommendations(profile);
    const marketingRec = recommendations.find(r => r.id === 'MKT_01');
    expect(marketingRec).toBeDefined();
    expect(marketingRec?.priority).toBe('high');
  });

  it('generates performance recommendations for experienced non-performers', () => {
    const profile = createBasicProfile({
      instrument: 'Piano',
      performanceFrequency: 'never',
      crowdSize: '1-10',
      yearsOfExperience: 5,
      marketingEfforts: ['social'],
    });

    const recommendations = generateRecommendations(profile);
    const performanceRec = recommendations.find(r => r.id === 'PERF_01');
    expect(performanceRec).toBeDefined();
    expect(performanceRec?.priority).toBe('high');
  });

  it('generates networking recommendations for regular performers with small crowds', () => {
    const profile = createBasicProfile({
      instrument: 'Vocals',
      performanceFrequency: 'weekly',
      crowdSize: '10-50',
      yearsOfExperience: 3,
      marketingEfforts: ['social', 'website'],
    });

    const recommendations = generateRecommendations(profile);
    const networkingRec = recommendations.find(r => r.id === 'NET_02');
    expect(networkingRec).toBeDefined();
  });

  it('prioritizes high priority recommendations first', () => {
    const profile = createBasicProfile({
      instrument: 'Drums',
      performanceFrequency: 'never',
      crowdSize: '1-10',
      yearsOfExperience: 0.5,
      marketingEfforts: ['none'],
    });

    const recommendations = generateRecommendations(profile);
    expect(recommendations[0]?.priority).toBe('high');
  });

  it('returns at most 5 recommendations', () => {
    const profile = createBasicProfile({
      instrument: 'Guitar',
      performanceFrequency: 'weekly',
      crowdSize: '100-500',
      yearsOfExperience: 10,
      marketingEfforts: ['social', 'mailing', 'website', 'networking'],
    });

    const recommendations = generateRecommendations(profile);
    expect(recommendations.length).toBeLessThanOrEqual(5);
  });

  it('generates skill development recommendations for beginners', () => {
    const profile = createBasicProfile({
      instrument: 'Violin',
      performanceFrequency: 'yearly',
      crowdSize: '1-10',
      yearsOfExperience: 1,
      marketingEfforts: ['none'],
    });

    const recommendations = generateRecommendations(profile);
    const skillRec = recommendations.find(r => r.id === 'SKILL_01');
    expect(skillRec).toBeDefined();
  });

  it('interpolates instrument into description', () => {
    const profile = createBasicProfile({
      instrument: 'Guitar',
      performanceFrequency: 'never',
      crowdSize: '1-10',
      yearsOfExperience: 1,
      marketingEfforts: ['none'],
    });

    const recommendations = generateRecommendations(profile);
    const marketingRec = recommendations.find(r => r.id === 'MKT_01');
    expect(marketingRec?.description).toContain('#guitarplayer');
  });
});
