import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import LandingPage from './LandingPage'

// Mock the context
vi.mock('@/context/AppContext', () => ({
  useSetPage: () => vi.fn()
}))

describe('LandingPage', () => {
  it('renders the main heading', () => {
    render(<LandingPage />)
    expect(screen.getByText('Find Your Next Step as a Musician')).toBeInTheDocument()
  })

  it('renders the subtitle', () => {
    render(<LandingPage />)
    expect(screen.getByText(/Get personalized advice to grow your music career/)).toBeInTheDocument()
  })

  it('renders the Get Started button', () => {
    render(<LandingPage />)
    expect(screen.getByRole('button', { name: 'Get Started' })).toBeInTheDocument()
  })

  it('renders the How It Works section', () => {
    render(<LandingPage />)
    expect(screen.getByText('How It Works')).toBeInTheDocument()
    expect(screen.getByText('Tell Us About You')).toBeInTheDocument()
    expect(screen.getByText('Get Instant Analysis')).toBeInTheDocument()
    expect(screen.getByText('Grow Your Career')).toBeInTheDocument()
  })

  it('renders step numbers', () => {
    render(<LandingPage />)
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })
})