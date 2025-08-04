import type { Table } from 'dexie';
import { writable, type Writable } from 'svelte/store';
import type { ValidationSchema } from '../validator/validation_types.js';
import type { FieldDefinitions } from '../validator/validator.js';
import * as validator from '../validator/validator.js';
import { BaseOperations } from './BaseOperations.js';
import { DB_FIELDS } from './constants.js';
import type {
  BulkUpdateOperation,
  EntityCreationData,
  EntityUpdateData,
  IBaseEntity,
} from './types.js';

/**
 * Base entity class that provides common CRUD operations and validation
 *
 * Inherits the following methods from BaseOperations:
 * @method load() - Load all entities from database
 *
 * Overrides the following methods with validation and automatic reload:
 * @method add(entityData) - Add new entity with validation and reload
 * @method update(id, changes) - Update entity with validation and reload
 * @method delete(id) - Delete entity from database and reload
 * @method bulkAdd(entitiesData) - Add multiple entities with validation and reload
 * @method bulkUpdate(updates) - Update multiple entities with validation and reload
 * @method bulkDelete(ids) - Delete multiple entities from database and reload
 */
export class BaseEntity<T extends IBaseEntity> extends BaseOperations<T> {
  public readonly store: Writable<T[]>;
  protected fieldDefinitions: FieldDefinitions;
  protected validationSchema: ValidationSchema;

  constructor(entityName: string, fieldDefinitions: FieldDefinitions, table: Table<T>) {
    const tableName = `${entityName.toLowerCase()}s`; // pluralize for table name

    // Call parent constructor
    super(entityName, tableName, table);

    this.store = writable<T[]>([]);
    this.fieldDefinitions = fieldDefinitions;

    this.validationSchema = validator.generateValidationSchema(fieldDefinitions);
  }

  /**
   * Creates a new entity with validation
   */
  createEntity(data: EntityCreationData<T>): T {
    const now = new Date();
    const entity = {
      ...data,
      [DB_FIELDS.CREATED_AT]: now,
      [DB_FIELDS.UPDATED_AT]: now,
    } as T;

    // Trim string fields
    for (const [fieldName, fieldDef] of Object.entries(this.fieldDefinitions)) {
      if (fieldDef.type === 'string' && typeof entity[fieldName as keyof T] === 'string') {
        (entity as Record<string, unknown>)[fieldName] = (
          entity[fieldName as keyof T] as string
        ).trim();
      }
    }

    // Validate using the schema
    validator.validateOrThrow(
      entity as Record<string, unknown>,
      this.validationSchema,
      this.entityName
    );

    return entity;
  }

  /**
   * Creates an entity update object with validation
   */
  createEntityUpdate(changes: EntityUpdateData<T>): Partial<T> {
    const updateData = {
      ...changes,
      [DB_FIELDS.UPDATED_AT]: new Date(),
    } as Partial<T>;

    // Trim string fields if they exist
    for (const [fieldName, fieldDef] of Object.entries(this.fieldDefinitions)) {
      if (fieldDef.type === 'string' && typeof updateData[fieldName as keyof T] === 'string') {
        (updateData as Record<string, unknown>)[fieldName] = (
          updateData[fieldName as keyof T] as string
        ).trim();
      }
    }

    // Validate using the schema
    validator.validateOrThrow(
      updateData as Record<string, unknown>,
      this.validationSchema,
      `${this.entityName} update`
    );

    return updateData;
  }

  /**
   * Add new entity to database with validation
   */
  override async add(entityData: EntityCreationData<T>): Promise<number> {
    const entityToAdd = this.createEntity(entityData);
    const id = await super.add(entityToAdd);
    await this.reloadAfterOperation();
    return id;
  }

  /**
   * Update existing entity in database with validation
   */
  override async update(id: number, changes: EntityUpdateData<T>): Promise<void> {
    const updateData = this.createEntityUpdate(changes);
    await super.update(id, updateData);
    await this.reloadAfterOperation();
  }

  /**
   * Add multiple entities to database with validation
   */
  override async bulkAdd(entitiesData: EntityCreationData<T>[]): Promise<number[]> {
    const entitiesToAdd = entitiesData.map(data => this.createEntity(data));
    const ids = await super.bulkAdd(entitiesToAdd);
    await this.reloadAfterOperation();
    return ids;
  }

  /**
   * Update multiple entities in database with validation
   */
  override async bulkUpdate(
    updates: Array<{ id: number; changes: EntityUpdateData<T> }>
  ): Promise<void> {
    const validatedUpdates: BulkUpdateOperation<T>[] = updates.map(({ id, changes }) => ({
      id,
      changes: this.createEntityUpdate(changes),
    }));
    await super.bulkUpdate(validatedUpdates);
    await this.reloadAfterOperation();
  }

  /**
   * Delete entity from database and reload
   */
  override async delete(id: number): Promise<void> {
    await super.delete(id);
    await this.reloadAfterOperation();
  }

  /**
   * Delete multiple entities from database and reload
   */
  override async bulkDelete(ids: number[]): Promise<void> {
    await super.bulkDelete(ids);
    await this.reloadAfterOperation();
  }

  /**
   * Load all entities and update the reactive store
   */
  override async load(): Promise<T[]> {
    const entities = await super.load();
    this.store.set(entities);
    return entities;
  }

  /**
   * Reload data after operations to update the reactive store
   */
  protected async reloadAfterOperation(): Promise<void> {
    await this.load();
  }

  /**
   * Creates a getter function for the singleton instance
   * Usage: export const getItemEntity = BaseEntity.createGetter(ItemEntity);
   */
  static createGetter<TEntity extends BaseEntity<T>, T extends IBaseEntity>(EntityClass: {
    getInstance(): TEntity;
  }): () => TEntity {
    return () => EntityClass.getInstance();
  }

  /**
   * Creates a reactive store for the entity
   * Usage: export const items = BaseEntity.createStore(ItemEntity);
   */
  static createStore<TEntity extends BaseEntity<T>, T extends IBaseEntity>(EntityClass: {
    getInstance(): TEntity;
  }): Writable<T[]> {
    const entity = EntityClass.getInstance();
    return entity.store;
  }
}
