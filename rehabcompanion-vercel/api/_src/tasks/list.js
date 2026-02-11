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

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const auth = await authenticate(req);
    if (auth.error) {
      return res.status(auth.status).json({ error: auth.error });
    }

    const user = auth.user;
    const { date } = req.query;

    let queryDate = date ? new Date(date) : new Date();

    // Ensure we're querying for the date part only if needed, 
    // but with @db.Date Prisma handles the casting usually.
    // However, to be safe with timezones, usually best to pass a Date object 
    // that represents that day.

    const tasks = await prisma.dailyTask.findMany({
      where: {
        userId: user.id,
        date: queryDate
      },
      orderBy: {
        createdAt: 'asc'
      },
      select: {
        id: true,
        userId: true,
        description: true,
        type: true,
        date: true,
        isCompleted: true,
        completedAt: true,
        createdAt: true,
        mood: true
      }
    });

    res.status(200).json({ tasks });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
