import { userService } from '../../database/db.js';
import type { User } from '../../database/types.js';
import { debugLog, errorLog, infoLog } from '../../logger.js';
import { PasswordHasher } from './crypto.js';

/**
 * Authentication service
 */
export class AuthenticationService {
  private currentUser: User | null = null;

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

      // Check if email already exists
      const emailExists = await userService.emailExists(email);
      if (emailExists) {
        throw new Error('Email already registered');
      }

      // Hash password and create user
      const passwordHash = await PasswordHasher.hashPassword(password);
      const userId = await userService.add({ email, passwordHash });

      // Get the created user
      const user = await userService.get(userId);
      if (!user) {
        throw new Error('Failed to create user');
      }

      this.currentUser = user;
      infoLog('AuthService', 'User registered successfully', {
        userId: user.id,
        email: user.email,
      });
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
      // Find user by email
      const user = await userService.findByEmail(email);
      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Verify password
      const isValidPassword = await PasswordHasher.verifyPassword(password, user.passwordHash);
      if (!isValidPassword) {
        throw new Error('Invalid email or password');
      }

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
  logout(): void {
    debugLog('AuthService', 'Logout attempt', { userId: this.currentUser?.id });

    if (this.currentUser) {
      infoLog('AuthService', 'User logged out', { userId: this.currentUser.id });
    }

    this.currentUser = null;
  }

  /**
   * Get current authenticated user
   */
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  /**
   * Update current user data (useful after profile updates)
   */
  async refreshCurrentUser(): Promise<void> {
    if (this.currentUser?.id) {
      const updatedUser = await userService.get(this.currentUser.id);
      if (updatedUser) {
        this.currentUser = updatedUser;
      }
    }
  }
}

// Export singleton instance
export const authService = new AuthenticationService();
