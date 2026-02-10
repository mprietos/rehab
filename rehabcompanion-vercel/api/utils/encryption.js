import CryptoJS from 'crypto-js';
import dotenv from 'dotenv';

dotenv.config();

const MASTER_KEY = process.env.ENCRYPTION_MASTER_KEY || 'default_key_change_in_production';

/**
 * Encrypt sensitive data using AES-256
 * @param {string} text - Plain text to encrypt
 * @param {string} userKey - User-specific encryption key
 * @returns {string} Encrypted text
 */
export const encrypt = (text, userKey) => {
  if (!text) return null;

  // Combine master key with user-specific key for extra security
  const combinedKey = CryptoJS.SHA256(MASTER_KEY + userKey).toString();
  const encrypted = CryptoJS.AES.encrypt(text, combinedKey).toString();

  return encrypted;
};

/**
 * Decrypt sensitive data
 * @param {string} encryptedText - Encrypted text
 * @param {string} userKey - User-specific encryption key
 * @returns {string} Decrypted plain text
 */
export const decrypt = (encryptedText, userKey) => {
  if (!encryptedText) return null;

  try {
    const combinedKey = CryptoJS.SHA256(MASTER_KEY + userKey).toString();
    const decrypted = CryptoJS.AES.decrypt(encryptedText, combinedKey);
    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
};
