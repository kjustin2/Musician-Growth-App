import type { EntityCreationData } from '../../database/common/types.js';
import { getUserEntity } from '../../database/types/user/User.js';
import type { User } from '../../database/types/user/userSchema.js';
import { debugLog, errorLog, infoLog } from '../../logger.js';
import { PasswordHasher } from './crypto.js';

/**
 * Authentication service for user registration and login
 */
export class AuthenticationService {
    private static _instance: AuthenticationService | null = null;
    private currentUser: User | null = null;

    static getInstance(): AuthenticationService {
        this._instance ??= new AuthenticationService();
        return this._instance;
    }

    /**
     * Register a new user
     */
    async register(email: string, password: string): Promise<User> {
        debugLog('AuthService', 'Registration attempt', { email });

        try {
            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                throw new Error('Invalid email format');
            }

            // Validate password strength
            const passwordError = PasswordHasher.validatePasswordStrength(password);
            if (passwordError) {
                throw new Error(passwordError);
            }

            const userEntity = getUserEntity();

            // Check if email already exists
            const emailExists = await userEntity.emailExists(email.toLowerCase());
            if (emailExists) {
                throw new Error('Email already registered');
            }

            // Hash password
            const passwordHash = await PasswordHasher.hashPassword(password);

            // Create user data
            const userData: EntityCreationData<User> = {
                email: email.toLowerCase(),
                passwordHash,
            };

            // Create user
            const userId = await userEntity.add(userData);

            // Find the created user
            const user = await userEntity.table.get(userId);
            if (!user) {
                throw new Error('Failed to create user');
            }

            // Set as current user
            this.currentUser = user;

            infoLog('AuthService', 'User registered successfully', { userId: user.id, email: user.email });
            return user;
        } catch (error) {
            errorLog('AuthService', 'Registration failed', error, { email });
            throw error;
        }
    }

    /**
     * Login user with email and password
     */
    async login(email: string, password: string): Promise<User> {
        debugLog('AuthService', 'Login attempt', { email });

        try {
            const userEntity = getUserEntity();

            // Find user by email
            const user = await userEntity.findByEmail(email.toLowerCase());
            if (!user) {
                throw new Error('Invalid email or password');
            }

            // Verify password
            const isValidPassword = await PasswordHasher.verifyPassword(password, user.passwordHash);
            if (!isValidPassword) {
                throw new Error('Invalid email or password');
            }

            // Set as current user
            this.currentUser = user;

            infoLog('AuthService', 'User logged in successfully', { userId: user.id, email: user.email });
            return user;
        } catch (error) {
            errorLog('AuthService', 'Login failed', error, { email });
            throw error;
        }
    }

    /**
     * Logout current user
     */
    async logout(): Promise<void> {
        debugLog('AuthService', 'Logout attempt', { userId: this.currentUser?.id });

        try {
            if (this.currentUser) {
                infoLog('AuthService', 'User logged out', { userId: this.currentUser.id });
            }

            this.currentUser = null;
        } catch (error) {
            errorLog('AuthService', 'Logout failed', error);
            throw error;
        }
    }

    /**
     * Get current authenticated user
     */
    async getCurrentUser(): Promise<User | null> {
        return this.currentUser;
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated(): boolean {
        return this.currentUser !== null;
    }

    /**
     * Hash password (utility method)
     */
    async hashPassword(password: string): Promise<string> {
        return await PasswordHasher.hashPassword(password);
    }

    /**
     * Verify password (utility method)
     */
    async verifyPassword(password: string, hash: string): Promise<boolean> {
        return await PasswordHasher.verifyPassword(password, hash);
    }
}