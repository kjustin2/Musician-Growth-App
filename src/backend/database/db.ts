import Dexie, { type Table } from 'dexie';
import { writable, type Writable } from 'svelte/store';
import { debugLog, errorLog } from '../logger.js';
import type { CreateItem, CreateUser, Item, UpdateItem, UpdateUser, User } from './types';
import { validateItem, validateUser } from './validation';

/**
 * Database class
 */
class AppDatabase extends Dexie {
  users!: Table<User>;
  items!: Table<Item>;

  constructor() {
    super('ChordLineDatabase');

    this.version(1).stores({
      users: '++id, email, createdAt',
      items: '++id, name, description, createdAt',
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

  // Override add to handle email normalization
  override async add(data: CreateUser): Promise<number> {
    const normalizedData = {
      ...data,
      email: data.email.toLowerCase(),
    };
    return super.add(normalizedData);
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

// Export service instances
export const userService = new UserService();
export const itemService = new ItemService();

// Export stores for reactive UI
export const users = userService.store;
export const items = itemService.store;
