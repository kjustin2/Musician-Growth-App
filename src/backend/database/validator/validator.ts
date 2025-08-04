import type { ValidationFunction, ValidationSchema } from './validation_types.js';

/**
 * Field definition interface
 */
export interface FieldDefinition {
  type: 'string' | 'number' | 'Date' | 'boolean';
  indexed?: boolean;
  autoIncrement?: boolean;
  primaryKey?: boolean;
  required?: boolean;
  validate?: ValidationFunction;
}

/**
 * Field definitions type
 */
export type FieldDefinitions = Record<string, FieldDefinition>;

/**
 * Generate Dexie schema string from field definitions
 */
export const generateDexieSchema = (fieldDefinitions: FieldDefinitions): string => {
  const fields: string[] = [];

  for (const [fieldName, fieldDef] of Object.entries(fieldDefinitions)) {
    if (fieldDef.primaryKey && fieldDef.autoIncrement) {
      fields.push(`++${fieldName}`);
    } else if (fieldDef.indexed) {
      fields.push(fieldName);
    }
  }

  return fields.join(', ');
};

/**
 * Generate validation schema from field definitions
 */
export const generateValidationSchema = (fieldDefinitions: FieldDefinitions): ValidationSchema => {
  return Object.fromEntries(
    Object.entries(fieldDefinitions)
      .filter(([_, fieldDef]) => fieldDef.validate)
      .map(([fieldName, fieldDef]) => {
        if (!fieldDef.validate) {
          throw new Error(`Field ${fieldName} is missing validation function`);
        }
        return [fieldName, { validate: fieldDef.validate }];
      })
  );
};

/**
 * Generic validator that works with any schema
 */
const validate = (data: Record<string, unknown>, schema: ValidationSchema): string[] => {
  const errors: string[] = [];

  // Check each field in the schema
  for (const [fieldName, fieldRules] of Object.entries(schema)) {
    const value = data[fieldName];

    // Run the field's validation function
    const error = fieldRules.validate(value);
    if (error) {
      errors.push(error);
    }
  }

  return errors;
};

/**
 * Validates data and throws an error if validation fails
 */
export const validateOrThrow = (
  data: Record<string, unknown>,
  schema: ValidationSchema,
  typeName: string = 'Object'
): void => {
  const errors = validate(data, schema);
  if (errors.length > 0) {
    throw new Error(`${typeName} validation failed: ${errors.join(', ')}`);
  }
};
