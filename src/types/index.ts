import { Request } from 'express';
import { JwtPayload as JwtPayloadBase } from 'jsonwebtoken';

export interface User {
  id: number;
  name?: string;
  email: string; // required
  password?: string;
  role: 'client' | 'admin';
  created_at?: Date;
  iat?: number;
  exp?: number;
}

export interface JwtPayload extends JwtPayloadBase {
  id: number;
  email: string; // เปลี่ยนเป็น required เพื่อให้ตรงกับ User
  role: 'client' | 'admin';
  iat?: number;
  exp?: number;
}

export interface AuthenticatedRequest extends Request {
  user?: User; // ใช้ User เท่านั้น
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