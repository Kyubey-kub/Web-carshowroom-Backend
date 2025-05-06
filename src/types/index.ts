export interface User {
  id: number; // เปลี่ยนจาก string เป็น number ให้ตรงกับ auth.ts และ database
  name?: string; // Optional เพื่อให้เข้ากับ auth.ts
  email: string; // ยังคง required
  password?: string; // Optional เพราะ auth.ts ไม่ใช้
  role: 'client' | 'admin';
  createdAt?: Date; // Optional เพราะ auth.ts ไม่ใช้
}

export interface Booking {
  id: number; // เปลี่ยนจาก string เป็น number
  userId: number; // เปลี่ยนจาก string เป็น number
  carId: number; // เปลี่ยนจาก string เป็น number
  startDate: Date;
  endDate: Date;
  status: 'pending' | 'confirmed' | 'canceled';
  createdAt: Date;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'pending' | 'replied';
  timestamp: Date;
}