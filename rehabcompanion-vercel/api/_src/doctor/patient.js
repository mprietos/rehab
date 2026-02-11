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
        const patientId = req.params.id || req.query.id; // Support both just in case

        if (!patientId) {
            return res.status(400).json({ error: 'Patient ID required' });
        }

        // Verify assignment
        const assignment = await prisma.doctorPatient.findUnique({
            where: {
                doctorId_patientId: {
                    doctorId: doctorId,
                    patientId: patientId
                }
            }
        });

        if (!assignment || !assignment.isActive) {
            return res.status(403).json({ error: 'Not authorized to view this patient' });
        }

        // Get full patient details
        const patient = await prisma.user.findUnique({
            where: { id: patientId },
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
                gardenState: true,
                dailyTasks: {
                    where: {
                        date: {
                            gte: new Date(new Date().setDate(new Date().getDate() - 7)) // Last 7 days
                        }
                    },
                    orderBy: { date: 'desc' },
                    take: 20
                }
            }
        });

        res.status(200).json({ patient });
    } catch (error) {
        console.error('Get patient details error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
