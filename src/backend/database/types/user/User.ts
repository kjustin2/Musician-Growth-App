import { BaseEntity } from '../../common/BaseEntity.js';
import { db } from '../../db.js';
import { type User, UserFields } from './userSchema.js';

/**
 * User entity class with specific business logic
 */
export class UserEntity extends BaseEntity<User> {
    private static _instance: UserEntity | null = null;

    constructor() {
        super('User', UserFields, db.users);
    }

    static getInstance(): UserEntity {
        this._instance ??= new UserEntity();
        return this._instance;
    }

    /**
     * Find user by email
     */
    async findByEmail(email: string): Promise<User | undefined> {
        return await this.table.where('email').equals(email).first();
    }

    /**
     * Check if email already exists
     */
    async emailExists(email: string): Promise<boolean> {
        const count = await this.table.where('email').equals(email).count();
        return count > 0;
    }
}

// Export getter and store using BaseEntity helper methods
export const getUserEntity = BaseEntity.createGetter(UserEntity);
export const users = BaseEntity.createStore(UserEntity);