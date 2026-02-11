import { authenticate } from '../utils/auth.js';
import prisma from '../utils/db.js';

const XP_THRESHOLDS = {
  SEED: 0,
  SPROUT: 100,
  PLANT: 300,
  FLOWER: 600
};

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

    // Get or create garden state
    let gardenState = await prisma.gardenState.findUnique({
      where: { userId: user.id }
    });

    if (!gardenState) {
      // Create new garden state
      gardenState = await prisma.gardenState.create({
        data: {
          userId: user.id,
          plantStage: 'SEED',
          currentXp: 0,
          streakDays: 0,
          totalTasksCompleted: 0
        }
      });
    }

    // Calculate progress to next stage
    let nextStageXP = null;
    let progressPercentage = 0;

    switch (gardenState.plantStage) {
      case 'SEED':
        nextStageXP = XP_THRESHOLDS.SPROUT;
        progressPercentage = (gardenState.currentXp / XP_THRESHOLDS.SPROUT) * 100;
        break;
      case 'SPROUT':
        nextStageXP = XP_THRESHOLDS.PLANT;
        progressPercentage = ((gardenState.currentXp - XP_THRESHOLDS.SPROUT) / (XP_THRESHOLDS.PLANT - XP_THRESHOLDS.SPROUT)) * 100;
        break;
      case 'PLANT':
        nextStageXP = XP_THRESHOLDS.FLOWER;
        progressPercentage = ((gardenState.currentXp - XP_THRESHOLDS.PLANT) / (XP_THRESHOLDS.FLOWER - XP_THRESHOLDS.PLANT)) * 100;
        break;
      case 'FLOWER':
        nextStageXP = null;
        progressPercentage = 100;
        break;
    }

    res.status(200).json({
      garden: {
        id: gardenState.id,
        userId: gardenState.userId,
        plantStage: gardenState.plantStage,
        currentXP: gardenState.currentXp,
        streakDays: gardenState.streakDays,
        lastActionDate: gardenState.lastActionDate,
        totalTasksCompleted: gardenState.totalTasksCompleted,
        createdAt: gardenState.createdAt,
        updatedAt: gardenState.updatedAt,
        nextStageXP,
        progressPercentage: Math.min(100, Math.max(0, progressPercentage))
      }
    });
  } catch (error) {
    console.error('Get garden state error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
