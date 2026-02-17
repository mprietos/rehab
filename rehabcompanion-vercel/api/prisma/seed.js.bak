import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../../.env') });

const prisma = new PrismaClient();

async function main() {
    // Clean up existing data
    await prisma.dailyTask.deleteMany();
    await prisma.gardenState.deleteMany();
    await prisma.doctorPatient.deleteMany();
    await prisma.message.deleteMany();
    await prisma.user.deleteMany();
    await prisma.clinic.deleteMany();

    console.log('Deleted existing data');

    // Create Clinic
    const clinic = await prisma.clinic.create({
        data: {
            name: 'Centro de Rehabilitación Esperanza',
            address: 'Calle Principal 123, Madrid, España',
            phone: '+34 91 123 4567',
            email: 'info@esperanza-rehab.es'
        }
    });

    console.log('Created clinic:', clinic.name);

    // Common password
    const passwordHash = await bcrypt.hash('password123', 10);

    // Create Admin
    const admin = await prisma.user.create({
        data: {
            email: 'admin@esperanza-rehab.es',
            password: passwordHash,
            firstName: 'María',
            lastName: 'García',
            role: 'ADMIN',
            encryptionKey: 'admin_salt_key_123',
            clinicId: clinic.id
        }
    });

    console.log('Created admin:', admin.email);

    // Create Doctors
    const doctor1 = await prisma.user.create({
        data: {
            email: 'dr.rodriguez@esperanza-rehab.es',
            password: passwordHash,
            firstName: 'Carlos',
            lastName: 'Rodríguez',
            role: 'DOCTOR',
            encryptionKey: 'doctor1_salt_key_456',
            clinicId: clinic.id
        }
    });

    const doctor2 = await prisma.user.create({
        data: {
            email: 'dr.martinez@esperanza-rehab.es',
            password: passwordHash,
            firstName: 'Ana',
            lastName: 'Martínez',
            role: 'DOCTOR',
            encryptionKey: 'doctor2_salt_key_789',
            clinicId: clinic.id
        }
    });

    console.log('Created doctors');

    // Create Patients
    const patientsData = [
        { email: 'juan.perez@email.com', firstName: 'Juan', lastName: 'Pérez', enc: 'patient1_salt_abc' },
        { email: 'lucia.fernandez@email.com', firstName: 'Lucía', lastName: 'Fernández', enc: 'patient2_salt_def' },
        { email: 'miguel.santos@email.com', firstName: 'Miguel', lastName: 'Santos', enc: 'patient3_salt_ghi' },
        { email: 'sofia.lopez@email.com', firstName: 'Sofía', lastName: 'López', enc: 'patient4_salt_jkl' },
        { email: 'david.ruiz@email.com', firstName: 'David', lastName: 'Ruiz', enc: 'patient5_salt_mno' }
    ];

    const patients = [];

    for (const p of patientsData) {
        const patient = await prisma.user.create({
            data: {
                email: p.email,
                password: passwordHash,
                firstName: p.firstName,
                lastName: p.lastName,
                role: 'PATIENT',
                encryptionKey: p.enc,
                clinicId: clinic.id,
                emergencyContactName: 'Contacto Emergencia ' + p.firstName,
                emergencyContactPhone: '+34 600 000 000'
            }
        });
        patients.push(patient);

        // Create Garden State
        await prisma.gardenState.create({
            data: {
                userId: patient.id,
                plantStage: ['SEED', 'SPROUT', 'PLANT', 'FLOWER'][Math.floor(Math.random() * 4)],
                currentXp: Math.floor(Math.random() * 500),
                streakDays: Math.floor(Math.random() * 20),
                totalTasksCompleted: Math.floor(Math.random() * 50)
            }
        });

        // Assign to Doctors
        await prisma.doctorPatient.create({
            data: {
                doctorId: doctor1.id,
                patientId: patient.id
            }
        });

        // Create some tasks
        await prisma.dailyTask.create({
            data: {
                userId: patient.id,
                description: 'Tomar medicación matutina',
                type: 'MEDICATION',
                date: new Date(),
                isCompleted: false
            }
        });

        await prisma.dailyTask.create({
            data: {
                userId: patient.id,
                description: 'Caminar 15 minutos',
                type: 'ACTIVITY',
                date: new Date(),
                isCompleted: true,
                completedAt: new Date(),
                mood: 'bien'
            }
        });
    }

    console.log('Created patients and assignments');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
