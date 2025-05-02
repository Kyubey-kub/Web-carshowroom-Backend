import { RequestHandler, Request, Response, NextFunction } from 'express';
import nodemailer from 'nodemailer';
import { WebSocketServer, WebSocket } from 'ws';
import db from '../config/db';
import { Contact } from '../types/index';
import { RowDataPacket } from 'mysql2';
import path from 'path';
import fs from 'fs';

// สร้าง WebSocket server
const wss = new WebSocketServer({ port: 8080 });

// เก็บการเชื่อมต่อของ Admin
const adminConnections: Set<WebSocket> = new Set();

wss.on('connection', (ws: WebSocket) => {
    console.log('New WebSocket connection');
    adminConnections.add(ws);

    ws.on('close', () => {
        console.log('WebSocket connection closed');
        adminConnections.delete(ws);
    });
});

// ส่งการแจ้งเตือนไปยัง Admin ผ่าน WebSocket
const notifyAdmins = (message: string) => {
    adminConnections.forEach((ws) => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'notification', message }));
        }
    });
};

// ตั้งค่า Nodemailer
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// ตรวจสอบ environment variables
const requiredEnvVars = ['EMAIL_USER', 'EMAIL_PASS', 'EMAIL_ADMIN'];
const missingEnvVars = requiredEnvVars.filter((varName) => !process.env[varName]);
if (missingEnvVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

// กำหนด interface สำหรับ req.body
interface ContactRequestBody {
    name: string;
    email: string;
    message: string;
    reply?: string; // เพิ่มสำหรับการตอบกลับ
}

// ใช้ Request จาก express และเพิ่ม file จาก multer
interface ContactRequest extends Request {
    body: ContactRequestBody;
    file?: Express.Multer.File;
}

export const sendContact: RequestHandler = async (req: ContactRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { name, email, message } = req.body;
        const file = req.file;

        if (!name || !email || !message) {
            res.status(400).json({ message: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            res.status(400).json({ message: 'รูปแบบอีเมลไม่ถูกต้อง' });
            return;
        }

        const filePath = file ? `/uploads/${file.filename}` : null;
        await db.query(
            'INSERT INTO contacts (name, email, message, file_name, created_at) VALUES (?, ?, ?, ?, NOW())',
            [name, email, message, filePath]
        );

        const mailOptions: nodemailer.SendMailOptions = {
            from: `"Contact Form" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_ADMIN!,
            subject: `New Contact Message from ${name}`,
            text: `
                Name: ${name}
                Email: ${email}
                Message: ${message}
                ${filePath ? `Attachment: ${filePath}` : ''}
            `,
            attachments: file
                ? [
                      {
                          filename: file.filename,
                          path: path.join(__dirname, '../../uploads', file.filename),
                      },
                  ]
                : undefined,
        };

        await transporter.sendMail(mailOptions);
        notifyAdmins(`New contact message from ${name}: ${message}`);

        res.status(200).json({ message: 'ส่งข้อความสำเร็จ' });
    } catch (error: any) {
        console.error('Error in sendContact:', error.message);
        res.status(500).json({ message: 'ไม่สามารถส่งข้อความได้', error: error.message });
        next(error);
    }
};

export const getContacts: RequestHandler = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const [rows] = await db.query<(RowDataPacket & Contact)[]>('SELECT * FROM contacts ORDER BY created_at DESC');
        res.status(200).json(rows);
    } catch (error: any) {
        console.error('Error fetching contacts:', error.message);
        res.status(500).json({ message: 'ไม่สามารถดึงข้อมูลข้อความได้', error: error.message });
        next(error);
    }
};

export const replyContact: RequestHandler = async (req: ContactRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;
        const { reply } = req.body;

        if (!id || !reply) {
            res.status(400).json({ message: 'ID และข้อความตอบกลับเป็นสิ่งจำเป็น' });
            return;
        }

        const [contact] = await db.query<(RowDataPacket & Contact)[]>('SELECT * FROM contacts WHERE id = ?', [id]);
        if (contact.length === 0) {
            res.status(404).json({ message: 'ข้อความไม่พบ' });
            return;
        }

        const mailOptions: nodemailer.SendMailOptions = {
            from: `"Admin" <${process.env.EMAIL_USER}>`,
            to: contact[0].email,
            subject: `Re: Your Message from ${contact[0].name}`,
            text: `Dear ${contact[0].name},\n\n${reply}\n\nBest regards,\nAdmin`,
        };

        await transporter.sendMail(mailOptions);
        await db.query('UPDATE contacts SET status = ? WHERE id = ?', ['replied', id]);
        notifyAdmins(`Replied to contact message from ${contact[0].name}`);

        res.status(200).json({ message: 'ตอบกลับข้อความสำเร็จ' });
    } catch (error: any) {
        console.error('Error in replyContact:', error.message);
        res.status(500).json({ message: 'ไม่สามารถตอบกลับข้อความได้', error: error.message });
        next(error);
    }
};

export const deleteContact: RequestHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;

        if (!id) {
            res.status(400).json({ message: 'ID เป็นสิ่งจำเป็น' });
            return;
        }

        const [contact] = await db.query<(RowDataPacket & Contact)[]>('SELECT file_name FROM contacts WHERE id = ?', [id]);
        if (contact.length === 0) {
            res.status(404).json({ message: 'ข้อความไม่พบ' });
            return;
        }

        if (contact[0].file_name) {
            const filePath = path.join(__dirname, '../../uploads', path.basename(contact[0].file_name));
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        await db.query('DELETE FROM contacts WHERE id = ?', [id]);
        res.status(200).json({ message: 'ลบข้อความสำเร็จ' });
    } catch (error: any) {
        console.error('Error in deleteContact:', error.message);
        res.status(500).json({ message: 'ไม่สามารถลบข้อความได้', error: error.message });
        next(error);
    }
};