import bcrypt from 'bcrypt';

const passwords = ['admin123', 'doctor123', 'patient123'];

async function generate() {
    for (const pass of passwords) {
        const hash = await bcrypt.hash(pass, 10);
        console.log(`${pass}: ${hash}`);
    }
}

generate();
