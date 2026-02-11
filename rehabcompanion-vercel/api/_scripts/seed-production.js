import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de producción...');

  // 1. Crear clínica
  console.log('📍 Creando clínica...');
  const clinic = await prisma.clinic.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Clínica Esperanza',
      address: 'Calle Principal 123, Madrid',
      phone: '+34 900 123 456',
      email: 'info@esperanza-rehab.es',
      isActive: true
    }
  });
  console.log('✅ Clínica creada:', clinic.name);

  // 2. Crear doctor
  console.log('👨‍⚕️ Creando doctor...');
  const doctorPassword = await bcrypt.hash('password123', 10);
  const doctor = await prisma.user.upsert({
    where: { email: 'dr.rodriguez@esperanza-rehab.es' },
    update: {},
    create: {
      email: 'dr.rodriguez@esperanza-rehab.es',
      password: doctorPassword,
      firstName: 'Carlos',
      lastName: 'Rodríguez',
      role: 'DOCTOR',
      clinicId: clinic.id,
      encryptionKey: crypto.randomBytes(32).toString('hex'),
      isActive: true
    }
  });
  console.log('✅ Doctor creado:', doctor.email);

  // 3. Crear paciente 1 (Semilla)
  console.log('👤 Creando paciente 1 (Juan - Semilla)...');
  const patient1Password = await bcrypt.hash('password123', 10);
  const patient1 = await prisma.user.upsert({
    where: { email: 'juan.perez@email.com' },
    update: {},
    create: {
      email: 'juan.perez@email.com',
      password: patient1Password,
      firstName: 'Juan',
      lastName: 'Pérez',
      role: 'PATIENT',
      clinicId: clinic.id,
      encryptionKey: crypto.randomBytes(32).toString('hex'),
      emergencyContactName: 'María Pérez',
      emergencyContactPhone: '+34 600 111 222',
      isActive: true
    }
  });

  await prisma.gardenState.upsert({
    where: { userId: patient1.id },
    update: {},
    create: {
      userId: patient1.id,
      plantStage: 'SEED',
      currentXp: 10,
      streakDays: 1,
      totalTasksCompleted: 2,
      lastActionDate: new Date()
    }
  });
  console.log('✅ Paciente 1 creado:', patient1.email);

  // 4. Crear paciente 2 (Brote)
  console.log('👤 Creando paciente 2 (Lucía - Brote)...');
  const patient2Password = await bcrypt.hash('password123', 10);
  const patient2 = await prisma.user.upsert({
    where: { email: 'lucia.fernandez@email.com' },
    update: {},
    create: {
      email: 'lucia.fernandez@email.com',
      password: patient2Password,
      firstName: 'Lucía',
      lastName: 'Fernández',
      role: 'PATIENT',
      clinicId: clinic.id,
      encryptionKey: crypto.randomBytes(32).toString('hex'),
      emergencyContactName: 'Pedro Fernández',
      emergencyContactPhone: '+34 600 333 444',
      isActive: true
    }
  });

  await prisma.gardenState.upsert({
    where: { userId: patient2.id },
    update: {},
    create: {
      userId: patient2.id,
      plantStage: 'SPROUT',
      currentXp: 45,
      streakDays: 3,
      totalTasksCompleted: 9,
      lastActionDate: new Date()
    }
  });
  console.log('✅ Paciente 2 creado:', patient2.email);

  // 5. Asignar pacientes al doctor
  console.log('🔗 Asignando pacientes al doctor...');
  await prisma.doctorPatient.upsert({
    where: {
      doctorId_patientId: {
        doctorId: doctor.id,
        patientId: patient1.id
      }
    },
    update: {},
    create: {
      doctorId: doctor.id,
      patientId: patient1.id
    }
  });

  await prisma.doctorPatient.upsert({
    where: {
      doctorId_patientId: {
        doctorId: doctor.id,
        patientId: patient2.id
      }
    },
    update: {},
    create: {
      doctorId: doctor.id,
      patientId: patient2.id
    }
  });
  console.log('✅ Relaciones doctor-paciente creadas');

  // 6. Crear tareas de ejemplo
  console.log('📋 Creando tareas de ejemplo...');
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await prisma.dailyTask.create({
    data: {
      userId: patient1.id,
      description: 'Tomar medicación matutina',
      type: 'MEDICATION',
      date: today,
      isCompleted: false
    }
  });

  await prisma.dailyTask.create({
    data: {
      userId: patient1.id,
      description: 'Caminar 30 minutos',
      type: 'ACTIVITY',
      date: today,
      isCompleted: false
    }
  });
  console.log('✅ Tareas de ejemplo creadas');

  // 7. Crear mensaje de bienvenida
  console.log('💬 Creando mensaje de bienvenida...');
  await prisma.message.create({
    data: {
      fromId: doctor.id,
      toId: patient1.id,
      content: '¡Bienvenido a adiccare! Estoy aquí para apoyarte en tu camino de recuperación. No dudes en contactarme si necesitas algo.',
      isRead: false
    }
  });
  console.log('✅ Mensaje de bienvenida creado');

  console.log('\n✨ Seed de producción completado exitosamente!\n');
  console.log('📝 Credenciales de prueba:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('👨‍⚕️ DOCTOR:');
  console.log('   Email: dr.rodriguez@esperanza-rehab.es');
  console.log('   Pass:  password123');
  console.log('');
  console.log('👤 PACIENTE 1 (Semilla):');
  console.log('   Email: juan.perez@email.com');
  console.log('   Pass:  password123');
  console.log('');
  console.log('👤 PACIENTE 2 (Brote):');
  console.log('   Email: lucia.fernandez@email.com');
  console.log('   Pass:  password123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
