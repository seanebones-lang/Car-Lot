import { encrypt, decrypt } from '../encryption';

describe('Encryption Service', () => {
  const testData = 'sensitive-api-key-12345';
  
  it('should encrypt and decrypt data correctly', () => {
    const encrypted = encrypt(testData);
    expect(encrypted).not.toBe(testData);
    expect(encrypted.length).toBeGreaterThan(0);
    
    const decrypted = decrypt(encrypted);
    expect(decrypted).toBe(testData);
  });
  
  it('should produce different encrypted values for same input', () => {
    const encrypted1 = encrypt(testData);
    const encrypted2 = encrypt(testData);
    
    // Due to random IV/salt, encrypted values should be different
    expect(encrypted1).not.toBe(encrypted2);
    
    // But both should decrypt to the same value
    expect(decrypt(encrypted1)).toBe(testData);
    expect(decrypt(encrypted2)).toBe(testData);
  });
  
  it('should throw error on invalid encrypted data', () => {
    expect(() => decrypt('invalid-encrypted-data')).toThrow();
  });
});
