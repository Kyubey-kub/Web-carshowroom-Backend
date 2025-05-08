import { RequestHandler, Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import db from '../config/db';
import { User, JwtPayload as CustomJwtPayload } from '../types/index';

// ขยาย Request เพื่อเพิ่ม user
interface AuthenticatedRequest extends Request {
  user?: User & CustomJwtPayload;
}

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment variables');
}

// ฟังก์ชันสำหรับดึงข้อมูลผู้ใช้จากฐานข้อมูล
const findUserById = async (id: number): Promise<User | null> => {
  try {
    const [rows] = await db.query('SELECT id, name, email, role, created_at FROM users WHERE id = ?', [id]);
    return (rows as any[])[0] as User | null;
  } catch (error) {
    console.error('Error in findUserById:', error);
    return null;
  }
};

// Middleware สำหรับการตรวจสอบ token
export const authMiddleware: RequestHandler = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }

  try {
    // Verify token และดึง payload
    const decoded = jwt.verify(token, JWT_SECRET) as CustomJwtPayload;
    console.log('Decoded JWT:', decoded);

    // ดึงข้อมูลผู้ใช้จากฐานข้อมูลเพื่อให้ได้ข้อมูลครบถ้วน
    const user = await findUserById(decoded.id);
    console.log('User from DB:', user);

    if (!user) {
      res.status(401).json({ error: 'User not found in database' });
      return;
    }

    // เพิ่ม user เข้าไปใน req
    req.user = { ...user, ...decoded };
    next();
  } catch (error: any) {
    console.error('Error in authMiddleware:', error.message);
    res.status(401).json({ error: 'Invalid token', details: error.message });
    return;
  }
};

// Middleware สำหรับตรวจสอบ admin
export const adminMiddleware: RequestHandler = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  const user = req.user;
  if (!user || user.role !== 'admin') {
    res.status(403).json({ error: 'Access denied. Admins only.' });
    return;
  }
  next();
};