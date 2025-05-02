import { Router, RequestHandler, Request, Response, NextFunction } from 'express';
import { getUsers, deleteUser, getAdminEmail, updateUser, addUser } from '../controllers/userController';
import jwt from 'jsonwebtoken';

const router = Router();

const authMiddleware: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
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

        if (user.role !== 'admin') {
            res.status(403).json({ error: 'Admin access required' });
            return;
        }

        (req as any).user = user;
        next();
    });
};

router.get('/', authMiddleware, getUsers);
router.delete('/:id', authMiddleware, deleteUser);
router.put('/:id', authMiddleware, updateUser);
router.post('/', authMiddleware, addUser);
router.get('/admin-email', authMiddleware, getAdminEmail);

export default router;