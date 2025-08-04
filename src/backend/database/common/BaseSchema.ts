import type { FieldDefinitions } from '../validator/validator.js';
import { validators } from '../validator/validation_types.js';
import { DB_FIELDS } from './constants.js';

/**
 * Base field definitions that every entity should have
 */
export const BASE_FIELDS: FieldDefinitions = {
  [DB_FIELDS.ID]: {
    type: 'number',
    indexed: true,
    autoIncrement: true,
    primaryKey: true,
  },
  [DB_FIELDS.CREATED_AT]: {
    type: 'Date',
    indexed: true,
    required: false,
    validate: validators.date(DB_FIELDS.CREATED_AT),
  },
  [DB_FIELDS.UPDATED_AT]: {
    type: 'Date',
    indexed: true,
    required: false,
    validate: validators.date(DB_FIELDS.UPDATED_AT),
  },
};

/**
 * Utility function to create field definitions with base fields included
 * @param customFields - Custom field definitions specific to the entity
 * @returns Complete field definitions including base fields
 */
export function createFieldDefinitions(customFields: FieldDefinitions): FieldDefinitions {
  return {
    ...BASE_FIELDS,
    ...customFields,
  };
}
