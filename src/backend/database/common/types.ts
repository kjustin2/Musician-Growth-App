import { DB_FIELDS } from './constants.js';

/**
 * Base entity interface that all database entities must implement
 */
export interface IBaseEntity {
  [DB_FIELDS.ID]?: number;
  [DB_FIELDS.CREATED_AT]: Date;
  [DB_FIELDS.UPDATED_AT]: Date;
}

/**
 * Bulk update operation interface
 */
export interface BulkUpdateOperation<T> {
  id: number;
  changes: Partial<T>;
}

/**
 * Entity creation data (without id, createdAt, updatedAt)
 */
export type EntityCreationData<T extends IBaseEntity> = Omit<
  T,
  typeof DB_FIELDS.ID | typeof DB_FIELDS.CREATED_AT | typeof DB_FIELDS.UPDATED_AT
>;

/**
 * Entity update data (without id, createdAt)
 */
export type EntityUpdateData<T extends IBaseEntity> = Partial<
  Omit<T, typeof DB_FIELDS.ID | typeof DB_FIELDS.CREATED_AT>
>;
