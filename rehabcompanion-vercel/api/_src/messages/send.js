import prisma from '../utils/db.js';
import { verifyToken } from '../utils/auth.js';

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
        if (!decoded) {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }
        const userId = decoded.id;

        const { toId, content } = req.body;

        if (!toId || !content) {
            return res.status(400).json({ error: 'Recipient ID and content are required' });
        }

        // Verify that the recipient exists
        const recipient = await prisma.user.findUnique({
            where: { id: toId }
        });

        if (!recipient) {
            return res.status(404).json({ error: 'Recipient not found' });
        }

        // Create the message
        const message = await prisma.message.create({
            data: {
                fromId: userId,
                toId,
                content
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        role: true
                    }
                },
                receiver: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        role: true
                    }
                }
            }
        });

        return res.status(201).json({
            success: true,
            message
        });

    } catch (error) {
        console.error('Error sending message:', error);
        return res.status(500).json({ error: 'Failed to send message' });
    }
}
