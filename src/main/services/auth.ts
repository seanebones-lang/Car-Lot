import * as bcrypt from 'bcryptjs';
import { getDatabase } from '../database';
import { LoginSchema, UserSchema, type UserInput } from '../validation/schemas';
import { logAuditEvent } from './audit';

const SALT_ROUNDS = 12;

/**
 * Hashes a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verifies a password against a hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Creates a new user with hashed password
 */
export async function createUser(username: string, password: string, options?: { language?: string; theme?: 'light' | 'dark' }): Promise<number> {
  const db = getDatabase();
  
  // Validate input
  const userData = UserSchema.parse({
    username,
    passwordHash: 'placeholder', // Will be replaced with actual hash
    ...options,
  });
  
  // Check if user already exists
  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username) as { id: number } | undefined;
  if (existing) {
    throw new Error('Username already exists');
  }
  
  // Hash password
  const passwordHash = await hashPassword(password);
  
  // Insert user
  const stmt = db.prepare(`
    INSERT INTO users (username, passwordHash, language, theme)
    VALUES (?, ?, ?, ?)
  `);
  
  const result = stmt.run(username, passwordHash, options?.language || 'en', options?.theme || 'light');
  const userId = Number(result.lastInsertRowid);
  
  // Log audit event
  logAuditEvent('user.create', { userId, username });
  
  return userId;
}

/**
 * Authenticates a user
 */
export async function authenticateUser(username: string, password: string): Promise<{ success: boolean; userId?: number; username?: string; error?: string }> {
  try {
    // Validate input
    LoginSchema.parse({ username, password });
    
    const db = getDatabase();
    
    // Find user
    const user = db.prepare('SELECT id, username, passwordHash FROM users WHERE username = ?').get(username) as 
      { id: number; username: string; passwordHash: string } | undefined;
    
    if (!user) {
      // Log failed login attempt (but don't reveal if user exists)
      logAuditEvent('auth.failed', { username, reason: 'user_not_found' });
      return { success: false, error: 'Invalid credentials' };
    }
    
    // Verify password
    const isValid = await verifyPassword(password, user.passwordHash);
    
    if (!isValid) {
      // Log failed login attempt
      logAuditEvent('auth.failed', { username, userId: user.id, reason: 'invalid_password' });
      return { success: false, error: 'Invalid credentials' };
    }
    
    // Log successful login
    logAuditEvent('auth.success', { username, userId: user.id });
    
    return {
      success: true,
      userId: user.id,
      username: user.username,
    };
  } catch (error) {
    logAuditEvent('auth.error', { username, error: error instanceof Error ? error.message : 'Unknown error' });
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Authentication failed',
    };
  }
}

/**
 * Updates a user's password
 */
export async function updateUserPassword(userId: number, oldPassword: string, newPassword: string): Promise<void> {
  const db = getDatabase();
  
  // Get current user
  const user = db.prepare('SELECT passwordHash FROM users WHERE id = ?').get(userId) as 
    { passwordHash: string } | undefined;
  
  if (!user) {
    throw new Error('User not found');
  }
  
  // Verify old password
  const isValid = await verifyPassword(oldPassword, user.passwordHash);
  if (!isValid) {
    throw new Error('Current password is incorrect');
  }
  
  // Hash new password
  const newPasswordHash = await hashPassword(newPassword);
  
  // Update password
  db.prepare('UPDATE users SET passwordHash = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?').run(newPasswordHash, userId);
  
  // Log audit event
  logAuditEvent('user.password_change', { userId });
}

/**
 * Gets a user by ID
 */
export function getUserById(userId: number) {
  const db = getDatabase();
  return db.prepare('SELECT id, username, language, theme FROM users WHERE id = ?').get(userId) as 
    { id: number; username: string; language: string; theme: string } | undefined;
}

/**
 * Initializes default admin user if no users exist
 * This should only be called on first run
 */
export async function initializeDefaultUser(): Promise<void> {
  const db = getDatabase();
  
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  
  if (userCount.count === 0) {
    // Create default admin user
    // Default credentials: admin / admin (user should change on first login)
    await createUser('admin', 'admin', { language: 'en', theme: 'light' });
    logAuditEvent('system.init', { message: 'Default admin user created' });
  }
}
