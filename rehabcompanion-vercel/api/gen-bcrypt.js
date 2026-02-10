import bcrypt from 'bcrypt';

const password = 'admin123';

async function generate() {
    const hash = await bcrypt.hash(password, 10);
    console.log(`Password: ${password}`);
    console.log(`Generated Hash: ${hash}`);

    const isValid = await bcrypt.compare(password, hash);
    console.log(`Is valid: ${isValid}`);
}

generate();
