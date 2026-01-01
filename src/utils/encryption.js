import CryptoJS from 'crypto-js';

const SECRET_KEY = 'sge_secret_key_v1'; // In production, this should be an environment variable

/**
 * Encrypts data into a string
 * @param {any} data - Data to encrypt
 * @returns {string} - Encrypted string
 */
export const encrypt = (data) => {
    try {
        const jsonString = JSON.stringify(data);
        return CryptoJS.AES.encrypt(jsonString, SECRET_KEY).toString();
    } catch (error) {
        console.error('Encryption error:', error);
        return null;
    }
};

/**
 * Decrypts an encrypted string
 * @param {string} encryptedString - String to decrypt
 * @returns {any} - Decrypted data
 */
export const decrypt = (encryptedString) => {
    try {
        const bytes = CryptoJS.AES.decrypt(encryptedString, SECRET_KEY);
        const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
        return JSON.parse(decryptedData);
    } catch (error) {
        console.error('Decryption error:', error);
        return null;
    }
};

/**
 * Checks if a string is likely encrypted
 * @param {string} str - String to check
 * @returns {boolean}
 */
export const isEncrypted = (str) => {
    if (typeof str !== 'string') return false;
    // Simple check: Encrypted strings from AES usually don't look like JSON
    return !str.startsWith('{') && !str.startsWith('[');
};
