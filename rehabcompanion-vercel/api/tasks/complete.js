import { authenticate } from '../utils/auth.js';
import prisma from '../utils/db.js';
import { encrypt } from '../utils/encryption.js';

const XP_REWARDS = {
  MEDICATION: 20,
  ACTIVITY: 30,
  EMOTION_CHECK: 15
};

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

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const auth = await authenticate(req);
    if (auth.error) {
      return res.status(auth.status).json({ error: auth.error });
    }

    const user = auth.user;
    const { taskId } = req.query;
    const { notes, mood } = req.body || {};

    // Find the task
    const task = await prisma.dailyTask.findUnique({
      where: { id: taskId }
    });

    if (!task || task.userId !== user.id) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (task.isCompleted) {
      return res.status(400).json({ error: 'Task already completed' });
    }

    // Encrypt notes if provided
    let encryptedNotes = null;
    if (notes) {
      encryptedNotes = encrypt(notes, user.encryptionKey);
    }

    // Mark task as completed
    await prisma.dailyTask.update({
      where: { id: taskId },
      data: {
        isCompleted: true,
        completedAt: new Date(),
        notes: encryptedNotes,
        mood: mood
      }
    });

    // Logic for consecutive "mal" moods
    let moodAlert = null;
    if (task.type === 'EMOTION_CHECK' && mood === 'mal') {
      // Check last 2 days of tasks
      const prevMoods = await prisma.dailyTask.findMany({
        where: {
          userId: user.id,
          type: 'EMOTION_CHECK',
          isCompleted: true,
          id: { not: taskId }
        },
        orderBy: { completedAt: 'desc' },
        take: 2,
        select: { mood: true }
      });

      const malCount = prevMoods.filter(r => r.mood === 'mal').length + 1;

      if (malCount === 2) {
        moodAlert = {
          type: 'MOTIVATIONAL',
          message: 'Vemos que has tenido un par de días difíciles. Recuerda que no estás solo y cada pequeño paso cuenta. ¡Tú puedes!'
        };
      } else if (malCount === 3) {
        moodAlert = {
          type: 'EMERGENCY',
          message: 'Has tenido varios días complicados. ¿Te gustaría llamar a tu contacto de emergencia o hablar con alguien?',
          contactName: user.emergencyContactName,
          contactPhone: user.emergencyContactPhone
        };
      }
    }

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

    // Calculate XP reward
    const xpReward = XP_REWARDS[task.type] || 10;
    const oldStage = gardenState.plantStage;
    let newXP = gardenState.currentXp + xpReward;
    let newStage = oldStage;

    // Determine new stage
    if (newXP >= XP_THRESHOLDS.FLOWER) {
      newStage = 'FLOWER';
    } else if (newXP >= XP_THRESHOLDS.PLANT) {
      newStage = 'PLANT';
    } else if (newXP >= XP_THRESHOLDS.SPROUT) {
      newStage = 'SPROUT';
    }

    // Update streak
    const today = new Date(); // Use Date object for Prisma
    // Truncate time for comparison logic if needed, but Prisma stores Date as is.
    // If logic relies on string comparison 'YYYY-MM-DD', we should do it manually.
    const todayStr = today.toISOString().split('T')[0];
    let newStreak = gardenState.streakDays;

    if (!gardenState.lastActionDate) {
      newStreak = 1;
    } else {
      const lastDate = new Date(gardenState.lastActionDate);
      const lastDateStr = lastDate.toISOString().split('T')[0];

      const diffTime = new Date(todayStr).getTime() - new Date(lastDateStr).getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        // Same day, no change
      } else if (diffDays === 1) {
        // Consecutive day
        newStreak += 1;
      } else {
        // Streak broken
        newStreak = 1;
      }
    }

    // Update garden state
    const updatedGarden = await prisma.gardenState.update({
      where: { id: gardenState.id },
      data: {
        plantStage: newStage,
        currentXp: newXP,
        streakDays: newStreak,
        lastActionDate: today,
        totalTasksCompleted: { increment: 1 }
      }
    });

    const leveledUp = oldStage !== newStage;
    const gs = updatedGarden;

    res.status(200).json({
      message: 'Task completed successfully!',
      task: {
        id: task.id,
        description: task.description,
        type: task.type,
        isCompleted: true,
        completedAt: new Date(),
        mood: mood
      },
      garden: {
        id: gs.id,
        userId: gs.userId,
        plantStage: gs.plantStage,
        currentXP: gs.currentXp,
        streakDays: gs.streakDays,
        totalTasksCompleted: gs.totalTasksCompleted
      },
      reward: {
        xpGained: xpReward,
        leveledUp,
        oldStage,
        newStage
      },
      moodAlert
    });
  } catch (error) {
    console.error('Complete task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
