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

    if (req.method !== 'POST') {
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
        const patientId = req.params.id || req.query.id;
        const { description, type, date } = req.body;

        if (!patientId || !description || !type) {
            return res.status(400).json({ error: 'Missing required fields' });
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
            return res.status(403).json({ error: 'Not authorized to assign tasks to this patient' });
        }

        // Create task
        const newTask = await prisma.dailyTask.create({
            data: {
                userId: patientId,
                description,
                type,
                date: date ? new Date(date) : new Date(),
                isCompleted: false,
                isActive: true
            }
        });

        res.status(201).json({
            message: 'Task assigned successfully',
            task: newTask
        });
    } catch (error) {
        console.error('Assign task error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
