export interface User {
  id: number;
  name?: string;
  email?: string; // เปลี่ยนเป็น optional เพื่อให้เข้ากับ JWT payload
  password?: string;
  role: 'client' | 'admin';
  createdAt?: Date;
}

export interface Booking {
  id: number;
  userId: number;
  carId: number;
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