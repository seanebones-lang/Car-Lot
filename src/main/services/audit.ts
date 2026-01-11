import { getDatabase } from '../database';

export interface AuditEvent {
  action: string;
  userId?: number;
  username?: string;
  resource?: string;
  resourceId?: number;
  details?: Record<string, unknown>;
  timestamp?: string;
}

/**
 * Logs an audit event to the database
 */
export function logAuditEvent(action: string, details?: Record<string, unknown>): void {
  try {
    const db = getDatabase();
    
    // Ensure audit_log table exists
    db.exec(`
      CREATE TABLE IF NOT EXISTS audit_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        action TEXT NOT NULL,
        userId INTEGER,
        username TEXT,
        resource TEXT,
        resourceId INTEGER,
        details TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id)
      )
    `);
    
    // Create index on timestamp for faster queries
    try {
      db.exec(`
        CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_log(timestamp);
        CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_log(action);
        CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_log(userId);
      `);
    } catch {
      // Indexes might already exist, ignore errors
    }
    
    const stmt = db.prepare(`
      INSERT INTO audit_log (action, userId, username, resource, resourceId, details)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      action,
      details?.userId || null,
      details?.username || null,
      details?.resource || null,
      details?.resourceId || null,
      details ? JSON.stringify(details) : null
    );
  } catch (error) {
    // Don't throw errors in audit logging - log to console as fallback
    console.error('Audit logging failed:', error);
  }
}

/**
 * Gets audit logs with optional filtering
 */
export function getAuditLogs(options?: {
  limit?: number;
  offset?: number;
  userId?: number;
  action?: string;
  startDate?: string;
  endDate?: string;
}) {
  const db = getDatabase();
  
  let query = 'SELECT * FROM audit_log WHERE 1=1';
  const params: unknown[] = [];
  
  if (options?.userId) {
    query += ' AND userId = ?';
    params.push(options.userId);
  }
  
  if (options?.action) {
    query += ' AND action = ?';
    params.push(options.action);
  }
  
  if (options?.startDate) {
    query += ' AND timestamp >= ?';
    params.push(options.startDate);
  }
  
  if (options?.endDate) {
    query += ' AND timestamp <= ?';
    params.push(options.endDate);
  }
  
  query += ' ORDER BY timestamp DESC';
  
  if (options?.limit) {
    query += ' LIMIT ?';
    params.push(options.limit);
    
    if (options?.offset) {
      query += ' OFFSET ?';
      params.push(options.offset);
    }
  }
  
  return db.prepare(query).all(...params);
}
