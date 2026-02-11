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
        const { content } = req.body;

        if (!patientId || !content) {
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
            return res.status(403).json({ error: 'Not authorized to send messages to this patient' });
        }

        // Create message
        const newMessage = await prisma.message.create({
            data: {
                content,
                fromId: doctorId,
                toId: patientId,
                isRead: false,
                isActive: true
            }
        });

        res.status(201).json({
            message: 'Message sent successfully',
            data: newMessage
        });
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
