import bcrypt from 'bcrypt';

const users = [
    { role: 'ADMIN', pass: 'admin123', hash: '$2b$10$SmhB5W5HLMYFe4DyMF.Fqu7.DUwNhLqpLNkCLZiL8lQiBDo0BZBhS' },
    { role: 'DOCTOR', pass: 'doctor123', hash: '$2b$10$phRkjv.DQQUrIl8zfUKBJeIs8EacKRGy79CU/Oz4ADF85R/iC0QCO' },
    { role: 'PATIENT', pass: 'patient123', hash: '$2b$10$GS6QKD4HPLKc0GWKR/4dx.GaipimHsWgaWIrwnW/6yXe8WwRkPiD.' }
];

async function verify() {
    for (const user of users) {
        const isValid = await bcrypt.compare(user.pass, user.hash);
        console.log(`${user.role}: ${isValid ? '✅ VALID' : '❌ INVALID'}`);
    }
}

verify();
