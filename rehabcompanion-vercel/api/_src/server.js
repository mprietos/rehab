import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar variables de entorno (primero .env.local si existe)
dotenv.config({ path: join(__dirname, '..', '.env.local') });
dotenv.config({ path: join(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Import handlers (serverless functions)
import loginHandler from './auth/login.js';
import profileHandler from './auth/profile.js';
import updateProfileHandler from './auth/update-profile.js';
import tasksListHandler from './tasks/list.js';
import tasksCompleteHandler from './tasks/complete.js';
import gardenStateHandler from './garden/state.js';

// Wrapper to adapt serverless functions to Express
const wrapHandler = (handler) => async (req, res) => {
  try {
    await handler(req, res);
  } catch (error) {
    console.error('Handler error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

// Routes - mapping serverless functions to Express routes
app.post('/api/auth/login', wrapHandler(loginHandler));
app.get('/api/auth/profile', wrapHandler(profileHandler));
app.post('/api/auth/update-profile', wrapHandler(updateProfileHandler));
app.get('/api/tasks/list', wrapHandler(tasksListHandler));
app.post('/api/tasks/complete', wrapHandler(tasksCompleteHandler));
app.get('/api/garden/state', wrapHandler(gardenStateHandler));

// Doctor routes
import doctorPatientsHandler from './doctor/patients.js';
import doctorPatientDetailHandler from './doctor/patient.js';
import doctorAssignTaskHandler from './doctor/assign-task.js';
import doctorMessageHandler from './doctor/message.js';
import doctorCreatePatientHandler from './doctor/create-patient.js';
import doctorGenerateMessageHandler from './doctor/generate-message.js';

app.post('/api/doctor/patients', wrapHandler(doctorCreatePatientHandler));
app.get('/api/doctor/patients', wrapHandler(doctorPatientsHandler));
app.get('/api/doctor/patients/:id', wrapHandler(doctorPatientDetailHandler));
app.post('/api/doctor/patients/:id/tasks', wrapHandler(doctorAssignTaskHandler));
app.post('/api/doctor/patients/:id/message', wrapHandler(doctorMessageHandler));
app.post('/api/doctor/generate-message', wrapHandler(doctorGenerateMessageHandler));

// Messages routes
import messagesListHandler from './messages/list.js';
import messagesMarkReadHandler from './messages/mark-read.js';
import messagesSendHandler from './messages/send.js';

app.get('/api/messages', wrapHandler(messagesListHandler));
app.get('/api/messages/list', wrapHandler(messagesListHandler));
app.post('/api/messages/send', wrapHandler(messagesSendHandler));
app.post('/api/messages/:messageId/read', wrapHandler(messagesMarkReadHandler));
app.post('/api/messages/mark-read', wrapHandler(messagesMarkReadHandler));

// Mood routes
import moodSubmitHandler from './mood/submit.js';
import moodHistoryHandler from './mood/history.js';

app.post('/api/mood/submit', wrapHandler(moodSubmitHandler));
app.get('/api/mood/history', wrapHandler(moodHistoryHandler));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'RehabCompanion API - Local Development',
    database: process.env.DATABASE_URL ? 'configured' : 'not configured'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server only if not in Vercel serverless environment
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log('═══════════════════════════════════════════════════════');
    console.log('🌱 RehabCompanion API Server - LOCAL DEVELOPMENT');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    console.log(`📚 API Base: http://localhost:${PORT}/api`);
    console.log(`🗄️  Database: ${process.env.DATABASE_URL ? '✅ Connected' : '❌ Not configured'}`);
    console.log('═══════════════════════════════════════════════════════\n');
    console.log('Available endpoints:');
    console.log('  POST /api/auth/login');
    console.log('  GET  /api/auth/profile');
    console.log('  GET  /api/tasks/list');
    console.log('  POST /api/tasks/complete');
    console.log('  GET  /api/garden/state');
    console.log('═══════════════════════════════════════════════════════\n');
  });
}

export default app;
