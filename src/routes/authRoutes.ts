import { Router, RequestHandler, Request, Response, NextFunction } from 'express';
import { login, register, getDashboardData, getRecentActivity } from '../controllers/authController';
import jwt from 'jsonwebtoken';

const router = Router();

// Middleware สำหรับตรวจสอบ JWT
const authenticateToken: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        res.status(401).json({ error: 'Access token required' });
        return;
    }

    jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret', (err: any, user: any) => {
        if (err) {
            res.status(403).json({ error: 'Invalid token' });
            return;
        }
        (req as any).user = user;
        next();
    });
};

router.post('/login', login);
router.post('/register', register);
router.get('/dashboard', authenticateToken, getDashboardData);
router.get('/recent-activity', authenticateToken, getRecentActivity);

export default router;