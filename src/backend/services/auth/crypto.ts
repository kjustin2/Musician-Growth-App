import { debugLog, errorLog } from '../../logger.js';

/**
 * Password hashing utilities using Web Crypto API
 */
export class PasswordHasher {
    private static readonly SALT_LENGTH = 16;
    private static readonly ITERATIONS = 100000;
    private static readonly KEY_LENGTH = 32;

    /**
     * Hash a password with a random salt
     */
    static async hashPassword(password: string): Promise<string> {
        debugLog('PasswordHasher', 'Hashing password');

        try {
            // Generate random salt
            const salt = crypto.getRandomValues(new Uint8Array(this.SALT_LENGTH));

            // Convert password to ArrayBuffer
            const passwordBuffer = new TextEncoder().encode(password);

            // Import password as key material
            const keyMaterial = await crypto.subtle.importKey(
                'raw',
                passwordBuffer,
                { name: 'PBKDF2' },
                false,
                ['deriveBits']
            );

            // Derive key using PBKDF2
            const derivedKey = await crypto.subtle.deriveBits(
                {
                    name: 'PBKDF2',
                    salt: salt,
                    iterations: this.ITERATIONS,
                    hash: 'SHA-256',
                },
                keyMaterial,
                this.KEY_LENGTH * 8
            );

            // Combine salt and derived key
            const hashArray = new Uint8Array(this.SALT_LENGTH + this.KEY_LENGTH);
            hashArray.set(salt, 0);
            hashArray.set(new Uint8Array(derivedKey), this.SALT_LENGTH);

            // Convert to base64 string
            const hashString = btoa(String.fromCharCode(...hashArray));

            debugLog('PasswordHasher', 'Password hashed successfully');
            return hashString;
        } catch (error) {
            errorLog('PasswordHasher', 'Failed to hash password', error);
            throw new Error('Failed to hash password');
        }
    }

    /**
     * Verify a password against a hash
     */
    static async verifyPassword(password: string, hash: string): Promise<boolean> {
        debugLog('PasswordHasher', 'Verifying password');

        try {
            // Decode base64 hash
            const hashArray = new Uint8Array(
                atob(hash)
                    .split('')
                    .map(char => char.charCodeAt(0))
            );

            // Extract salt and stored key
            const salt = hashArray.slice(0, this.SALT_LENGTH);
            const storedKey = hashArray.slice(this.SALT_LENGTH);

            // Convert password to ArrayBuffer
            const passwordBuffer = new TextEncoder().encode(password);

            // Import password as key material
            const keyMaterial = await crypto.subtle.importKey(
                'raw',
                passwordBuffer,
                { name: 'PBKDF2' },
                false,
                ['deriveBits']
            );

            // Derive key using same parameters
            const derivedKey = await crypto.subtle.deriveBits(
                {
                    name: 'PBKDF2',
                    salt: salt,
                    iterations: this.ITERATIONS,
                    hash: 'SHA-256',
                },
                keyMaterial,
                this.KEY_LENGTH * 8
            );

            // Compare derived key with stored key
            const derivedKeyArray = new Uint8Array(derivedKey);
            const isValid = this.constantTimeEquals(derivedKeyArray, storedKey);

            debugLog('PasswordHasher', 'Password verification completed', { isValid });
            return isValid;
        } catch (error) {
            errorLog('PasswordHasher', 'Failed to verify password', error);
            return false;
        }
    }

    /**
     * Constant-time comparison to prevent timing attacks
     */
    private static constantTimeEquals(a: Uint8Array, b: Uint8Array): boolean {
        if (a.length !== b.length) {
            return false;
        }

        let result = 0;
        for (let i = 0; i < a.length; i++) {
            result |= (a[i] ?? 0) ^ (b[i] ?? 0);
        }

        return result === 0;
    }

    /**
     * Validate password strength
     */
    static validatePasswordStrength(password: string): string | null {
        if (!password || password.length < 8) {
            return 'Password must be at least 8 characters long';
        }

        if (!/[A-Z]/.test(password)) {
            return 'Password must contain at least one uppercase letter';
        }

        if (!/[a-z]/.test(password)) {
            return 'Password must contain at least one lowercase letter';
        }

        if (!/[0-9]/.test(password)) {
            return 'Password must contain at least one number';
        }

        return null; // Password is valid
    }
}