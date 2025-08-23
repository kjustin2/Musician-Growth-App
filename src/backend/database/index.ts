/**
 * Database layer exports
 */

// Core database and services
export { EntityService, db, itemService, userService } from './db.js';

// Types
export type {
  BaseEntity,
  CreateEntity,
  CreateItem,
  CreateUser,
  Item,
  UpdateEntity,
  UpdateItem,
  UpdateUser,
  User,
} from './types.js';

// Reactive stores
export { items, users } from './db.js';

// Validation
export {
  ValidationError,
  createValidator,
  validateItem,
  validateUser,
  validators,
} from './validation.js';
