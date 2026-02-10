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

    const { days = 30 } = req.query;

    // Get date range
    const endDate = new Date();
    endDate.setHours(0, 0, 0, 0);

    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Get mood checks
    const moodChecks = await prisma.moodCheck.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: {
        date: 'asc'
      }
    });

    // Check if today's mood is submitted
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayMood = await prisma.moodCheck.findFirst({
      where: {
        userId,
        date: today
      }
    });

    // Count consecutive bad days
    const recentMoods = await prisma.moodCheck.findMany({
      where: {
        userId,
        date: {
          lte: today
        }
      },
      orderBy: {
        date: 'desc'
      },
      take: 7
    });

    let consecutiveBadDays = 0;
    for (const mood of recentMoods) {
      if (mood.moodLevel === 'BAD') {
        consecutiveBadDays++;
      } else {
        break;
      }
    }

    return res.status(200).json({
      success: true,
      moodChecks,
      todaySubmitted: !!todayMood,
      todayMood: todayMood || null,
      consecutiveBadDays,
      stats: {
        total: moodChecks.length,
        good: moodChecks.filter(m => m.moodLevel === 'GOOD').length,
        neutral: moodChecks.filter(m => m.moodLevel === 'NEUTRAL').length,
        bad: moodChecks.filter(m => m.moodLevel === 'BAD').length
      }
    });

  } catch (error) {
    console.error('Error fetching mood history:', error);
    return res.status(500).json({ error: 'Failed to fetch mood history' });
  }
}
