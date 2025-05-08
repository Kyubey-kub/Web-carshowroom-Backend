import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions, JwtPayload } from 'jsonwebtoken';
import db from '../config/db';
import { RowDataPacket } from 'mysql2';
import { DashboardData, User } from '../types';

// ปรับ AuthenticatedRequest ให้รองรับ User และ JwtPayload
interface AuthenticatedRequest extends Request {
  user?: (User | JwtPayload) & { id: number; email: string; role: string };
}

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment variables');
}

// ฟังก์ชันช่วยแปลง string เช่น '1h', '30m' เป็นจำนวนวินาที
function parseExpiresIn(value: string): number {
  const match = value.match(/^(\d+)([smhdwMy])$/);
  if (!match) {
    return 3600; // ค่าเริ่มต้น 1 ชั่วโมงถ้ารูปแบบไม่ถูกต้อง
  }

  const num = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case 's': return num; // วินาที
    case 'm': return num * 60; // นาที
    case 'h': return num * 3600; // ชั่วโมง
    case 'd': return num * 86400; // วัน
    case 'w': return num * 604800; // สัปดาห์
    case 'M': return num * 2592000; // เดือน (30 วัน)
    case 'y': return num * 31536000; // ปี
    default: return 3600; // ค่าเริ่มต้น
  }
}

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { email, password, role, username } = req.body;

  if (!email || !password || !username) {
    res.status(400).json({ error: 'Username, email, and password are required' });
    return;
  }

  const userRole = role && ['admin', 'client'].includes(role) ? role : 'client';

  try {
    const [existingUsers] = await db.query<RowDataPacket[]>(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      res.status(400).json({ error: 'Email already exists' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      'INSERT INTO users (username, email, password, role, created_at) VALUES (?, ?, ?, ?, NOW())',
      [username, email, hashedPassword, userRole]
    );

    const userId = (result as any).insertId;

    const [newUser] = await db.query<(RowDataPacket & User)[]>(
      'SELECT id, username, email, role, created_at FROM users WHERE id = ?',
      [userId]
    );

    if (newUser.length === 0) {
      res.status(500).json({ error: 'Failed to retrieve newly registered user' });
      return;
    }

    const user = newUser[0];
    const token = generateJwtToken(user);

    await db.query(
      'INSERT INTO login_logs (user_id, role, login_at) VALUES (?, ?, NOW())',
      [user.id, user.role]
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: user.id, username: user.username, email: user.email, role: user.role },
    });
  } catch (error: any) {
    console.error('Error in register:', error);
    res.status(500).json({ error: 'Failed to register user' });
    return;
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

  try {
    const [users] = await db.query<(RowDataPacket & User)[]>(
      'SELECT id, username, email, role, password, created_at FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const user = users[0];
    if (!user.password) {
      res.status(500).json({ error: 'User password is not defined' });
      return;
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const token = generateJwtToken(user);

    await db.query(
      'INSERT INTO login_logs (user_id, role, login_at) VALUES (?, ?, NOW())',
      [user.id, user.role]
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: { id: user.id, username: user.username, email: user.email, role: user.role },
    });
  } catch (error: any) {
    console.error('Error in login:', error);
    res.status(500).json({ error: 'Failed to login' });
    return;
  }
};

export const getDashboardData = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    console.log('Fetching dashboard data for user:', req.user);
    const [registerData] = await db.query<RowDataPacket[]>(
      "SELECT DATE(created_at) as date, COUNT(*) as count FROM users WHERE role = 'client' GROUP BY DATE(created_at) ORDER BY date DESC LIMIT 7"
    );

    const [loginData] = await db.query<RowDataPacket[]>(
      "SELECT DATE(login_at) as date, COUNT(*) as count FROM login_logs WHERE role = 'client' GROUP BY DATE(login_at) ORDER BY date DESC LIMIT 7"
    );

    const [totalRegisters] = await db.query<RowDataPacket[]>(
      "SELECT COUNT(*) as total FROM users WHERE role = 'client'"
    );

    const [totalLogins] = await db.query<RowDataPacket[]>(
      "SELECT COUNT(*) as total FROM login_logs WHERE role = 'client'"
    );

    const dashboardData: DashboardData = {
      registerData: registerData.map(row => ({ date: row.date, count: row.count })),
      loginData: loginData.map(row => ({ date: row.date, count: row.count })),
      totalRegisters: totalRegisters[0].total,
      totalLogins: totalLogins[0].total,
    };

    res.status(200).json(dashboardData);
  } catch (error: any) {
    console.error('Error in getDashboardData:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
    return;
  }
};

export const getRecentActivity = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const [logs] = await db.query<RowDataPacket[]>(
      'SELECT users.username, login_logs.role, login_logs.login_at ' +
      'FROM login_logs JOIN users ON login_logs.user_id = users.id ' +
      'ORDER BY login_logs.login_at DESC LIMIT 3'
    );

    const activities = logs.map(log => ({
      message: `User ${log.username} (${log.role}) logged in`,
      timestamp: log.login_at,
    }));

    res.status(200).json(activities);
  } catch (error: any) {
    console.error('Error in getRecentActivity:', error);
    res.status(500).json({ error: 'Failed to fetch recent activity' });
    return;
  }
};

// ฟังก์ชันช่วยสร้าง JWT token
function generateJwtToken(user: User): string {
  let expiresIn: number = 3600; // ค่าเริ่มต้น 3600 วินาที (1 ชั่วโมง)
  if (process.env.JWT_EXPIRES_IN) {
    const envExpiresIn = process.env.JWT_EXPIRES_IN;
    if (!isNaN(Number(envExpiresIn))) {
      expiresIn = Number(envExpiresIn); // จำนวนวินาที
    } else if (/^\d+[smhdwMy]$/.test(envExpiresIn)) {
      expiresIn = parseExpiresIn(envExpiresIn); // แปลง '1h', '30m' เป็นวินาที
    } else {
      console.warn('รูปแบบ JWT_EXPIRES_IN ไม่ถูกต้อง ใช้ค่าเริ่มต้น 3600 วินาที');
    }
  }

  const signOptions: SignOptions = { expiresIn };
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET as string,
    signOptions
  );
}