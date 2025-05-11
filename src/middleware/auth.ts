import { Request, Response, NextFunction } from 'express';
import jwt, { VerifyErrors } from 'jsonwebtoken';
import { AuthenticatedRequest, User } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }

  jwt.verify(token, JWT_SECRET, (err: VerifyErrors | null, decoded: any) => {
    if (err) {
      console.error('Error in authMiddleware:', err.message);
      res.status(401).json({ error: 'Invalid token', details: err.message });
      return;
    }

    try {
      if (typeof decoded.id !== 'number') {
        throw new Error('ID is required in token');
      }
      if (typeof decoded.email !== 'string') {
        throw new Error('Email is required in token');
      }
      if (typeof decoded.role !== 'string' || !['client', 'admin'].includes(decoded.role)) {
        throw new Error('Invalid role in token');
      }

      const user: User = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role as 'client' | 'admin',
        iat: decoded.iat,
        exp: decoded.exp,
      };
      req.user = user;
      next();
    } catch (error) {
      res.status(401).json({
        error: 'Invalid token payload',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });
};

export const adminMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ error: 'Access denied. Admins only.' });
    return;
  }
  next();
};