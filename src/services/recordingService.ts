import { RecordingSession, RecordedSong, RecordingError } from '../core/types';
import { storageService } from './storageService';

export class RecordingService {
  private readonly RECORDING_SESSIONS_STORE = 'recording_sessions';
  private readonly RECORDED_SONGS_STORE = 'recorded_songs';

  /**
   * Save a recording session to IndexedDB
   */
  async saveRecording(profileId: string, recording: RecordingSession): Promise<void> {
    try {
      // Validate recording before saving
      this.validateRecording(recording);
      
      // Use the centralized storage service
      await storageService.saveRecordingSession(profileId, recording);
    } catch (error) {
      if (error instanceof RecordingError) {
        throw error;
      }
      throw new RecordingError('Failed to save recording session', 'STORAGE_FAILED');
    }
  }

  /**
   * Get all recording sessions for a profile
   */
  async getRecordings(profileId: string): Promise<RecordingSession[]> {
    try {
      // Use the centralized storage service
      return await storageService.getRecordingSessions(profileId);
    } catch (error) {
      throw new RecordingError('Failed to retrieve recording sessions', 'STORAGE_FAILED');
    }
  }

  /**
   * Update song metrics (plays and revenue)
   */
  async updateSongMetrics(songId: string, plays: number, revenue: number): Promise<void> {
    if (plays < 0 || revenue < 0) {
      throw new RecordingError('Plays and revenue must be non-negative', 'INVALID_COST', false);
    }

    try {
      // Use the centralized storage service
      await storageService.updateSongMetrics(songId, plays, revenue);
    } catch (error) {
      if (error instanceof RecordingError) {
        throw error;
      }
      throw new RecordingError('Failed to update song metrics', 'STORAGE_FAILED');
    }
  }

  /**
   * Bulk add multiple recording sessions
   */
  async bulkAddRecordings(profileId: string, recordings: RecordingSession[]): Promise<void> {
    if (!recordings.length) {
      return;
    }

    // Validate recordings
    for (const recording of recordings) {
      this.validateRecording(recording);
    }

    try {
      // Use the centralized storage service for each recording
      for (const recording of recordings) {
        await storageService.saveRecordingSession(profileId, recording);
      }
    } catch (error) {
      throw new RecordingError('Failed to bulk add recordings', 'STORAGE_FAILED');
    }
  }

  /**
   * Delete a recording session and its songs
   */
  async deleteRecording(recordingId: string): Promise<void> {
    try {
      // Use the centralized storage service
      await storageService.deleteRecordingSession(recordingId);
    } catch (error) {
      throw new RecordingError('Failed to delete recording', 'STORAGE_FAILED');
    }
  }

  /**
   * Validate recording session data
   */
  private validateRecording(recording: RecordingSession): void {
    if (!recording.date) {
      throw new RecordingError('Recording date is required', 'MISSING_SONGS', false);
    }
    
    if (!recording.location?.trim()) {
      throw new RecordingError('Recording location is required', 'MISSING_SONGS', false);
    }
    
    if (recording.cost < 0) {
      throw new RecordingError('Recording cost cannot be negative', 'INVALID_COST', false);
    }
    
    if (!recording.songs || recording.songs.length === 0) {
      throw new RecordingError('At least one song is required', 'MISSING_SONGS', false);
    }
    
    for (const song of recording.songs) {
      if (!song.title?.trim()) {
        throw new RecordingError('Song title is required', 'MISSING_SONGS', false);
      }
      
      if (song.plays < 0 || song.revenue < 0) {
        throw new RecordingError('Song plays and revenue must be non-negative', 'INVALID_COST', false);
      }
    }
  }
}

// Create and export singleton instance
export const recordingService = new RecordingService();