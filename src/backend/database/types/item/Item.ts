import { BaseEntity } from '../../common/BaseEntity.js';
import { db } from '../../db.js';
import { type Item, ItemFields } from './itemSchema.js';

/**
 * Item entity class with specific business logic
 */
export class ItemEntity extends BaseEntity<Item> {
  private static _instance: ItemEntity | null = null;

  constructor() {
    super('Item', ItemFields, db.items);
  }

  static getInstance(): ItemEntity {
    this._instance ??= new ItemEntity();
    return this._instance;
  }
}

// Export getter and store using BaseEntity helper methods
export const getItemEntity = BaseEntity.createGetter(ItemEntity);
export const items = BaseEntity.createStore(ItemEntity);
