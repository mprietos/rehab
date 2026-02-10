import { authenticate, authorize } from '../utils/auth.js';
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

        const permissionError = authorize(auth.user, 'DOCTOR', 'ADMIN');
        if (permissionError) {
            return res.status(permissionError.status).json({ error: permissionError.error });
        }

        const doctorId = auth.user.id;

        // Get assigned patients
        const connections = await prisma.doctorPatient.findMany({
            where: {
                doctorId: doctorId,
                isActive: true
            },
            include: {
                patient: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                        emergencyContactName: true,
                        emergencyContactPhone: true,
                        role: true,
                        isActive: true,
                        createdAt: true,
                        gardenState: {
                            select: {
                                plantStage: true,
                                currentXp: true,
                                streakDays: true,
                                lastActionDate: true
                            }
                        }
                    }
                }
            }
        });

        const patients = connections.map(c => c.patient);

        res.status(200).json({ patients });
    } catch (error) {
        console.error('Get doctor patients error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
