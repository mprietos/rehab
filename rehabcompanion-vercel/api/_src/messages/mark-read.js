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

    // Get messageId from route params, query params, or body
    const messageId = req.params?.messageId || req.query?.messageId || req.body?.messageId;

    if (!messageId) {
      return res.status(400).json({ error: 'Message ID required' });
    }

    // Verify the message belongs to this user
    const message = await prisma.message.findUnique({
      where: { id: messageId }
    });

    if (!message || message.toId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Mark as read
    await prisma.message.update({
      where: { id: messageId },
      data: { isRead: true }
    });

    return res.status(200).json({
      success: true,
      message: 'Message marked as read'
    });

  } catch (error) {
    console.error('Error marking message as read:', error);
    return res.status(500).json({ error: 'Failed to mark message as read' });
  }
}
