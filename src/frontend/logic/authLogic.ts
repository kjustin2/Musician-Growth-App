import { derived, writable, type Readable, type Writable } from 'svelte/store';
import type { User } from '../../backend/database/types/user/userSchema.js';
import { debugLog, errorLog } from '../../backend/logger.js';
import { AuthenticationService } from '../../backend/services/auth/AuthenticationService.js';

/**
 * Authentication state and logic for the frontend
 */
export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

/**
 * Create authentication logic
 */
export function createAuthLogic() {
    const authService = AuthenticationService.getInstance();

    // Internal state stores
    const user: Writable<User | null> = writable(null);
    const isLoading: Writable<boolean> = writable(false);
    const error: Writable<string | null> = writable(null);

    // Derived state
    const isAuthenticated: Readable<boolean> = derived(user, $user => $user !== null);

    // Combined auth state
    const authState: Readable<AuthState> = derived(
        [user, isAuthenticated, isLoading, error],
        ([$user, $isAuthenticated, $isLoading, $error]) => ({
            user: $user,
            isAuthenticated: $isAuthenticated,
            isLoading: $isLoading,
            error: $error,
        })
    );

    /**
     * Clear error state
     */
    const clearError = () => {
        error.set(null);
    };

    /**
     * Register a new user
     */
    const register = async (email: string, password: string, confirmPassword: string): Promise<void> => {
        debugLog('AuthLogic', 'Registration attempt', { email });

        try {
            // Clear previous errors
            clearError();
            isLoading.set(true);

            // Validate password confirmation
            if (password !== confirmPassword) {
                throw new Error('Passwords do not match');
            }

            // Register user - don't set user state to avoid auto-login
            await authService.register(email, password);

            debugLog('AuthLogic', 'Registration successful', { email });
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Registration failed';
            error.set(errorMessage);
            errorLog('AuthLogic', 'Registration failed', err, { email });
            throw err;
        } finally {
            isLoading.set(false);
        }
    };

    /**
     * Login user
     */
    const login = async (email: string, password: string): Promise<void> => {
        debugLog('AuthLogic', 'Login attempt', { email });

        try {
            clearError();
            isLoading.set(true);

            const loggedInUser = await authService.login(email, password);
            user.set(loggedInUser);

            debugLog('AuthLogic', 'Login successful', { userId: loggedInUser.id });
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Login failed';
            error.set(errorMessage);
            errorLog('AuthLogic', 'Login failed', err, { email });
            throw err;
        } finally {
            isLoading.set(false);
        }
    };

    /**
     * Logout user
     */
    const logout = async (): Promise<void> => {
        debugLog('AuthLogic', 'Logout attempt');

        try {
            isLoading.set(true);
            await authService.logout();
            user.set(null);
            clearError();

            debugLog('AuthLogic', 'Logout successful');
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Logout failed';
            error.set(errorMessage);
            errorLog('AuthLogic', 'Logout failed', err);
            throw err;
        } finally {
            isLoading.set(false);
        }
    };

    /**
     * Initialize auth state (check for existing session)
     */
    const initialize = async (): Promise<void> => {
        debugLog('AuthLogic', 'Initializing auth state');

        try {
            isLoading.set(true);
            const currentUser = await authService.getCurrentUser();
            user.set(currentUser);

            debugLog('AuthLogic', 'Auth state initialized', {
                isAuthenticated: currentUser !== null,
                userId: currentUser?.id
            });
        } catch (err) {
            errorLog('AuthLogic', 'Failed to initialize auth state', err);
            user.set(null);
        } finally {
            isLoading.set(false);
        }
    };

    return {
        // State
        authState,
        user,
        isAuthenticated,
        isLoading,
        error,

        // Actions
        register,
        login,
        logout,
        initialize,
        clearError,
    };
}