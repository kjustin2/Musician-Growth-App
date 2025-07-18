import { 
  SetList, 
  SetListSong, 
  SetListAnalysis, 
  GenreRecommendation,
  SetListError 
} from '../core/types';

const DB_NAME = 'MusicianGrowthApp';
const DB_VERSION = 3;

// Genre compatibility matrix for recommendations
const GENRE_COMPATIBILITY: Record<string, string[]> = {
  'country': ['classic_rock', 'folk', 'blues', 'americana', 'pop'],
  'rock': ['blues', 'country', 'pop', 'alternative', 'classic_rock'],
  'jazz': ['blues', 'soul', 'funk', 'latin', 'swing'],
  'folk': ['country', 'indie', 'acoustic', 'americana', 'bluegrass'],
  'pop': ['rock', 'r&b', 'dance', 'indie', 'country'],
  'blues': ['rock', 'country', 'jazz', 'soul', 'r&b'],
  'classical': ['contemporary', 'orchestral', 'chamber', 'opera'],
  'electronic': ['dance', 'ambient', 'techno', 'house', 'experimental'],
  'r&b': ['soul', 'funk', 'pop', 'jazz', 'hip_hop'],
  'indie': ['alternative', 'folk', 'pop', 'electronic', 'rock']
};

export class SetListService {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        reject(new SetListError('Failed to open database', 'STORAGE_FAILED'));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        this.createStores(db);
      };
    });
  }

  private createStores(db: IDBDatabase): void {
    // Set lists store
    if (!db.objectStoreNames.contains('set_lists')) {
      const setListStore = db.createObjectStore('set_lists', { keyPath: 'id' });
      setListStore.createIndex('profileId', 'profileId');
      setListStore.createIndex('usageCount', 'usageCount');
      setListStore.createIndex('lastUsed', 'lastUsed');
    }
  }

  async saveSetList(setList: SetList): Promise<void> {
    if (!this.db) {
      throw new SetListError('Database not initialized', 'STORAGE_FAILED');
    }

    // Validate set list has songs
    if (!setList.songs || setList.songs.length === 0) {
      throw new SetListError('Set list must contain at least one song', 'EMPTY_SETLIST');
    }

    // Validate each song has required data
    for (const song of setList.songs) {
      if (!song.title || !song.artist || !song.genre) {
        throw new SetListError('Each song must have title, artist, and genre', 'INVALID_SONG_DATA');
      }
    }

    // Calculate total duration and genres
    const processedSetList = {
      ...setList,
      totalDuration: this.calculateTotalDuration(setList.songs),
      genres: this.extractGenres(setList.songs),
      updatedAt: new Date()
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['set_lists'], 'readwrite');
      const store = transaction.objectStore('set_lists');
      const request = store.put(processedSetList);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new SetListError('Failed to save set list', 'STORAGE_FAILED'));
    });
  }

  async getSetLists(profileId: string): Promise<SetList[]> {
    if (!this.db) {
      throw new SetListError('Database not initialized', 'STORAGE_FAILED');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['set_lists'], 'readonly');
      const store = transaction.objectStore('set_lists');
      const index = store.index('profileId');
      const request = index.getAll(profileId);

      request.onsuccess = () => {
        const setLists = request.result || [];
        // Sort by last used date, then by creation date
        setLists.sort((a, b) => {
          if (a.lastUsed && b.lastUsed) {
            return new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime();
          }
          if (a.lastUsed) return -1;
          if (b.lastUsed) return 1;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        resolve(setLists);
      };
      
      request.onerror = () => reject(new SetListError('Failed to get set lists', 'STORAGE_FAILED'));
    });
  }

  async getSetList(setListId: string): Promise<SetList | null> {
    if (!this.db) {
      throw new SetListError('Database not initialized', 'STORAGE_FAILED');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['set_lists'], 'readonly');
      const store = transaction.objectStore('set_lists');
      const request = store.get(setListId);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(new SetListError('Failed to get set list', 'STORAGE_FAILED'));
    });
  }

  async updateSetList(setListId: string, updates: Partial<SetList>): Promise<void> {
    if (!this.db) {
      throw new SetListError('Database not initialized', 'STORAGE_FAILED');
    }

    const existingSetList = await this.getSetList(setListId);
    if (!existingSetList) {
      throw new SetListError('Set list not found', 'SETLIST_NOT_FOUND', setListId);
    }

    const updatedSetList: SetList = {
      ...existingSetList,
      ...updates,
      updatedAt: new Date()
    };

    // Recalculate derived fields if songs were updated
    if (updates.songs) {
      updatedSetList.totalDuration = this.calculateTotalDuration(updates.songs);
      updatedSetList.genres = this.extractGenres(updates.songs);
    }

    return this.saveSetList(updatedSetList);
  }

  async deleteSetList(setListId: string): Promise<void> {
    if (!this.db) {
      throw new SetListError('Database not initialized', 'STORAGE_FAILED');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['set_lists'], 'readwrite');
      const store = transaction.objectStore('set_lists');
      const request = store.delete(setListId);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new SetListError('Failed to delete set list', 'STORAGE_FAILED'));
    });
  }

  async updateSetListUsage(setListId: string): Promise<void> {
    if (!this.db) {
      throw new SetListError('Database not initialized', 'STORAGE_FAILED');
    }

    const setList = await this.getSetList(setListId);
    if (!setList) {
      throw new SetListError('Set list not found', 'SETLIST_NOT_FOUND', setListId);
    }

    const updatedSetList: SetList = {
      ...setList,
      usageCount: setList.usageCount + 1,
      lastUsed: new Date(),
      updatedAt: new Date()
    };

    return this.saveSetList(updatedSetList);
  }

  async analyzeSetListDiversity(setListId: string): Promise<SetListAnalysis> {
    const setList = await this.getSetList(setListId);
    if (!setList) {
      throw new SetListError('Set list not found', 'SETLIST_NOT_FOUND', setListId);
    }

    return this.analyzeSetList(setList);
  }

  private analyzeSetList(setList: SetList): SetListAnalysis {
    const songs = setList.songs;
    const genres = songs.map(song => song.genre.toLowerCase());
    const uniqueGenres = [...new Set(genres)];
    
    // Calculate genre diversity (0-1 scale)
    const genreDiversity = uniqueGenres.length / Math.max(songs.length, 1);
    
    // Calculate average song duration
    const durations = songs.filter(song => song.duration).map(song => song.duration!);
    const averageSongDuration = durations.length > 0 ? 
      durations.reduce((sum, duration) => sum + duration, 0) / durations.length : 4; // 4 minutes default

    // Calculate genre distribution
    const genreDistribution: Record<string, number> = {};
    genres.forEach(genre => {
      genreDistribution[genre] = (genreDistribution[genre] || 0) + 1;
    });

    // Generate genre recommendations
    const recommendedGenres = this.generateGenreRecommendations(uniqueGenres, genreDistribution);

    return {
      genreDiversity,
      averageSongDuration,
      genreDistribution,
      recommendedGenres
    };
  }

  private generateGenreRecommendations(currentGenres: string[], genreDistribution: Record<string, number>): GenreRecommendation[] {
    const recommendations: GenreRecommendation[] = [];
    const dominantGenre = Object.keys(genreDistribution).reduce((a, b) => 
      genreDistribution[a] > genreDistribution[b] ? a : b
    );

    // Get compatible genres for the dominant genre
    const compatibleGenres = GENRE_COMPATIBILITY[dominantGenre.toLowerCase()] || [];
    
    // Filter out genres already in the set list
    const newGenres = compatibleGenres.filter(genre => 
      !currentGenres.some(current => current.toLowerCase() === genre.toLowerCase())
    );

    // Generate recommendations for the top 3 compatible genres
    newGenres.slice(0, 3).forEach((genre, index) => {
      recommendations.push({
        genre,
        compatibility: this.calculateCompatibilityScore(genre, dominantGenre),
        reason: this.getGenreRecommendationReason(genre, dominantGenre, currentGenres.length)
      });
    });

    return recommendations;
  }

  private calculateCompatibilityScore(recommendedGenre: string, dominantGenre: string): number {
    // Simple compatibility scoring based on genre relationships
    const compatibleGenres = GENRE_COMPATIBILITY[dominantGenre.toLowerCase()] || [];
    const index = compatibleGenres.findIndex(g => g.toLowerCase() === recommendedGenre.toLowerCase());
    
    if (index === -1) return 0.5; // Neutral compatibility
    
    // Higher score for genres that appear earlier in the compatibility list
    return Math.max(0.6, 1 - (index * 0.1));
  }

  private getGenreRecommendationReason(recommendedGenre: string, dominantGenre: string, totalGenres: number): string {
    if (totalGenres === 1) {
      return `Adding ${recommendedGenre} songs would create variety and better audience engagement`;
    }
    
    const reasons: Record<string, string> = {
      'blues': `Blues songs complement ${dominantGenre} well and add emotional depth`,
      'folk': `Folk songs provide acoustic contrast and intimate moments`,
      'pop': `Pop songs are crowd-pleasers that work well with ${dominantGenre}`,
      'rock': `Rock songs add energy and are compatible with ${dominantGenre}`,
      'country': `Country songs have broad appeal and mix well with ${dominantGenre}`,
      'jazz': `Jazz songs showcase musicianship and complement ${dominantGenre}`,
      'r&b': `R&B songs add groove and soul to your ${dominantGenre} set`,
      'indie': `Indie songs bring a modern edge that pairs well with ${dominantGenre}`
    };

    return reasons[recommendedGenre.toLowerCase()] || 
           `${recommendedGenre} songs would add variety and complement your ${dominantGenre} repertoire`;
  }

  private calculateTotalDuration(songs: SetListSong[]): number {
    return songs.reduce((total, song) => total + (song.duration || 4), 0); // Default 4 minutes per song
  }

  private extractGenres(songs: SetListSong[]): string[] {
    const genres = songs.map(song => song.genre);
    return [...new Set(genres)]; // Remove duplicates
  }

  async getMostUsedSetLists(profileId: string, limit: number = 5): Promise<SetList[]> {
    const setLists = await this.getSetLists(profileId);
    return setLists
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, limit);
  }

  async getSetListsByGenre(profileId: string, genre: string): Promise<SetList[]> {
    const setLists = await this.getSetLists(profileId);
    return setLists.filter(setList => 
      setList.genres.some(g => g.toLowerCase() === genre.toLowerCase())
    );
  }
}

export const setListService = new SetListService();