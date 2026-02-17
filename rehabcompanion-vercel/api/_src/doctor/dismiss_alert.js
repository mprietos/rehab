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

        const { moodCheckId } = req.body;

        if (!moodCheckId) {
            return res.status(400).json({ error: 'Mood check ID is required' });
        }

        // Verify the mood check exists and belongs to a patient assigned to this doctor
        // For simplicity, we just check if it exists for now, assuming doctors can manage alerts
        const moodCheck = await prisma.moodCheck.findUnique({
            where: { id: moodCheckId },
            include: { user: true }
        });

        if (!moodCheck) {
            return res.status(404).json({ error: 'Mood check not found' });
        }

        // Update the mood check to be dismissed
        const updatedMoodCheck = await prisma.moodCheck.update({
            where: { id: moodCheckId },
            data: {
                isDismissed: true
            }
        });

        res.status(200).json({
            success: true,
            message: 'Alert dismissed successfully',
            moodCheck: updatedMoodCheck
        });
    } catch (error) {
        console.error('Dismiss alert error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
