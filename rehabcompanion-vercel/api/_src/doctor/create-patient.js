import prisma from '../utils/db.js';
import { verifyToken } from '../utils/auth.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = verifyToken(token);
    const doctorId = decoded.id;

    // Verify the user is a doctor
    const doctor = await prisma.user.findUnique({
      where: { id: doctorId },
      select: { role: true, clinicId: true }
    });

    if (!doctor || doctor.role !== 'DOCTOR') {
      return res.status(403).json({ error: 'Only doctors can create patients' });
    }

    const {
      email,
      password,
      firstName,
      lastName,
      emergencyContactName,
      emergencyContactPhone
    } = req.body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if patient already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate encryption key
    const encryptionKey = crypto.randomBytes(32).toString('hex');

    // Create patient
    const patient = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: 'PATIENT',
        encryptionKey,
        emergencyContactName,
        emergencyContactPhone,
        clinicId: doctor.clinicId,
        gardenState: {
          create: {
            plantStage: 'SEED',
            currentXp: 0,
            streakDays: 0,
            totalTasksCompleted: 0
          }
        }
      },
      include: {
        gardenState: true
      }
    });

    // Assign patient to doctor
    await prisma.doctorPatient.create({
      data: {
        doctorId,
        patientId: patient.id
      }
    });

    return res.status(201).json({
      success: true,
      patient: {
        id: patient.id,
        email: patient.email,
        firstName: patient.firstName,
        lastName: patient.lastName,
        emergencyContactName: patient.emergencyContactName,
        emergencyContactPhone: patient.emergencyContactPhone
      }
    });

  } catch (error) {
    console.error('Error creating patient:', error);
    return res.status(500).json({ error: 'Failed to create patient' });
  }
}
