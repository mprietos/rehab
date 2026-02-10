import bcrypt from 'bcrypt';

const hash = '$2b$10$rKfJxZxVqW5YhNZxGVxhDeK5JJ7XQ2tqV8kX5jLVdxkXZLNzKqZWm';
const password = 'admin123';

async function test() {
    const result = await bcrypt.compare(password, hash);
    console.log(`Password: ${password}`);
    console.log(`Hash: ${hash}`);
    console.log(`Is valid: ${result}`);
}

test();
