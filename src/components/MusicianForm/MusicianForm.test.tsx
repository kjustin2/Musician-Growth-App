import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MusicianForm from './MusicianForm'
import { AppProvider } from '@/context/AppContext'

// Mock the context hooks
const mockSetPage = vi.fn()
const mockSetProfile = vi.fn()
const mockSetLoading = vi.fn()

vi.mock('@/context/AppContext', async () => {
  const actual = await vi.importActual('@/context/AppContext')
  return {
    ...actual,
    useSetPage: () => mockSetPage,
    useSetProfile: () => mockSetProfile,
    useSetLoading: () => mockSetLoading,
  }
})

const renderMusicianForm = () => {
  return render(
    <AppProvider>
      <MusicianForm />
    </AppProvider>
  )
}

describe('MusicianForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders first step with instrument selection', () => {
    renderMusicianForm()
    
    expect(screen.getByText("What's your primary instrument?")).toBeInTheDocument()
    expect(screen.getByText('Guitar')).toBeInTheDocument()
    expect(screen.getByText('Piano')).toBeInTheDocument()
    expect(screen.getByText('Other')).toBeInTheDocument()
  })

  it('shows progress bar with correct step', () => {
    renderMusicianForm()
    
    expect(screen.getByText('Step 1 of 5')).toBeInTheDocument()
  })

  it('enables Next button when instrument is selected', async () => {
    const user = userEvent.setup()
    renderMusicianForm()
    
    const nextButton = screen.getByRole('button', { name: 'Next' })
    expect(nextButton).toBeDisabled()
    
    await user.click(screen.getByText('Guitar'))
    expect(nextButton).toBeEnabled()
  })

  it('shows custom instrument input when Other is selected', async () => {
    const user = userEvent.setup()
    renderMusicianForm()
    
    await user.click(screen.getByText('Other'))
    
    expect(screen.getByPlaceholderText('Please specify your instrument')).toBeInTheDocument()
  })

  it('progresses through all form steps', async () => {
    const user = userEvent.setup()
    renderMusicianForm()
    
    // Step 1: Select instrument
    await user.click(screen.getByText('Guitar'))
    await user.click(screen.getByRole('button', { name: 'Next' }))
    
    // Step 2: Performance frequency
    expect(screen.getByText('How often do you perform live?')).toBeInTheDocument()
    await user.click(screen.getByLabelText('Weekly'))
    await user.click(screen.getByRole('button', { name: 'Next' }))
    
    // Step 3: Crowd size
    expect(screen.getByText("What's your average crowd size?")).toBeInTheDocument()
    await user.click(screen.getByLabelText('50-100 people'))
    await user.click(screen.getByRole('button', { name: 'Next' }))
    
    // Step 4: Experience
    expect(screen.getByText('How many years have you been playing?')).toBeInTheDocument()
    const experienceInput = screen.getByLabelText('Years of experience')
    await user.clear(experienceInput)
    await user.type(experienceInput, '5')
    await user.click(screen.getByRole('button', { name: 'Next' }))
    
    // Step 5: Marketing efforts
    expect(screen.getByText('What marketing efforts are you currently using?')).toBeInTheDocument()
    await user.click(screen.getByLabelText('Social Media (Facebook, Instagram, TikTok)'))
    
    // Final button should be "Get My Advice"
    expect(screen.getByRole('button', { name: 'Get My Advice' })).toBeInTheDocument()
  })

  it('validates form inputs correctly', async () => {
    const user = userEvent.setup()
    renderMusicianForm()
    
    // Without selecting instrument, Next should be disabled
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled()
    
    // Select instrument
    await user.click(screen.getByText('Piano'))
    expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled()
  })

  it('allows going back to previous steps', async () => {
    const user = userEvent.setup()
    renderMusicianForm()
    
    // Go to step 2
    await user.click(screen.getByText('Guitar'))
    await user.click(screen.getByRole('button', { name: 'Next' }))
    
    // Should show Back button
    expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument()
    
    // Go back to step 1
    await user.click(screen.getByRole('button', { name: 'Back' }))
    expect(screen.getByText("What's your primary instrument?")).toBeInTheDocument()
  })

  it('submits form with correct data', async () => {
    const user = userEvent.setup()
    renderMusicianForm()
    
    // Fill out complete form
    await user.click(screen.getByText('Guitar'))
    await user.click(screen.getByRole('button', { name: 'Next' }))
    
    await user.click(screen.getByLabelText('Weekly'))
    await user.click(screen.getByRole('button', { name: 'Next' }))
    
    await user.click(screen.getByLabelText('50-100 people'))
    await user.click(screen.getByRole('button', { name: 'Next' }))
    
    const experienceInput = screen.getByLabelText('Years of experience')
    await user.clear(experienceInput)
    await user.type(experienceInput, '5')
    await user.click(screen.getByRole('button', { name: 'Next' }))
    
    await user.click(screen.getByLabelText('Social Media (Facebook, Instagram, TikTok)'))
    
    // Submit
    await user.click(screen.getByRole('button', { name: 'Get My Advice' }))
    
    await waitFor(() => {
      expect(mockSetProfile).toHaveBeenCalledWith({
        instrument: 'Guitar',
        performanceFrequency: 'weekly',
        crowdSize: '50-100',
        yearsOfExperience: 5,
        marketingEfforts: ['social']
      })
    })
    
    expect(mockSetLoading).toHaveBeenCalledWith(true)
  })

  it('handles custom instrument correctly', async () => {
    const user = userEvent.setup()
    renderMusicianForm()
    
    await user.click(screen.getByText('Other'))
    
    const customInput = screen.getByPlaceholderText('Please specify your instrument')
    await user.type(customInput, 'Harmonica')
    
    // Complete the form quickly
    await user.click(screen.getByRole('button', { name: 'Next' }))
    await user.click(screen.getByLabelText('Monthly'))
    await user.click(screen.getByRole('button', { name: 'Next' }))
    await user.click(screen.getByLabelText('1-10 people'))
    await user.click(screen.getByRole('button', { name: 'Next' }))
    
    const experienceInput = screen.getByLabelText('Years of experience')
    await user.clear(experienceInput)
    await user.type(experienceInput, '3')
    await user.click(screen.getByRole('button', { name: 'Next' }))
    
    await user.click(screen.getByLabelText('None of the above'))
    await user.click(screen.getByRole('button', { name: 'Get My Advice' }))
    
    await waitFor(() => {
      expect(mockSetProfile).toHaveBeenCalledWith(expect.objectContaining({
        instrument: 'Harmonica'
      }))
    })
  })
})