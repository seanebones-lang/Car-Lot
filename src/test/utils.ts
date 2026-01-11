import Database from 'better-sqlite3';
import { initializeDatabase, closeDatabase } from '../main/database';

/**
 * Creates a test database in memory
 */
export function createTestDatabase(): Database.Database {
  const db = new Database(':memory:');
  db.pragma('foreign_keys = ON');
  return db;
}

/**
 * Sets up test fixtures
 */
export function setupTestFixtures() {
  // Test data setup helpers can go here
}

/**
 * Cleans up test fixtures
 */
export function cleanupTestFixtures() {
  // Cleanup helpers can go here
}
