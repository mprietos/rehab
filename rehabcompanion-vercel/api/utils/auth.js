import jwt from 'jsonwebtoken';
import prisma from '../utils/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

export const authenticate = async (req) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { error: 'No token provided', status: 401 };
  }

  const token = authHeader.substring(7);
  const decoded = verifyToken(token);

  if (!decoded) {
    return { error: 'Invalid or expired token', status: 401 };
  }

  // Get user from database using Prisma
  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      encryptionKey: true,
      isActive: true
    }
  });

  if (!user || !user.isActive) {
    return { error: 'Invalid token or user inactive', status: 401 };
  }

  return { user };
};

export const authorize = (user, ...roles) => {
  if (!user) {
    return { error: 'Not authenticated', status: 401 };
  }

  if (!roles.includes(user.role)) {
    return { error: 'Insufficient permissions', status: 403 };
  }

  return null;
};
