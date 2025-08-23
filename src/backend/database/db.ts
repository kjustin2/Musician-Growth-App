import Dexie, { type Table } from 'dexie';
import { type Item, ItemFields } from './types/item/itemSchema.js';
import { type User, UserFields } from './types/user/userSchema.js';
import * as validator from './validator/validator.js';

/**
 * Typed database class
 */
export class AppDatabase extends Dexie {
  items!: Table<Item>;
  users!: Table<User>;

  constructor() {
    super('ChordLineDatabase');

    // Define schemas using field definitions directly
    this.version(1).stores({
      items: validator.generateDexieSchema(ItemFields),
      users: validator.generateDexieSchema(UserFields),
    });
  }
}

// Create database instance
export const db = new AppDatabase();
