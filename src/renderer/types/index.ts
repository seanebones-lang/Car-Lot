export interface Car {
  id?: number;
  vin: string;
  make: string;
  model: string;
  year: number;
  price: number;
  photoPath?: string;
  notes?: string;
  status: 'available' | 'sold' | 'pending';
  createdAt?: string;
  updatedAt?: string;
}

export interface Customer {
  id?: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  language?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Sale {
  id?: number;
  carId: number;
  customerId: number;
  saleDate: string;
  price: number;
  tax: number;
  financing?: string;
  invoicePath?: string;
  notes?: string;
  createdAt?: string;
}

export interface Employee {
  id?: number;
  name: string;
  email?: string;
  phone?: string;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Lead {
  id?: number;
  customerId?: number;
  source?: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  followUpDate?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  // Joined fields from database queries
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
}

export interface Shift {
  id?: number;
  employeeId: number;
  startTime: string;
  endTime: string;
  date: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  id?: number;
  username: string;
  passwordHash: string;
  language?: string;
  theme?: 'light' | 'dark';
  createdAt?: string;
  updatedAt?: string;
}
