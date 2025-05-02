export interface User {
    id?: number;
    username: string;
    email: string;
    password: string;
    role?: 'admin' | 'client';
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
    bookingDate: string;
    status?: 'pending' | 'approved' | 'rejected';
    type: 'test_drive' | 'inquiry';
    message?: string;
}

export interface DashboardData {
    registerData: { date: string; count: number }[];
    loginData: { date: string; count: number }[];
    totalRegisters: number;
    totalLogins: number;
}