/**
 * Database field name constants
 * Centralized field names to make it easy to update them later
 */
export const DB_FIELDS = {
  ID: 'id',
  CREATED_AT: 'createdAt',
  UPDATED_AT: 'updatedAt',
} as const;

export type DbFieldNames = (typeof DB_FIELDS)[keyof typeof DB_FIELDS];
