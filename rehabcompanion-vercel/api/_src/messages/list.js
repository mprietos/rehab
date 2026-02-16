import { PrismaClient } from '@prisma/client';
import { verifyToken } from '../utils/auth.js';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'GET') {
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

    const otherUserId = req.query.userId;

    let whereClause = {
      toId: userId,
      isActive: true
    };

    if (otherUserId) {
      whereClause = {
        OR: [
          { fromId: userId, toId: otherUserId },
          { fromId: otherUserId, toId: userId }
        ],
        isActive: true
      };
    }

    // Get messages
    const messages = await prisma.message.findMany({
      where: whereClause,
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
      },
      orderBy: {
        createdAt: 'asc' // Use asc for chronological history
      }
    });

    return res.status(200).json({
      success: true,
      messages,
      unreadCount: messages.filter(m => m.toId === userId && !m.isRead).length
    });

  } catch (error) {
    console.error('Error fetching messages:', error);
    return res.status(500).json({ error: 'Failed to fetch messages' });
  }
}
