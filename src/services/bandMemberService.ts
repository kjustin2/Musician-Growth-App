import { 
  BandMember, 
  ParticipationRecord, 
  BandCompositionAnalysis, 
  InstrumentRecommendation,
  BandMemberError 
} from '../core/types';

const DB_NAME = 'MusicianGrowthApp';
const DB_VERSION = 3; // Updated version for new stores

export class BandMemberService {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        reject(new BandMemberError('Failed to open database', 'STORAGE_FAILED'));
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
    // Band members store
    if (!db.objectStoreNames.contains('band_members')) {
      const bandMemberStore = db.createObjectStore('band_members', { keyPath: 'id' });
      bandMemberStore.createIndex('profileId', 'profileId');
      bandMemberStore.createIndex('instrument', 'instrument');
      bandMemberStore.createIndex('joinDate', 'joinDate');
    }

    // Participation records store
    if (!db.objectStoreNames.contains('participation_records')) {
      const participationStore = db.createObjectStore('participation_records', { keyPath: 'id' });
      participationStore.createIndex('bandMemberId', 'bandMemberId');
      participationStore.createIndex('activityType', 'activityType');
      participationStore.createIndex('date', 'date');
      participationStore.createIndex('activityId', 'activityId');
    }
  }

  async saveBandMember(bandMember: BandMember): Promise<void> {
    if (!this.db) {
      throw new BandMemberError('Database not initialized', 'STORAGE_FAILED');
    }

    // Check for duplicates
    const existingMembers = await this.getBandMembers(bandMember.profileId);
    const duplicate = existingMembers.find(member => 
      member.name.toLowerCase() === bandMember.name.toLowerCase() && 
      member.instrument.toLowerCase() === bandMember.instrument.toLowerCase()
    );

    if (duplicate) {
      throw new BandMemberError(
        `Band member ${bandMember.name} already exists with ${bandMember.instrument}`,
        'DUPLICATE_MEMBER'
      );
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['band_members'], 'readwrite');
      const store = transaction.objectStore('band_members');
      const request = store.put(bandMember);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new BandMemberError('Failed to save band member', 'STORAGE_FAILED'));
    });
  }

  async getBandMembers(profileId: string): Promise<BandMember[]> {
    if (!this.db) {
      throw new BandMemberError('Database not initialized', 'STORAGE_FAILED');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['band_members'], 'readonly');
      const store = transaction.objectStore('band_members');
      const index = store.index('profileId');
      const request = index.getAll(profileId);

      request.onsuccess = () => {
        const members = request.result || [];
        resolve(members);
      };
      
      request.onerror = () => reject(new BandMemberError('Failed to get band members', 'STORAGE_FAILED'));
    });
  }

  async getBandMember(memberId: string): Promise<BandMember | null> {
    if (!this.db) {
      throw new BandMemberError('Database not initialized', 'STORAGE_FAILED');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['band_members'], 'readonly');
      const store = transaction.objectStore('band_members');
      const request = store.get(memberId);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(new BandMemberError('Failed to get band member', 'STORAGE_FAILED'));
    });
  }

  async updateBandMember(memberId: string, updates: Partial<BandMember>): Promise<void> {
    if (!this.db) {
      throw new BandMemberError('Database not initialized', 'STORAGE_FAILED');
    }

    const existingMember = await this.getBandMember(memberId);
    if (!existingMember) {
      throw new BandMemberError('Band member not found', 'MEMBER_NOT_FOUND');
    }

    const updatedMember: BandMember = {
      ...existingMember,
      ...updates,
      updatedAt: new Date()
    };

    return this.saveBandMember(updatedMember);
  }

  async deleteBandMember(memberId: string): Promise<void> {
    if (!this.db) {
      throw new BandMemberError('Database not initialized', 'STORAGE_FAILED');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['band_members', 'participation_records'], 'readwrite');
      
      // Delete the band member
      const memberStore = transaction.objectStore('band_members');
      const deleteRequest = memberStore.delete(memberId);

      // Delete all participation records for this member
      const participationStore = transaction.objectStore('participation_records');
      const participationIndex = participationStore.index('bandMemberId');
      const participationRequest = participationIndex.openCursor(memberId);

      participationRequest.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        }
      };

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(new BandMemberError('Failed to delete band member', 'STORAGE_FAILED'));
    });
  }

  async updateParticipation(participation: ParticipationRecord): Promise<void> {
    if (!this.db) {
      throw new BandMemberError('Database not initialized', 'STORAGE_FAILED');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['participation_records'], 'readwrite');
      const store = transaction.objectStore('participation_records');
      const request = store.put(participation);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new BandMemberError('Failed to update participation', 'STORAGE_FAILED'));
    });
  }

  async getParticipationHistory(memberId: string): Promise<ParticipationRecord[]> {
    if (!this.db) {
      throw new BandMemberError('Database not initialized', 'STORAGE_FAILED');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['participation_records'], 'readonly');
      const store = transaction.objectStore('participation_records');
      const index = store.index('bandMemberId');
      const request = index.getAll(memberId);

      request.onsuccess = () => {
        const records = request.result || [];
        // Sort by date descending
        records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        resolve(records);
      };
      
      request.onerror = () => reject(new BandMemberError('Failed to get participation history', 'STORAGE_FAILED'));
    });
  }

  async getBandCompositionAnalysis(profileId: string): Promise<BandCompositionAnalysis> {
    const bandMembers = await this.getBandMembers(profileId);
    
    const currentInstruments = bandMembers.map(member => member.instrument);
    const uniqueInstruments = [...new Set(currentInstruments)];
    
    // Industry standard band compositions
    const standardInstruments = ['vocals', 'guitar', 'bass', 'drums'];
    const missingInstruments = standardInstruments.filter(
      instrument => !uniqueInstruments.some(current => 
        current.toLowerCase().includes(instrument.toLowerCase())
      )
    );

    // Calculate experience balance (0-1 scale)
    const experiences = bandMembers.map(member => member.yearsExperience);
    const avgExperience = experiences.reduce((sum, exp) => sum + exp, 0) / experiences.length;
    const maxExperience = Math.max(...experiences);
    const minExperience = Math.min(...experiences);
    const experienceBalance = experiences.length > 1 ? 
      1 - (maxExperience - minExperience) / (avgExperience + 1) : 1;

    // Generate recommendations
    const recommendedAdditions: InstrumentRecommendation[] = missingInstruments.map(instrument => ({
      instrument,
      priority: this.getInstrumentPriority(instrument, uniqueInstruments),
      reason: this.getInstrumentReason(instrument, uniqueInstruments)
    }));

    return {
      currentInstruments: uniqueInstruments,
      missingInstruments,
      experienceBalance,
      recommendedAdditions
    };
  }

  private getInstrumentPriority(instrument: string, currentInstruments: string[]): 'high' | 'medium' | 'low' {
    // Core rhythm section instruments get high priority
    if (['bass', 'drums'].includes(instrument)) {
      return 'high';
    }
    
    // Lead instruments get medium priority
    if (['guitar', 'vocals'].includes(instrument)) {
      return 'medium';
    }
    
    return 'low';
  }

  private getInstrumentReason(instrument: string, currentInstruments: string[]): string {
    switch (instrument) {
      case 'bass':
        return 'A bass player is essential for the rhythm section and gives your band a full sound';
      case 'drums':
        return 'A drummer provides the backbone of your rhythm section and keeps the band tight';
      case 'guitar':
        return 'A guitar player adds harmonic richness and can provide lead or rhythm parts';
      case 'vocals':
        return 'A dedicated vocalist allows other musicians to focus on their instruments';
      default:
        return `Adding ${instrument} would enhance your band\'s musical versatility`;
    }
  }
}

export const bandMemberService = new BandMemberService();