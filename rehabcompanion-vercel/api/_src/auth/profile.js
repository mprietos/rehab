import { authenticate } from '../utils/auth.js';
import prisma from '../utils/db.js';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const auth = await authenticate(req);
    if (auth.error) {
      return res.status(auth.status).json({ error: auth.error });
    }

    const user = auth.user;

    // Get garden state and doctor if user is a patient
    let garden = null;
    let doctor = null;
    if (user.role === 'PATIENT') {
      garden = await prisma.gardenState.findUnique({
        where: { userId: user.id }
      });

      const doctorRelation = await prisma.doctorPatient.findFirst({
        where: { patientId: user.id, isActive: true },
        include: {
          doctor: {
            select: { id: true, firstName: true, lastName: true, email: true }
          }
        }
      });
      doctor = doctorRelation?.doctor || null;
    }

    const { password: _, encryptionKey: __, ...userPublic } = user;

    res.status(200).json({
      user: userPublic,
      garden,
      doctor
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
