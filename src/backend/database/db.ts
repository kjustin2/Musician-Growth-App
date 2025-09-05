import Dexie, { type Table } from 'dexie';
import { writable, type Writable } from 'svelte/store';
import { debugLog, errorLog } from '../logger.js';
import type {
  Band,
  BandMembership,
  CreateBand,
  CreateBandMembership,
  CreateGig,
  CreateGoal,
  CreateItem,
  CreatePractice,
  CreateSetList,
  CreateSong,
  CreateUser,
  CreateVenue,
  Gig,
  Goal,
  Item,
  Practice,
  SetList,
  Song,
  UpdateBand,
  UpdateBandMembership,
  UpdateGig,
  UpdateGoal,
  UpdateItem,
  UpdatePractice,
  UpdateSetList,
  UpdateSong,
  UpdateUser,
  UpdateVenue,
  User,
  Venue,
} from './types';
import {
  validateBand,
  validateBandMembership,
  validateGig,
  validateGoal,
  validateItem,
  validatePractice,
  validateSetList,
  validateSong,
  validateUser,
  validateVenue,
} from './validation';

/**
 * Database class
 */
class AppDatabase extends Dexie {
  users!: Table<User>;
  items!: Table<Item>;
  bands!: Table<Band>;
  bandMemberships!: Table<BandMembership>;
  venues!: Table<Venue>;
  songs!: Table<Song>;
  setLists!: Table<SetList>;
  gigs!: Table<Gig>;
  practices!: Table<Practice>;
  goals!: Table<Goal>;

  constructor() {
    super('ChordLineDatabase');

    this.version(3).stores({
      users: '++id, email, createdAt, onboardingCompleted',
      items: '++id, name, description, createdAt',
      bands: '++id, userId, name, createdAt',
      bandMemberships: '++id, userId, bandId, createdAt',
      venues: '++id, name, city, createdAt',
      songs: '++id, title, userId, bandId, status, createdAt',
      setLists: '++id, name, userId, bandId, createdAt',
      gigs: '++id, title, userId, bandId, date, status, createdAt',
      practices: '++id, userId, bandId, date, createdAt',
      goals: '++id, title, userId, bandId, type, completed, createdAt',
    });
  }
}

export const db = new AppDatabase();

/**
 * Generic entity service with reactive store - extensible base class
 */
export abstract class EntityService<
  T extends { id?: number; createdAt: Date; updatedAt: Date },
  TCreate,
  TUpdate,
> {
  public readonly store: Writable<T[]>;

  constructor(
    protected table: Table<T>,
    protected entityName: string,
    protected validator: (data: Record<string, unknown>) => void
  ) {
    this.store = writable<T[]>([]);
    void this.load(); // Initial load
  }

  private addTimestamps<TData extends Record<string, unknown>>(
    data: TData,
    isUpdate = false
  ): TData & { createdAt?: Date; updatedAt: Date } {
    const now = new Date();
    return {
      ...data,
      ...(isUpdate ? {} : { createdAt: now }),
      updatedAt: now,
    };
  }

  private trimStrings(data: Record<string, unknown>): void {
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string') {
        data[key] = value.trim();
      }
    }
  }

  async load(): Promise<T[]> {
    try {
      const entities = await this.table.orderBy('createdAt').reverse().toArray();
      this.store.set(entities);
      debugLog(`${this.entityName}Service`, 'Loaded entities', { count: entities.length });
      return entities;
    } catch (error) {
      errorLog(`${this.entityName}Service`, 'Failed to load entities', error);
      throw error;
    }
  }

  async add(data: TCreate): Promise<number> {
    try {
      const entityData = this.addTimestamps(data as Record<string, unknown>);
      this.trimStrings(entityData);
      this.validator(entityData);

      const id = await this.table.add(entityData as T);
      await this.load(); // Reload to update store

      debugLog(`${this.entityName}Service`, 'Added entity', { id });
      return Number(id);
    } catch (error) {
      errorLog(`${this.entityName}Service`, 'Failed to add entity', error);
      throw error;
    }
  }

  async update(id: number, changes: TUpdate): Promise<void> {
    try {
      const updateData = this.addTimestamps(changes as Record<string, unknown>, true);
      this.trimStrings(updateData);
      this.validator({ ...updateData, id }); // Validate with id for context

      await this.table.update(id, updateData);
      await this.load(); // Reload to update store

      debugLog(`${this.entityName}Service`, 'Updated entity', { id });
    } catch (error) {
      errorLog(`${this.entityName}Service`, 'Failed to update entity', error, { id });
      throw error;
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await this.table.delete(id);
      await this.load(); // Reload to update store

      debugLog(`${this.entityName}Service`, 'Deleted entity', { id });
    } catch (error) {
      errorLog(`${this.entityName}Service`, 'Failed to delete entity', error, { id });
      throw error;
    }
  }

  async bulkAdd(dataArray: TCreate[]): Promise<number[]> {
    try {
      const entities = dataArray.map(data => {
        const entityData = this.addTimestamps(data as Record<string, unknown>);
        this.trimStrings(entityData);
        this.validator(entityData);
        return entityData as T;
      });

      const ids = await this.table.bulkAdd(entities, { allKeys: true });
      await this.load(); // Reload to update store

      debugLog(`${this.entityName}Service`, 'Bulk added entities', { count: ids.length });
      return ids.map(id => Number(id));
    } catch (error) {
      errorLog(`${this.entityName}Service`, 'Failed to bulk add entities', error);
      throw error;
    }
  }

  async bulkDelete(ids: number[]): Promise<void> {
    try {
      await this.table.bulkDelete(ids);
      await this.load(); // Reload to update store

      debugLog(`${this.entityName}Service`, 'Bulk deleted entities', { count: ids.length });
    } catch (error) {
      errorLog(`${this.entityName}Service`, 'Failed to bulk delete entities', error);
      throw error;
    }
  }

  async get(id: number): Promise<T | undefined> {
    return this.table.get(id);
  }

  async getAll(): Promise<T[]> {
    return this.table.toArray();
  }

  async count(): Promise<number> {
    return this.table.count();
  }

  async exists(id: number): Promise<boolean> {
    const entity = await this.table.get(id);
    return entity !== undefined;
  }
}

/**
 * User service with specific methods
 */
export class UserService extends EntityService<User, CreateUser, UpdateUser> {
  constructor() {
    super(db.users, 'User', validateUser);
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return db.users.where('email').equals(email.toLowerCase()).first();
  }

  async emailExists(email: string): Promise<boolean> {
    const count = await db.users.where('email').equals(email.toLowerCase()).count();
    return count > 0;
  }

  // Override add to handle email normalization and set default onboarding status
  override async add(data: CreateUser): Promise<number> {
    const normalizedData = {
      ...data,
      email: data.email.toLowerCase(),
      onboardingCompleted: false,
      primaryInstrument: null,
      playFrequency: null,
      genres: [],
    };
    return super.add(normalizedData);
  }

  async updateOnboarding(
    id: number,
    onboardingData: {
      primaryInstrument: string;
      playFrequency: 'daily' | 'several-times-week' | 'weekly' | 'monthly' | 'occasionally';
      genres: string[];
    }
  ): Promise<void> {
    await this.update(id, {
      ...onboardingData,
      onboardingCompleted: true,
    });
  }
}

/**
 * Item service
 */
export class ItemService extends EntityService<Item, CreateItem, UpdateItem> {
  constructor() {
    super(db.items, 'Item', validateItem);
  }

  async findByName(name: string): Promise<Item[]> {
    return db.items.where('name').startsWithIgnoreCase(name).toArray();
  }
}

/**
 * Band service
 */
export class BandService extends EntityService<Band, CreateBand, UpdateBand> {
  constructor() {
    super(db.bands, 'Band', validateBand);
  }

  async findByUserId(userId: number): Promise<Band[]> {
    return db.bands.where('userId').equals(userId).toArray();
  }

  async findByName(name: string): Promise<Band[]> {
    return db.bands.where('name').startsWithIgnoreCase(name).toArray();
  }
}

/**
 * Band membership service
 */
export class BandMembershipService extends EntityService<
  BandMembership,
  CreateBandMembership,
  UpdateBandMembership
> {
  constructor() {
    super(db.bandMemberships, 'BandMembership', validateBandMembership);
  }

  async findByUserId(userId: number): Promise<BandMembership[]> {
    return db.bandMemberships.where('userId').equals(userId).toArray();
  }

  async findByBandId(bandId: number): Promise<BandMembership[]> {
    return db.bandMemberships.where('bandId').equals(bandId).toArray();
  }

  async getUserBands(userId: number): Promise<Array<Band & { role: string; instrument: string }>> {
    const memberships = await this.findByUserId(userId);
    const bands: Array<Band & { role: string; instrument: string }> = [];

    for (const membership of memberships) {
      const band = await db.bands.get(membership.bandId);
      if (band) {
        bands.push({
          ...band,
          role: membership.role,
          instrument: membership.instrument,
        });
      }
    }

    return bands;
  }
}

/**
 * Venue service
 */
export class VenueService extends EntityService<Venue, CreateVenue, UpdateVenue> {
  constructor() {
    super(db.venues, 'Venue', validateVenue);
  }

  async findByName(name: string): Promise<Venue[]> {
    return db.venues.where('name').startsWithIgnoreCase(name).toArray();
  }

  async findByCity(city: string): Promise<Venue[]> {
    return db.venues.where('city').startsWithIgnoreCase(city).toArray();
  }
}

/**
 * Song service
 */
export class SongService extends EntityService<Song, CreateSong, UpdateSong> {
  constructor() {
    super(db.songs, 'Song', validateSong);
  }

  async findByUserId(userId: number): Promise<Song[]> {
    return db.songs.where('userId').equals(userId).toArray();
  }

  async findByBandId(bandId: number): Promise<Song[]> {
    return db.songs.where('bandId').equals(bandId).toArray();
  }

  async findByTitle(title: string): Promise<Song[]> {
    return db.songs.where('title').startsWithIgnoreCase(title).toArray();
  }

  async findByStatus(status: 'learning' | 'ready' | 'mastered'): Promise<Song[]> {
    return db.songs.where('status').equals(status).toArray();
  }

  async findByUserAndBand(userId: number, bandId?: number): Promise<Song[]> {
    if (bandId) {
      return db.songs.where('[userId+bandId]').equals([userId, bandId]).toArray();
    }
    return db.songs
      .where('userId')
      .equals(userId)
      .and(song => !song.bandId)
      .toArray();
  }
}

/**
 * SetList service
 */
export class SetListService extends EntityService<SetList, CreateSetList, UpdateSetList> {
  constructor() {
    super(db.setLists, 'SetList', validateSetList);
  }

  async findByUserId(userId: number): Promise<SetList[]> {
    return db.setLists.where('userId').equals(userId).toArray();
  }

  async findByBandId(bandId: number): Promise<SetList[]> {
    return db.setLists.where('bandId').equals(bandId).toArray();
  }

  async findByUserAndBand(userId: number, bandId?: number): Promise<SetList[]> {
    if (bandId) {
      return db.setLists.where('[userId+bandId]').equals([userId, bandId]).toArray();
    }
    return db.setLists
      .where('userId')
      .equals(userId)
      .and(setList => !setList.bandId)
      .toArray();
  }

  async getSetListWithSongs(
    setListId: number
  ): Promise<(SetList & { songDetails: Song[] }) | undefined> {
    const setList = await db.setLists.get(setListId);
    if (!setList) {
      return undefined;
    }

    const songDetails: Song[] = [];
    for (const setListSong of setList.songs.sort((a, b) => a.order - b.order)) {
      const song = await db.songs.get(setListSong.songId);
      if (song) {
        songDetails.push(song);
      }
    }

    return { ...setList, songDetails };
  }
}

/**
 * Gig service
 */
export class GigService extends EntityService<Gig, CreateGig, UpdateGig> {
  constructor() {
    super(db.gigs, 'Gig', validateGig);
  }

  async findByUserId(userId: number): Promise<Gig[]> {
    const gigs = await db.gigs.where('userId').equals(userId).toArray();
    return gigs.sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  async findByBandId(bandId: number): Promise<Gig[]> {
    const gigs = await db.gigs.where('bandId').equals(bandId).toArray();
    return gigs.sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  async findByUserAndBand(userId: number, bandId?: number): Promise<Gig[]> {
    let gigs: Gig[];
    if (bandId) {
      gigs = await db.gigs.where('[userId+bandId]').equals([userId, bandId]).toArray();
    } else {
      gigs = await db.gigs.where('userId').equals(userId).and(gig => !gig.bandId).toArray();
    }
    return gigs.sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  async findUpcoming(userId: number, bandId?: number): Promise<Gig[]> {
    const now = new Date();
    const gigs = await this.findByUserAndBand(userId, bandId);
    return gigs.filter(gig => gig.date > now && gig.status === 'scheduled');
  }

  async findCompleted(userId: number, bandId?: number): Promise<Gig[]> {
    const gigs = await this.findByUserAndBand(userId, bandId);
    return gigs.filter(gig => gig.status === 'completed');
  }

  async getTotalEarnings(userId: number, bandId?: number): Promise<number> {
    const completedGigs = await this.findCompleted(userId, bandId);
    return completedGigs.reduce((total, gig) => total + (gig.earnings || 0), 0);
  }
}

/**
 * Practice service
 */
export class PracticeService extends EntityService<Practice, CreatePractice, UpdatePractice> {
  constructor() {
    super(db.practices, 'Practice', validatePractice);
  }

  async findByUserId(userId: number): Promise<Practice[]> {
    const practices = await db.practices.where('userId').equals(userId).toArray();
    return practices.sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  async findByBandId(bandId: number): Promise<Practice[]> {
    const practices = await db.practices.where('bandId').equals(bandId).toArray();
    return practices.sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  async findByUserAndBand(userId: number, bandId?: number): Promise<Practice[]> {
    let practices: Practice[];
    if (bandId) {
      practices = await db.practices.where('[userId+bandId]').equals([userId, bandId]).toArray();
    } else {
      practices = await db.practices.where('userId').equals(userId).and(practice => !practice.bandId).toArray();
    }
    return practices.sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  async getTotalPracticeTime(userId: number, bandId?: number): Promise<number> {
    const practices = await this.findByUserAndBand(userId, bandId);
    return practices.reduce((total, practice) => total + practice.duration, 0);
  }

  async getPracticeStreak(userId: number, bandId?: number): Promise<number> {
    const practices = await this.findByUserAndBand(userId, bandId);
    if (practices.length === 0) {
      return 0;
    }

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < practices.length; i++) {
      const practiceDate = new Date(practices[i]!.date);
      practiceDate.setHours(0, 0, 0, 0);

      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);

      if (practiceDate.getTime() === expectedDate.getTime()) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }
}

/**
 * Goal service
 */
export class GoalService extends EntityService<Goal, CreateGoal, UpdateGoal> {
  constructor() {
    super(db.goals, 'Goal', validateGoal);
  }

  async findByUserId(userId: number): Promise<Goal[]> {
    const goals = await db.goals.where('userId').equals(userId).toArray();
    return goals.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async findByBandId(bandId: number): Promise<Goal[]> {
    const goals = await db.goals.where('bandId').equals(bandId).toArray();
    return goals.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async findByUserAndBand(userId: number, bandId?: number): Promise<Goal[]> {
    let goals: Goal[];
    if (bandId) {
      goals = await db.goals.where('[userId+bandId]').equals([userId, bandId]).toArray();
    } else {
      goals = await db.goals.where('userId').equals(userId).and(goal => !goal.bandId).toArray();
    }
    return goals.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async findActive(userId: number, bandId?: number): Promise<Goal[]> {
    const goals = await this.findByUserAndBand(userId, bandId);
    return goals.filter(goal => !goal.completed);
  }

  async findCompleted(userId: number, bandId?: number): Promise<Goal[]> {
    const goals = await this.findByUserAndBand(userId, bandId);
    return goals.filter(goal => goal.completed);
  }

  async completeGoal(goalId: number): Promise<void> {
    await this.update(goalId, {
      completed: true,
      completedAt: new Date(),
    });
  }
}

// Export service instances
export const userService = new UserService();
export const itemService = new ItemService();
export const bandService = new BandService();
export const bandMembershipService = new BandMembershipService();
export const venueService = new VenueService();
export const songService = new SongService();
export const setListService = new SetListService();
export const gigService = new GigService();
export const practiceService = new PracticeService();
export const goalService = new GoalService();

// Export stores for reactive UI
export const users = userService.store;
export const items = itemService.store;
export const bands = bandService.store;
export const bandMemberships = bandMembershipService.store;
export const venues = venueService.store;
export const songs = songService.store;
export const setLists = setListService.store;
export const gigs = gigService.store;
export const practices = practiceService.store;
export const goals = goalService.store;
