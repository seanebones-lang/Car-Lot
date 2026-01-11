import { getDatabase } from '../database';
import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';

const BACKUP_RETENTION_DAYS = 30;

/**
 * Creates a backup of the database
 */
export function createBackup(): string {
  const db = getDatabase();
  const userDataPath = app.getPath('userData');
  const dbPath = path.join(userDataPath, 'autolot.db');
  
  if (!fs.existsSync(dbPath)) {
    throw new Error('Database file not found');
  }
  
  // Create backups directory
  const backupsDir = path.join(userDataPath, 'backups');
  if (!fs.existsSync(backupsDir)) {
    fs.mkdirSync(backupsDir, { recursive: true });
  }
  
  // Generate backup filename with timestamp
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFilename = `autolot-backup-${timestamp}.db`;
  const backupPath = path.join(backupsDir, backupFilename);
  
  // Copy database file
  fs.copyFileSync(dbPath, backupPath);
  
  // Clean up old backups
  cleanupOldBackups(backupsDir);
  
  return backupPath;
}

/**
 * Cleans up backups older than retention period
 */
function cleanupOldBackups(backupsDir: string): void {
  try {
    const files = fs.readdirSync(backupsDir);
    const now = Date.now();
    const retentionMs = BACKUP_RETENTION_DAYS * 24 * 60 * 60 * 1000;
    
    for (const file of files) {
      if (!file.startsWith('autolot-backup-') || !file.endsWith('.db')) {
        continue;
      }
      
      const filePath = path.join(backupsDir, file);
      const stats = fs.statSync(filePath);
      const fileAge = now - stats.mtimeMs;
      
      if (fileAge > retentionMs) {
        fs.unlinkSync(filePath);
      }
    }
  } catch (error) {
    console.error('Error cleaning up backups:', error);
  }
}

/**
 * Restores database from a backup file
 */
export function restoreBackup(backupPath: string): void {
  if (!fs.existsSync(backupPath)) {
    throw new Error('Backup file not found');
  }
  
  const userDataPath = app.getPath('userData');
  const dbPath = path.join(userDataPath, 'autolot.db');
  
  // Close current database connection if needed
  // (better-sqlite3 handles this automatically when copying)
  
  // Create backup of current database before restoring
  if (fs.existsSync(dbPath)) {
    const currentBackup = `${dbPath}.pre-restore-${Date.now()}`;
    fs.copyFileSync(dbPath, currentBackup);
  }
  
  // Copy backup to database location
  fs.copyFileSync(backupPath, dbPath);
}

/**
 * Gets list of available backups
 */
export function getBackupList(): Array<{ path: string; date: Date; size: number }> {
  const userDataPath = app.getPath('userData');
  const backupsDir = path.join(userDataPath, 'backups');
  
  if (!fs.existsSync(backupsDir)) {
    return [];
  }
  
  try {
    const files = fs.readdirSync(backupsDir);
    const backups: Array<{ path: string; date: Date; size: number }> = [];
    
    for (const file of files) {
      if (!file.startsWith('autolot-backup-') || !file.endsWith('.db')) {
        continue;
      }
      
      const filePath = path.join(backupsDir, file);
      const stats = fs.statSync(filePath);
      
      backups.push({
        path: filePath,
        date: stats.mtime,
        size: stats.size,
      });
    }
    
    // Sort by date (newest first)
    backups.sort((a, b) => b.date.getTime() - a.date.getTime());
    
    return backups;
  } catch (error) {
    console.error('Error listing backups:', error);
    return [];
  }
}

/**
 * Schedules automatic daily backups
 */
export function scheduleDailyBackups(): void {
  // Create backup at startup
  try {
    createBackup();
  } catch (error) {
    console.error('Failed to create initial backup:', error);
  }
  
  // Schedule daily backups (24 hours)
  setInterval(() => {
    try {
      createBackup();
      console.log('Daily backup created successfully');
    } catch (error) {
      console.error('Failed to create daily backup:', error);
    }
  }, 24 * 60 * 60 * 1000);
}
