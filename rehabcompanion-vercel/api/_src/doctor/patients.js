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

    if (req.method !== 'GET') {
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

        const doctorId = auth.user.id;

        // Get assigned patients
        const connections = await prisma.doctorPatient.findMany({
            where: {
                doctorId: doctorId,
                isActive: true
            },
            include: {
                patient: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                        emergencyContactName: true,
                        emergencyContactPhone: true,
                        role: true,
                        isActive: true,
                        createdAt: true,
                        gardenState: {
                            select: {
                                plantStage: true,
                                currentXp: true,
                                streakDays: true,
                                lastActionDate: true
                            }
                        },
                        moodChecks: {
                            where: {
                                OR: [
                                    { requestedEmergencyCall: true },
                                    { moodLevel: 'GOOD' }
                                ]
                            },
                            orderBy: {
                                date: 'desc'
                            },
                            take: 20, // Get enough history to determine status
                            select: {
                                id: true,
                                date: true,
                                moodLevel: true,
                                requestedEmergencyCall: true,
                                isDismissed: true
                            }
                        }
                    }
                }
            }
        });

        const patients = connections.map(c => {
            const patient = c.patient;

            // Calculate active alert status
            let hasActiveAlert = false;
            let activeAlertId = null;

            if (patient.moodChecks && patient.moodChecks.length > 0) {
                // Find the most recent emergency call request
                const latestAlert = patient.moodChecks.find(check => check.requestedEmergencyCall);

                if (latestAlert && !latestAlert.isDismissed) {
                    // Check if patient has recovered since the alert
                    // Recovery = 2 consecutive GOOD days AFTER the alert date
                    const checksAfterAlert = patient.moodChecks.filter(check =>
                        new Date(check.date) > new Date(latestAlert.date)
                    );

                    let consecutiveGoodDays = 0;
                    let hasRecovered = false;

                    // Sort ascending to check consecutive days properly
                    checksAfterAlert.sort((a, b) => new Date(a.date) - new Date(b.date));

                    for (const check of checksAfterAlert) {
                        if (check.moodLevel === 'GOOD') {
                            consecutiveGoodDays++;
                            if (consecutiveGoodDays >= 2) {
                                hasRecovered = true;
                                break;
                            }
                        } else {
                            consecutiveGoodDays = 0;
                        }
                    }

                    if (!hasRecovered) {
                        hasActiveAlert = true;
                        activeAlertId = latestAlert.id;
                    }
                }
            }

            return {
                ...patient,
                hasActiveAlert,
                activeAlertId
            };
        });

        res.status(200).json({ patients });
    } catch (error) {
        console.error('Get doctor patients error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
