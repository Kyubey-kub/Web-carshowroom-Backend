import { RequestHandler, Request, Response } from 'express';
import db from '../config/db';
import { RowDataPacket } from 'mysql2';
import bcrypt from 'bcryptjs';

interface AuthenticatedRequest extends Request {
    user?: { id: number; email: string; role: string };
}

export const getUsers: RequestHandler = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const [users] = await db.query<RowDataPacket[]>(
            'SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC'
        );
        
        // ดึงข้อมูลการล็อกอินล่าสุดของแต่ละผู้ใช้
        const [lastLogins] = await db.query<RowDataPacket[]>(
            'SELECT user_id, MAX(login_at) as last_login FROM login_logs GROUP BY user_id'
        );

        const usersWithStatus = users.map(user => {
            const lastLogin = lastLogins.find(log => log.user_id === user.id);
            const now = new Date();
            const lastLoginDate = lastLogin ? new Date(lastLogin.last_login) : null;
            const isActive = lastLoginDate && (now.getTime() - lastLoginDate.getTime()) / (1000 * 3600 * 24) <= 30;
            return {
                ...user,
                status: isActive ? 'Active' : 'Inactive',
            };
        });

        res.status(200).json(usersWithStatus);
    } catch (error: any) {
        console.error('Error in getUsers:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
        return;
    }
};

export const deleteUser: RequestHandler = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        if (req.user && req.user.id === parseInt(id)) {
            res.status(400).json({ error: 'Cannot delete your own account' });
            return;
        }

        const [user] = await db.query<RowDataPacket[]>(
            'SELECT * FROM users WHERE id = ?',
            [id]
        );

        if (user.length === 0) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        await db.query('DELETE FROM login_logs WHERE user_id = ?', [id]);
        await db.query('DELETE FROM users WHERE id = ?', [id]);

        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error: any) {
        console.error('Error in deleteUser:', error);
        res.status(500).json({ error: 'Failed to delete user' });
        return;
    }
};

export const getAdminEmail: RequestHandler = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const [admins] = await db.query<RowDataPacket[]>(
            'SELECT email FROM users WHERE role = "admin" LIMIT 1'
        );

        if (admins.length === 0) {
            res.status(404).json({ error: 'Admin user not found' });
            return;
        }

        res.status(200).json({ email: admins[0].email });
    } catch (error: any) {
        console.error('Error in getAdminEmail:', error);
        res.status(500).json({ error: 'Failed to fetch admin email' });
        return;
    }
};

export const updateUser: RequestHandler = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { name, email, role, password } = req.body;

        if (!name || !email || !role) {
            res.status(400).json({ error: 'Name, email, and role are required' });
            return;
        }

        const [user] = await db.query<RowDataPacket[]>(
            'SELECT * FROM users WHERE id = ?',
            [id]
        );

        if (user.length === 0) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        const updateFields: any = { name, email, role };
        if (password) {
            updateFields.password = await bcrypt.hash(password, 10);
        }

        await db.query(
            'UPDATE users SET name = ?, email = ?, role = ?, password = ? WHERE id = ?',
            [name, email, role, updateFields.password || user[0].password, id]
        );

        res.status(200).json({ message: 'User updated successfully' });
    } catch (error: any) {
        console.error('Error in updateUser:', error);
        res.status(500).json({ error: 'Failed to update user' });
        return;
    }
};

export const addUser: RequestHandler = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password || !role) {
            res.status(400).json({ error: 'Name, email, password, and role are required' });
            return;
        }

        const [existingUsers] = await db.query<RowDataPacket[]>(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (existingUsers.length > 0) {
            res.status(400).json({ error: 'Email already exists' });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await db.query(
            'INSERT INTO users (name, email, password, role, created_at) VALUES (?, ?, ?, ?, NOW())',
            [name, email, hashedPassword, role]
        );

        res.status(201).json({ message: 'User added successfully' });
    } catch (error: any) {
        console.error('Error in addUser:', error);
        res.status(500).json({ error: 'Failed to add user' });
        return;
    }
};