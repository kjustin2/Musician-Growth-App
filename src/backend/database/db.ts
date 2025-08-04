import Dexie, { type Table } from 'dexie';
import { type Item, ItemFields } from './types/item/itemSchema.js';
import * as validator from './validator/validator.js';

/**
 * Typed database class
 */
export class AppDatabase extends Dexie {
  items!: Table<Item>;

  constructor() {
    super('AppDatabase');

    // Define schemas using field definitions directly
    this.version(1).stores({
      items: validator.generateDexieSchema(ItemFields),
    });
  }
}

// Create database instance
export const db = new AppDatabase();
