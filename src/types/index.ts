import { Request } from 'express';

export interface User {
  id: number;
  name: string;
  email?: string; // ทำให้ email เป็น optional
  password?: string;
  role: 'client' | 'admin';
  created_at?: Date;
}

export interface JwtPayload {
  id: number;
  email?: string; // ทำให้ email เป็น optional เพื่อความปลอดภัย
  role: 'client' | 'admin';
}

export interface AuthenticatedRequest extends Request {
  user?: User | JwtPayload;
}

export interface Car {
  id?: number;
  modelId: number;
  year: number;
  price: number;
  description: string;
  imageUrl: string;
  model3dUrl: string;
  status: 'available' | 'sold' | 'reserved';
  color?: string;
  mileage?: number;
  fuelType?: 'petrol' | 'diesel' | 'electric' | 'hybrid';
}

export interface Booking {
  id?: number;
  userId: number;
  carId: number;
  startDate?: Date;
  endDate?: Date;
  bookingDate?: string;
  status: 'pending' | 'confirmed' | 'canceled' | 'approved' | 'rejected';
  createdAt?: Date;
  type?: 'test_drive' | 'inquiry';
  message?: string;
}

export interface Contact {
  id?: number;
  user_id?: number;
  name: string;
  email: string;
  subject?: string;
  message: string;
  file_name?: string;
  status?: 'pending' | 'replied';
  timestamp?: Date;
}

export interface DashboardData {
  registerData: { date: string; count: number }[];
  loginData: { date: string; count: number }[];
  totalRegisters: number;
  totalLogins: number;
}