import { RequestHandler, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// กำหนด interface สำหรับ user ที่จะเพิ่มใน req
interface User {
  id: number;
  email: string;
  role: string;
}

// ขยาย Request เพื่อเพิ่ม user
interface AuthenticatedRequest extends Request {
  user?: User;
}

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
}

// ใช้ async เพื่อให้ TypeScript ยอมรับ Promise<void>
export const authMiddleware: RequestHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        res.status(401).json({ error: 'No token provided' });
        return;
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as User;
        (req as AuthenticatedRequest).user = decoded;
        next();
    } catch (error: any) {
        console.error('Error in authMiddleware:', error);
        res.status(401).json({ error: 'Invalid token' });
        return;
    }
};

// ใช้ async เพื่อให้ TypeScript ยอมรับ Promise<void>
export const adminMiddleware: RequestHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const user = (req as AuthenticatedRequest).user;
    if (!user || user.role !== 'admin') {
        res.status(403).json({ error: 'Access denied. Admins only.' });
        return;
    }
    next();
};