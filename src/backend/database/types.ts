/**
 * Database entity types
 */

export interface BaseEntity {
  id?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface User extends BaseEntity {
  email: string;
  passwordHash: string;
}

export interface Item extends BaseEntity {
  name: string;
  description?: string;
}

// Creation types (omit auto-generated fields)
export type CreateUser = Omit<User, 'id' | 'createdAt' | 'updatedAt'>;
export type CreateItem = Omit<Item, 'id' | 'createdAt' | 'updatedAt'>;

// Update types (omit id and createdAt)
export type UpdateUser = Partial<Omit<User, 'id' | 'createdAt'>>;
export type UpdateItem = Partial<Omit<Item, 'id' | 'createdAt'>>;

// Generic types for extensibility
export type CreateEntity<T extends BaseEntity> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateEntity<T extends BaseEntity> = Partial<Omit<T, 'id' | 'createdAt'>>;
