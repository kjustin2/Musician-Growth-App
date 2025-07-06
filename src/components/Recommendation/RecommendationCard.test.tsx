import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import RecommendationCard from './RecommendationCard'
import { Recommendation } from '@/core/types'

describe('RecommendationCard', () => {
  const mockRecommendation: Recommendation = {
    id: 'TEST_01',
    title: 'Test Marketing Recommendation',
    description: 'This is a test recommendation for marketing improvements.',
    category: 'marketing',
    priority: 'high'
  }

  it('renders recommendation content correctly', () => {
    render(<RecommendationCard recommendation={mockRecommendation} />)
    
    expect(screen.getByText('Test Marketing Recommendation')).toBeInTheDocument()
    expect(screen.getByText('This is a test recommendation for marketing improvements.')).toBeInTheDocument()
    expect(screen.getByText('high priority')).toBeInTheDocument()
  })

  it('applies correct priority class', () => {
    render(<RecommendationCard recommendation={mockRecommendation} />)
    
    const card = screen.getByText('Test Marketing Recommendation').closest('.recommendation-card')
    expect(card).toHaveClass('recommendation-card-high')
  })

  it('shows correct category icon and styling', () => {
    render(<RecommendationCard recommendation={mockRecommendation} />)
    
    const icon = screen.getByLabelText('Marketing & Promotion')
    expect(icon).toBeInTheDocument()
    expect(icon).toHaveClass('recommendation-icon-marketing')
    expect(icon).toHaveTextContent('M')
  })

  it('renders different categories correctly', () => {
    const categories: Array<{ category: Recommendation['category'], expectedIcon: string, expectedLabel: string }> = [
      { category: 'performance', expectedIcon: 'P', expectedLabel: 'Performance & Gigging' },
      { category: 'networking', expectedIcon: 'N', expectedLabel: 'Networking & Collaboration' },
      { category: 'skill', expectedIcon: 'S', expectedLabel: 'Skill Development' }
    ]

    categories.forEach(({ category, expectedIcon, expectedLabel }) => {
      const testRecommendation: Recommendation = {
        ...mockRecommendation,
        category,
        id: `TEST_${category.toUpperCase()}`
      }

      const { unmount } = render(<RecommendationCard recommendation={testRecommendation} />)
      
      const icon = screen.getByLabelText(expectedLabel)
      expect(icon).toHaveTextContent(expectedIcon)
      expect(icon).toHaveClass(`recommendation-icon-${category}`)
      
      unmount()
    })
  })

  it('renders different priorities correctly', () => {
    const priorities: Recommendation['priority'][] = ['high', 'medium', 'low']

    priorities.forEach(priority => {
      const testRecommendation: Recommendation = {
        ...mockRecommendation,
        priority,
        id: `TEST_${priority.toUpperCase()}`
      }

      const { unmount } = render(<RecommendationCard recommendation={testRecommendation} />)
      
      const card = screen.getByText('Test Marketing Recommendation').closest('.recommendation-card')
      expect(card).toHaveClass(`recommendation-card-${priority}`)
      
      const badge = screen.getByText(`${priority} priority`)
      expect(badge).toHaveClass(`priority-${priority}`)
      
      unmount()
    })
  })

  it('has proper accessibility attributes', () => {
    render(<RecommendationCard recommendation={mockRecommendation} />)
    
    const icon = screen.getByLabelText('Marketing & Promotion')
    expect(icon).toHaveAttribute('title', 'Marketing & Promotion')
    
    const title = screen.getByRole('heading', { level: 3 })
    expect(title).toHaveTextContent('Test Marketing Recommendation')
  })
})