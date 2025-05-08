import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import db from '../config/db';
import { User, JwtPayload } from '../types';

// ปรับ AuthenticatedRequest
interface AuthenticatedRequest extends Request {
  user?: User | JwtPayload;
}

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment variables');
}

// ฟังก์ชันสำหรับดึงข้อมูลผู้ใช้จากฐานข้อมูล
const findUserById = async (id: number): Promise<User | null> => {
  try {
    const [rows] = await db.query('SELECT id, username, email, role, created_at FROM users WHERE id = ?', [id]);
    return (rows as any[])[0] as User | null;
  } catch (error) {
    console.error('Error in findUserById:', error);
    return null;
  }
};

// Middleware สำหรับการตรวจสอบ token
export const authMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    console.log('Decoded JWT:', decoded);

    const user = await findUserById(decoded.id);
    console.log('User from DB:', user);

    if (!user) {
      res.status(401).json({ error: 'User not found in database' });
      return;
    }

    req.user = user;
    next();
  } catch (error: any) {
    console.error('Error in authMiddleware:', error.message);
    res.status(401).json({ error: 'Invalid token', details: error.message });
    return;
  }
};

// Middleware สำหรับตรวจสอบ admin
export const adminMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ error: 'Access denied. Admins only.' });
    return;
  }
  next();
};