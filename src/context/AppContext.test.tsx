import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { AppProvider, useApp, useSetPage, useSetProfile, useSetRecommendations, useSetLoading, useReset } from './AppContext'
import { MusicianProfile, Recommendation } from '@/core/types'

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <AppProvider>{children}</AppProvider>
)

describe('AppContext', () => {
  it('provides initial state correctly', () => {
    const { result } = renderHook(() => useApp(), { wrapper: TestWrapper })
    
    expect(result.current.state.currentPage).toBe('landing')
    expect(result.current.state.musicianProfile).toBe(null)
    expect(result.current.state.recommendations).toEqual([])
    expect(result.current.state.isLoading).toBe(false)
  })

  it('updates page state correctly', () => {
    const { result } = renderHook(() => {
      const app = useApp()
      const setPage = useSetPage()
      return { app, setPage }
    }, { wrapper: TestWrapper })

    act(() => {
      result.current.setPage('form')
    })

    expect(result.current.app.state.currentPage).toBe('form')
  })

  it('updates musician profile correctly', () => {
    const mockProfile: MusicianProfile = {
      instrument: 'Guitar',
      performanceFrequency: 'weekly',
      crowdSize: '50-100',
      yearsOfExperience: 5,
      marketingEfforts: ['social', 'website']
    }

    const { result } = renderHook(() => {
      const app = useApp()
      const setProfile = useSetProfile()
      return { app, setProfile }
    }, { wrapper: TestWrapper })

    act(() => {
      result.current.setProfile(mockProfile)
    })

    expect(result.current.app.state.musicianProfile).toEqual(mockProfile)
  })

  it('updates recommendations correctly', () => {
    const mockRecommendations: Recommendation[] = [
      {
        id: 'TEST_01',
        title: 'Test Recommendation',
        description: 'This is a test recommendation',
        category: 'marketing',
        priority: 'high'
      }
    ]

    const { result } = renderHook(() => {
      const app = useApp()
      const setRecommendations = useSetRecommendations()
      return { app, setRecommendations }
    }, { wrapper: TestWrapper })

    act(() => {
      result.current.setRecommendations(mockRecommendations)
    })

    expect(result.current.app.state.recommendations).toEqual(mockRecommendations)
  })

  it('updates loading state correctly', () => {
    const { result } = renderHook(() => {
      const app = useApp()
      const setLoading = useSetLoading()
      return { app, setLoading }
    }, { wrapper: TestWrapper })

    act(() => {
      result.current.setLoading(true)
    })

    expect(result.current.app.state.isLoading).toBe(true)
  })

  it('resets state correctly', () => {
    const mockProfile: MusicianProfile = {
      instrument: 'Piano',
      performanceFrequency: 'monthly',
      crowdSize: '1-10',
      yearsOfExperience: 2,
      marketingEfforts: ['none']
    }

    const { result } = renderHook(() => {
      const app = useApp()
      const setProfile = useSetProfile()
      const setPage = useSetPage()
      const reset = useReset()
      return { app, setProfile, setPage, reset }
    }, { wrapper: TestWrapper })

    // Set some state
    act(() => {
      result.current.setProfile(mockProfile)
      result.current.setPage('results')
    })

    // Verify state is set
    expect(result.current.app.state.currentPage).toBe('results')
    expect(result.current.app.state.musicianProfile).toEqual(mockProfile)

    // Reset
    act(() => {
      result.current.reset()
    })

    // Verify state is reset to initial
    expect(result.current.app.state.currentPage).toBe('landing')
    expect(result.current.app.state.musicianProfile).toBe(null)
    expect(result.current.app.state.recommendations).toEqual([])
    expect(result.current.app.state.isLoading).toBe(false)
  })

  it('throws error when used outside provider', () => {
    expect(() => {
      renderHook(() => useApp())
    }).toThrow('useApp must be used within an AppProvider')
  })
})