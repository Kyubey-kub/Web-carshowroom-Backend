import { RequestHandler, Request, Response } from 'express';
import db from '../config/db';
import { RowDataPacket } from 'mysql2';

interface AuthenticatedRequest extends Request {
    user?: { id: number; email: string; role: string };
}

export const getUserActivity: RequestHandler = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
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

export const getRegistrationTrends: RequestHandler = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
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