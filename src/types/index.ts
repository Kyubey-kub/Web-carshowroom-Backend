export interface User {
  id: number;
  name?: string;
  email: string; // ทำให้ email เป็น required
  password?: string;
  role: 'client' | 'admin';
  created_at?: Date; // เปลี่ยนเป็น created_at ให้ตรงกับ database
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

export interface DashboardData {
  registerData: { date: string; count: number }[];
  loginData: { date: string; count: number }[];
  totalRegisters: number;
  totalLogins: number;
}