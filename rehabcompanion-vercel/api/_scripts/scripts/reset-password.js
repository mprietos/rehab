import bcrypt from 'bcrypt';
import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load env from project root
dotenv.config({ path: join(__dirname, '../../.env.local') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function resetPassword(email, newPassword) {
    try {
        console.log(`Resetting password for: ${email}`);
        const hash = await bcrypt.hash(newPassword, 10);

        const result = await pool.query(
            'UPDATE users SET password = $1 WHERE email = $2 RETURNING id',
            [hash, email]
        );

        if (result.rowCount > 0) {
            console.log('✅ Password updated successfully!');
            console.log(`New hash: ${hash}`);
        } else {
            console.log('❌ User not found.');
        }
    } catch (error) {
        console.error('Error updating password:', error);
    } finally {
        await pool.end();
    }
}

// Usage: node scripts/reset-password.js <email> <password>
const [email, password] = process.argv.slice(2);

if (!email || !password) {
    console.log('Usage: node scripts/reset-password.js <email> <password>');
    process.exit(1);
}

resetPassword(email, password);
