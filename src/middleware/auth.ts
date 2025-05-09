import { Response, NextFunction, RequestHandler } from 'express';
import jwt, { VerifyErrors } from 'jsonwebtoken';
import { AuthenticatedRequest, User, JwtPayload } from '../types';

export const authMiddleware: RequestHandler = (req, res, next) => {
  const authReq = req as AuthenticatedRequest;
  const token = authReq.headers.authorization?.split(' ')[1];
  if (!token) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }

  const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
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

      const payload: JwtPayload = {
        id: decoded.id,
        email: decoded.email, // ต้องมี email
        role: decoded.role as 'client' | 'admin',
        iat: decoded.iat,
        exp: decoded.exp,
      };
      authReq.user = payload;
      next();
    } catch (error) {
      res.status(401).json({ error: 'Invalid token payload', details: error instanceof Error ? error.message : 'Unknown error' });
      return;
    }
  });
};

export const adminMiddleware: RequestHandler = (req, res, next) => {
  const authReq = req as AuthenticatedRequest;
  if (!authReq.user || authReq.user.role !== 'admin') {
    res.status(403).json({ error: 'Access denied. Admins only.' });
    return;
  }
  next();
};