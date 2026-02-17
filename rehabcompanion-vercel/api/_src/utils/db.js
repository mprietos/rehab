import { PrismaClient } from '@prisma/client';

// Singleton pattern for Vercel serverless environment.
// Without this, each function invocation creates a new PrismaClient
// and quickly exhausts the database connection pool.
const globalForPrisma = globalThis;

const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
