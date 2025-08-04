import { validators } from '../../validator/validation_types.js';
import type { IBaseEntity } from '../../common/types.js';
import * as BaseSchema from '../../common/BaseSchema.js';
import type { ExtractFieldsFromDefinitions } from '../../common/fieldConverter.js';

/**
 * Single source of truth for Item field definitions
 * Base fields (id, createdAt, updatedAt) are automatically included
 */
export const ItemFields = BaseSchema.createFieldDefinitions({
  name: {
    type: 'string',
    indexed: true,
    required: true,
    validate: validators.nonEmptyString('Name'),
  },
  description: {
    type: 'string',
    indexed: true,
    required: false,
    validate: validators.string('Description'),
  },
} as const);

/**
 * Item type definition - automatically generated from field definitions
 */
export type Item = IBaseEntity & ExtractFieldsFromDefinitions<typeof ItemFields>;
