import { Request, Response, NextFunction } from 'express';
import db from '../config/db';
import { RowDataPacket } from 'mysql2';
import { User } from '../types';

interface AuthenticatedRequest extends Request {
    user?: User;
}

export const getUserActivity = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    try {
        if (!authReq.user || authReq.user.role !== 'admin') {
            res.status(403).json({ error: 'Access denied. Admins only.' });
            return;
        }

        const [logs] = await db.query<RowDataPacket[]>(
            "SELECT DATE(login_at) as date, COUNT(*) as count " +
            "FROM login_logs " +
            "WHERE login_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) " +
            "GROUP BY DATE(login_at) " +
            "ORDER BY date DESC"
        );

        res.status(200).json(logs);
    } catch (error: any) {
        console.error('Error in getUserActivity:', error);
        res.status(500).json({ error: 'Failed to generate user activity report' });
        return;
    }
};

export const getRegistrationTrends = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    try {
        if (!authReq.user || authReq.user.role !== 'admin') {
            res.status(403).json({ error: 'Access denied. Admins only.' });
            return;
        }

        const [trends] = await db.query<RowDataPacket[]>(
            "SELECT DATE_FORMAT(created_at, '%Y-%m') as date, COUNT(*) as count " +
            "FROM users " +
            "WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH) " +
            "GROUP BY DATE_FORMAT(created_at, '%Y-%m') " +
            "ORDER BY date DESC"
        );

        res.status(200).json(trends);
    } catch (error: any) {
        console.error('Error in getRegistrationTrends:', error);
        res.status(500).json({ error: 'Failed to generate registration trends report' });
        return;
    }
};