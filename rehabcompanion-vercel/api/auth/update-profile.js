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

    if (req.method !== 'POST' && req.method !== 'PUT') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const auth = await authenticate(req);
        if (auth.error) {
            return res.status(auth.status).json({ error: auth.error });
        }

        const userId = auth.user.id;
        const { firstName, lastName, emergencyContactName, emergencyContactPhone } = req.body;

        const updateData = {};
        if (firstName) updateData.firstName = firstName;
        if (lastName) updateData.lastName = lastName;
        if (emergencyContactName) updateData.emergencyContactName = emergencyContactName;
        if (emergencyContactPhone) updateData.emergencyContactPhone = emergencyContactPhone;

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updateData
        });

        const { password: _, encryptionKey: __, ...userPublic } = updatedUser;

        res.status(200).json({
            message: 'Profile updated successfully',
            user: userPublic
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
