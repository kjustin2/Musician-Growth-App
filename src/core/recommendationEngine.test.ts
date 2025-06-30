import { describe, it, expect } from 'vitest'
import { generateRecommendations } from './recommendationEngine'
import { MusicianProfile } from './types'

describe('recommendationEngine', () => {
  it('generates marketing recommendations for beginners with minimal marketing', () => {
    const profile: MusicianProfile = {
      instrument: 'Guitar',
      performanceFrequency: 'never',
      crowdSize: '1-10',
      yearsOfExperience: 1,
      marketingEfforts: ['none']
    }

    const recommendations = generateRecommendations(profile)
    
    expect(recommendations).toHaveLength(3)
    expect(recommendations.some(r => r.category === 'marketing')).toBe(true)
    expect(recommendations.some(r => r.category === 'performance')).toBe(true)
    expect(recommendations.some(r => r.category === 'skill')).toBe(true)
  })

  it('generates performance recommendations for experienced non-performers', () => {
    const profile: MusicianProfile = {
      instrument: 'Piano',
      performanceFrequency: 'never',
      crowdSize: '1-10',
      yearsOfExperience: 5,
      marketingEfforts: ['social']
    }

    const recommendations = generateRecommendations(profile)
    
    const performanceRec = recommendations.find(r => r.category === 'performance')
    expect(performanceRec).toBeDefined()
    expect(performanceRec?.title).toContain('Get On Stage')
  })

  it('generates networking recommendations for regular performers with small crowds', () => {
    const profile: MusicianProfile = {
      instrument: 'Vocals',
      performanceFrequency: 'weekly',
      crowdSize: '10-50',
      yearsOfExperience: 3,
      marketingEfforts: ['social', 'website']
    }

    const recommendations = generateRecommendations(profile)
    
    const networkingRec = recommendations.find(r => r.category === 'networking')
    expect(networkingRec).toBeDefined()
  })

  it('prioritizes high priority recommendations first', () => {
    const profile: MusicianProfile = {
      instrument: 'Drums',
      performanceFrequency: 'never',
      crowdSize: '1-10',
      yearsOfExperience: 0.5,
      marketingEfforts: ['none']
    }

    const recommendations = generateRecommendations(profile)
    
    // First recommendation should be high priority
    expect(recommendations[0]?.priority).toBe('high')
  })

  it('returns at most 5 recommendations', () => {
    const profile: MusicianProfile = {
      instrument: 'Guitar',
      performanceFrequency: 'weekly',
      crowdSize: '100-500',
      yearsOfExperience: 10,
      marketingEfforts: ['social', 'mailing', 'website', 'networking']
    }

    const recommendations = generateRecommendations(profile)
    
    expect(recommendations.length).toBeLessThanOrEqual(5)
  })

  it('generates skill development recommendations for beginners', () => {
    const profile: MusicianProfile = {
      instrument: 'Violin',
      performanceFrequency: 'yearly',
      crowdSize: '1-10',
      yearsOfExperience: 1,
      marketingEfforts: ['none']
    }

    const recommendations = generateRecommendations(profile)
    
    const skillRec = recommendations.find(r => r.category === 'skill')
    expect(skillRec).toBeDefined()
    expect(skillRec?.title).toContain('Practice')
  })
})