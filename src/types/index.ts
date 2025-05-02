export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'client' | 'admin';
  createdAt: Date;
}

export interface Booking {
  id: string;
  userId: string;
  carId: string;
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