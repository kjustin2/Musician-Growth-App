import * as BaseSchema from '../../common/BaseSchema.js';
import type { ExtractFieldsFromDefinitions } from '../../common/fieldConverter.js';
import type { IBaseEntity } from '../../common/types.js';
import { validators } from '../../validator/validation_types.js';

/**
 * Single source of truth for User field definitions
 * Base fields (id, createdAt, updatedAt) are automatically included
 */
export const UserFields = BaseSchema.createFieldDefinitions({
    email: {
        type: 'string',
        indexed: true,
        required: true,
        validate: validators.email('Email'),
    },
    passwordHash: {
        type: 'string',
        required: true,
        validate: validators.nonEmptyString('Password Hash'),
    },
} as const);

/**
 * User type definition - automatically generated from field definitions
 */
export type User = IBaseEntity & ExtractFieldsFromDefinitions<typeof UserFields>;