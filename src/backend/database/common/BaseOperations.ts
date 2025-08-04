import type { Table } from 'dexie';
import * as logger from '../../logger.js';
import { DB_FIELDS } from './constants.js';
import type { BulkUpdateOperation, IBaseEntity } from './types.js';

/**
 * Handles base operations for database entities with strict typing
 */
export class BaseOperations<T extends IBaseEntity> {
  protected static readonly ID_FIELD = DB_FIELDS.ID;
  protected static readonly CREATED_AT_FIELD = DB_FIELDS.CREATED_AT;
  protected static readonly UPDATED_AT_FIELD = DB_FIELDS.UPDATED_AT;

  protected entityName: string;
  protected tableName: string;
  protected table: Table<T>;

  constructor(entityName: string, tableName: string, table: Table<T>) {
    this.entityName = entityName;
    this.tableName = tableName;
    this.table = table;
  }

  /**
   * Load all entities from database
   */
  async load(): Promise<T[]> {
    logger.debugLog(`${this.entityName}Store`, `Loading ${this.tableName} from database...`);

    try {
      const allEntities = await this.table
        .orderBy(BaseOperations.CREATED_AT_FIELD)
        .reverse()
        .toArray();

      logger.debugLog(`${this.entityName}Store`, 'Load completed', {
        count: allEntities.length,
        entities: allEntities.map(entity => ({
          id: entity[BaseOperations.ID_FIELD],
          name: 'name' in entity ? (entity as { name: string }).name : 'No name',
        })),
      });

      return allEntities;
    } catch (error) {
      logger.errorLog(`${this.entityName}Store`, `Failed to load ${this.tableName}`, error);
      throw error;
    }
  }

  /**
   * Add new entity to database
   */
  async add(entityToAdd: T): Promise<number> {
    logger.debugLog(
      `${this.entityName}Store`,
      `Adding ${this.entityName.toLowerCase()}`,
      entityToAdd
    );

    try {
      const id = await this.table.add(entityToAdd);

      logger.debugLog(`${this.entityName}Store`, `${this.entityName} added successfully`, {
        id,
        entity: entityToAdd,
      });

      return Number(id);
    } catch (error) {
      logger.errorLog(
        `${this.entityName}Store`,
        `Failed to add ${this.entityName.toLowerCase()}`,
        error,
        { entityToAdd }
      );
      throw error;
    }
  }

  /**
   * Update existing entity in database
   */
  async update(id: number, updateData: Partial<T>): Promise<void> {
    logger.debugLog(`${this.entityName}Store`, `Updating ${this.entityName.toLowerCase()}`, {
      id,
      changes: updateData,
    });

    try {
      await this.table.update(id, updateData);

      logger.debugLog(`${this.entityName}Store`, `${this.entityName} updated successfully`, {
        id,
        updatedFields: Object.keys(updateData),
      });
    } catch (error) {
      logger.errorLog(
        `${this.entityName}Store`,
        `Failed to update ${this.entityName.toLowerCase()}`,
        error,
        { id, updateData }
      );
      throw error;
    }
  }

  /**
   * Delete entity from database
   */
  async delete(id: number): Promise<void> {
    logger.debugLog(`${this.entityName}Store`, `Deleting ${this.entityName.toLowerCase()}`, { id });

    try {
      await this.table.delete(id);

      logger.debugLog(`${this.entityName}Store`, `${this.entityName} deleted successfully`, { id });
    } catch (error) {
      logger.errorLog(
        `${this.entityName}Store`,
        `Failed to delete ${this.entityName.toLowerCase()}`,
        error,
        { id }
      );
      throw error;
    }
  }

  /**
   * Add multiple entities to database in a single transaction
   */
  async bulkAdd(entitiesToAdd: T[]): Promise<number[]> {
    logger.debugLog(
      `${this.entityName}Store`,
      `Bulk adding ${entitiesToAdd.length} ${this.tableName}`,
      {
        count: entitiesToAdd.length,
      }
    );

    try {
      const ids = await this.table.bulkAdd(entitiesToAdd, { allKeys: true });

      logger.debugLog(`${this.entityName}Store`, `Bulk add completed successfully`, {
        count: ids.length,
        ids,
      });

      return ids.map(id => Number(id));
    } catch (error) {
      logger.errorLog(`${this.entityName}Store`, `Failed to bulk add ${this.tableName}`, error, {
        count: entitiesToAdd.length,
      });
      throw error;
    }
  }

  /**
   * Update multiple entities in database in a single transaction
   */
  async bulkUpdate(updates: BulkUpdateOperation<T>[]): Promise<void> {
    logger.debugLog(
      `${this.entityName}Store`,
      `Bulk updating ${updates.length} ${this.tableName}`,
      {
        count: updates.length,
        ids: updates.map(u => u.id),
      }
    );

    try {
      // Use bulkPut for better performance - need to merge existing data with changes
      const existingEntities = await this.table.bulkGet(updates.map(u => u.id));
      const updatedEntities = updates.map((update, index) => {
        const existing = existingEntities[index];
        if (!existing) {
          throw new Error(`Entity with id ${update.id} not found`);
        }
        return { ...existing, ...update.changes };
      });

      await this.table.bulkPut(updatedEntities);

      logger.debugLog(`${this.entityName}Store`, `Bulk update completed successfully`, {
        count: updates.length,
      });
    } catch (error) {
      logger.errorLog(`${this.entityName}Store`, `Failed to bulk update ${this.tableName}`, error, {
        count: updates.length,
      });
      throw error;
    }
  }

  /**
   * Delete multiple entities from database in a single transaction
   */
  async bulkDelete(ids: number[]): Promise<void> {
    logger.debugLog(`${this.entityName}Store`, `Bulk deleting ${ids.length} ${this.tableName}`, {
      ids,
    });

    try {
      await this.table.bulkDelete(ids);

      logger.debugLog(`${this.entityName}Store`, `Bulk delete completed successfully`, {
        count: ids.length,
        ids,
      });
    } catch (error) {
      logger.errorLog(`${this.entityName}Store`, `Failed to bulk delete ${this.tableName}`, error, {
        ids,
      });
      throw error;
    }
  }
}
