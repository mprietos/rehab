import bcrypt from 'bcrypt';
import CryptoJS from 'crypto-js';

// From .env.local
const MASTER_KEY = '+ncr0n+RNcPwIiNq49r2knNfJXa7MyHDLKLDFI5pdWQ=';
// From seed.sql for admin
const userKey = 'admin_salt_key_123';
const dbHash = '$2b$10$rKfJxZxVqW5YhNZxGVxhDeK5JJ7XQ2tqV8kX5jLVdxkXZLNzKqZWm';
const password = 'admin123';

function encrypt(text, uKey) {
    const combinedKey = CryptoJS.SHA256(MASTER_KEY + uKey).toString();
    const encrypted = CryptoJS.AES.encrypt(text, combinedKey).toString();
    return encrypted;
}

async function test() {
    const encryptedPassword = encrypt(password, userKey);
    console.log(`Password: ${password}`);
    console.log(`Encrypted: ${encryptedPassword}`);

    // Bcrypt compare
    // Wait, if I just encrypt it once, the hash would be for THAT specific encrypted string.
    // But AES.encrypt usually includes an IV, so it's different every time unless fixed.
    // CryptoJS.AES.encrypt uses a random salt/IV by default (OpenSSL style).
    // This means hashing an AES encrypted string is NOT a good idea because it changes.

    // Let's see if the hash in DB matches ANY encrypted version.
    // Actually, let's just see if the hash in DB is a known hash.

    const result = await bcrypt.compare(encryptedPassword, dbHash);
    console.log(`Is valid with encrypted password: ${result}`);
}

test();
