import * as crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;

/**
 * Derives an encryption key from a password using PBKDF2
 * In production, the master key should be stored securely (e.g., OS keychain)
 */
function deriveKey(password: string, salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(password, salt, 100000, KEY_LENGTH, 'sha512');
}

/**
 * Gets or creates the master encryption key
 * In a real application, this should use OS keychain (keytar on Electron)
 * For now, we'll use a file-based approach with a fixed key location
 */
function getMasterKey(): string {
  // In production, this should:
  // 1. Check OS keychain (keytar)
  // 2. Generate and store key on first use
  // 3. Use environment variable as fallback
  
  // For now, use a constant key (IN PRODUCTION: use OS keychain)
  // This is a placeholder - in real implementation, use keytar or similar
  const keyPath = process.env.MASTER_ENCRYPTION_KEY || 'default-key-change-in-production';
  return keyPath;
}

/**
 * Encrypts a string value using AES-256-GCM
 */
export function encrypt(text: string): string {
  try {
    const masterKey = getMasterKey();
    const salt = crypto.randomBytes(SALT_LENGTH);
    const key = deriveKey(masterKey, salt);
    const iv = crypto.randomBytes(IV_LENGTH);
    
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    let encrypted = cipher.update(text, 'utf8');
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    const tag = cipher.getAuthTag();
    
    // Combine salt + iv + tag + encrypted data
    const combined = Buffer.concat([salt, iv, tag, encrypted]);
    
    return combined.toString('base64');
  } catch (error) {
    throw new Error(`Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Decrypts a string value encrypted with encrypt()
 */
export function decrypt(encryptedText: string): string {
  try {
    const masterKey = getMasterKey();
    const combined = Buffer.from(encryptedText, 'base64');
    
    // Extract components
    const salt = combined.subarray(0, SALT_LENGTH);
    const iv = combined.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
    const tag = combined.subarray(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
    const encrypted = combined.subarray(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
    
    const key = deriveKey(masterKey, salt);
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    
    return decrypted.toString('utf8');
  } catch (error) {
    throw new Error(`Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Hashes a value using SHA-256 (one-way, for non-sensitive data)
 */
export function hash(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex');
}
