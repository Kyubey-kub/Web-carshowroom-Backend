export interface User {
  id: number;
  name?: string;
  username?: string;
  email: string;
  password?: string;
  role: 'client' | 'admin';
  created_at?: Date;
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

// JWT Payload Interface
export interface JwtPayload {
  id: number;
  email: string;
  role: 'client' | 'admin';
}