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

    const { moodLevel, notes, requestedEmergencyCall } = req.body;

    if (!moodLevel || !['GOOD', 'NEUTRAL', 'BAD'].includes(moodLevel)) {
      return res.status(400).json({ error: 'Valid mood level required (GOOD, NEUTRAL, BAD)' });
    }

    // Get today's date (without time)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if already submitted today
    const existingCheck = await prisma.moodCheck.findFirst({
      where: {
        userId,
        date: today
      }
    });

    if (existingCheck) {
      return res.status(400).json({ error: 'Mood already registered for today' });
    }

    // Create mood check
    const moodCheck = await prisma.moodCheck.create({
      data: {
        userId,
        date: today,
        moodLevel,
        notes: notes || null,
        requestedEmergencyCall: requestedEmergencyCall || false
      }
    });

    // Award XP for daily mood check
    const XP_REWARD = 5;
    const gardenState = await prisma.gardenState.findUnique({
      where: { userId }
    });

    if (gardenState) {
      const newXp = gardenState.currentXp + XP_REWARD;
      let newStage = gardenState.plantStage;

      // Level up logic
      if (newXp >= 200 && gardenState.plantStage === 'FLOWER') {
        newStage = 'FLOWER';
      } else if (newXp >= 150 && gardenState.plantStage !== 'FLOWER') {
        newStage = 'FLOWER';
      } else if (newXp >= 80 && (gardenState.plantStage === 'SEED' || gardenState.plantStage === 'SPROUT')) {
        newStage = 'PLANT';
      } else if (newXp >= 30 && gardenState.plantStage === 'SEED') {
        newStage = 'SPROUT';
      }

      await prisma.gardenState.update({
        where: { userId },
        data: {
          currentXp: newXp,
          plantStage: newStage,
          lastActionDate: today
        }
      });
    }

    // Check consecutive bad days
    const last7Days = new Date(today);
    last7Days.setDate(last7Days.getDate() - 7);

    const recentMoods = await prisma.moodCheck.findMany({
      where: {
        userId,
        date: {
          gte: last7Days,
          lte: today
        }
      },
      orderBy: {
        date: 'desc'
      }
    });

    // Count consecutive bad days
    let consecutiveBadDays = 0;
    for (const mood of recentMoods) {
      if (mood.moodLevel === 'BAD') {
        consecutiveBadDays++;
      } else {
        break;
      }
    }

    // Prepare response with alert info
    const response = {
      success: true,
      moodCheck,
      consecutiveBadDays,
      showMotivationalMessage: consecutiveBadDays >= 2,
      showEmergencyContact: consecutiveBadDays >= 3,
      xpEarned: XP_REWARD
    };

    // If requested emergency call, notify doctor
    if (requestedEmergencyCall) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          doctorsAsPatient: {
            include: {
              doctor: true
            }
          }
        }
      });

      // Create message for each doctor
      for (const doctorPatient of user.doctorsAsPatient) {
        await prisma.message.create({
          data: {
            fromId: userId,
            toId: doctorPatient.doctorId,
            content: `🚨 ALERTA: El paciente ${user.firstName} ${user.lastName} ha solicitado contactar con su persona de emergencia. Lleva ${consecutiveBadDays} días consecutivos con estado de ánimo bajo.`
          }
        });
      }

      // Update mood check
      await prisma.moodCheck.update({
        where: { id: moodCheck.id },
        data: {
          doctorNotified: true
        }
      });

      response.emergencyNotified = true;
    }

    return res.status(201).json(response);

  } catch (error) {
    console.error('Error submitting mood check:', error);
    return res.status(500).json({ error: 'Failed to submit mood check' });
  }
}
