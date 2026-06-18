import { Injectable } from '@nestjs/common';
import { createCipheriv, createDecipheriv, randomBytes, createSecretKey } from 'crypto';

@Injectable()
export class EncryptionService {
  private readonly ALGORITHM = 'aes-256-gcm';
  private readonly IV_LENGTH = 12; // 96-bit IV for GCM

  private getMasterKey(): Buffer {
    const masterKeyHex = process.env.ENCRYPTION_MASTER_KEY;
    if (!masterKeyHex) {
      throw new Error('ENCRYPTION_MASTER_KEY environment variable is not set');
    }
    const key = Buffer.from(masterKeyHex, 'hex');
    if (key.length !== 32) {
      throw new Error('ENCRYPTION_MASTER_KEY must be a 64-character hex string (32 bytes)');
    }
    return key;
  }

  /**
   * Encrypt a plaintext string using AES-256-GCM.
   * Returns:
   *  - ciphertext: the encrypted data (iv + authTag + ciphertext) as hex
   *  - dek: the encrypted Data Encryption Key (DEK) as hex
   */
  encryptDocument(plaintext: string): { ciphertext: string; dek: string } {
    // Generate a random 32-byte Data Encryption Key (DEK)
    const dek = randomBytes(32);

    // Encrypt the plaintext with the DEK
    const iv = randomBytes(this.IV_LENGTH);
    const cipher = createCipheriv(this.ALGORITHM, dek, iv);
    const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();

    // Compose: iv (12 bytes) + authTag (16 bytes) + ciphertext
    const ciphertext = Buffer.concat([iv, authTag, encrypted]).toString('hex');

    // Encrypt the DEK with the master key (also AES-256-GCM)
    const masterKey = this.getMasterKey();
    const dekIv = randomBytes(this.IV_LENGTH);
    const dekCipher = createCipheriv(this.ALGORITHM, masterKey, dekIv);
    const encryptedDek = Buffer.concat([dekCipher.update(dek), dekCipher.final()]);
    const dekAuthTag = dekCipher.getAuthTag();

    // Compose DEK envelope: dekIv (12 bytes) + dekAuthTag (16 bytes) + encryptedDek (32 bytes)
    const encryptedDekFull = Buffer.concat([dekIv, dekAuthTag, encryptedDek]).toString('hex');

    return { ciphertext, dek: encryptedDekFull };
  }

  /**
   * Decrypt a document given its ciphertext and encrypted DEK.
   * Both arguments are expected as hex strings (produced by encryptDocument).
   */
  decryptDocument(ciphertext: string, dek: string): string {
    const masterKey = this.getMasterKey();

    // Decode and decrypt the DEK
    const dekBuf = Buffer.from(dek, 'hex');
    const dekIv = dekBuf.subarray(0, this.IV_LENGTH);
    const dekAuthTag = dekBuf.subarray(this.IV_LENGTH, this.IV_LENGTH + 16);
    const encryptedDek = dekBuf.subarray(this.IV_LENGTH + 16);

    const dekDecipher = createDecipheriv(this.ALGORITHM, masterKey, dekIv);
    dekDecipher.setAuthTag(dekAuthTag);
    const plainDek = Buffer.concat([dekDecipher.update(encryptedDek), dekDecipher.final()]);

    // Decode and decrypt the ciphertext using the recovered DEK
    const ciphertextBuf = Buffer.from(ciphertext, 'hex');
    const iv = ciphertextBuf.subarray(0, this.IV_LENGTH);
    const authTag = ciphertextBuf.subarray(this.IV_LENGTH, this.IV_LENGTH + 16);
    const encryptedData = ciphertextBuf.subarray(this.IV_LENGTH + 16);

    const decipher = createDecipheriv(this.ALGORITHM, plainDek, iv);
    decipher.setAuthTag(authTag);
    const decrypted = Buffer.concat([decipher.update(encryptedData), decipher.final()]);

    return decrypted.toString('utf8');
  }
}
