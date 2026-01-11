import { z } from 'zod';

// Car validation schema
export const CarSchema = z.object({
  id: z.number().int().positive().optional(),
  vin: z.string().min(17).max(17).regex(/^[A-HJ-NPR-Z0-9]{17}$/i, 'Invalid VIN format'),
  make: z.string().min(1).max(100),
  model: z.string().min(1).max(100),
  year: z.number().int().min(1900).max(2100),
  price: z.number().nonnegative(),
  photoPath: z.string().max(500).optional().nullable(),
  notes: z.string().max(5000).optional().nullable(),
  status: z.enum(['available', 'sold', 'pending']),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export type CarInput = z.infer<typeof CarSchema>;

// Customer validation schema
export const CustomerSchema = z.object({
  id: z.number().int().positive().optional(),
  name: z.string().min(1).max(200),
  email: z.string().email().max(255).optional().nullable(),
  phone: z.string().max(50).optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  notes: z.string().max(5000).optional().nullable(),
  language: z.string().length(2).optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export type CustomerInput = z.infer<typeof CustomerSchema>;

// Sale validation schema
export const SaleSchema = z.object({
  id: z.number().int().positive().optional(),
  carId: z.number().int().positive(),
  customerId: z.number().int().positive(),
  saleDate: z.string().datetime(),
  price: z.number().nonnegative(),
  tax: z.number().nonnegative(),
  financing: z.string().max(500).optional().nullable(),
  invoicePath: z.string().max(500).optional().nullable(),
  notes: z.string().max(5000).optional().nullable(),
  createdAt: z.string().datetime().optional(),
});

export type SaleInput = z.infer<typeof SaleSchema>;

// Employee validation schema
export const EmployeeSchema = z.object({
  id: z.number().int().positive().optional(),
  name: z.string().min(1).max(200),
  email: z.string().email().max(255).optional().nullable(),
  phone: z.string().max(50).optional().nullable(),
  role: z.string().max(100).optional().nullable(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export type EmployeeInput = z.infer<typeof EmployeeSchema>;

// Lead validation schema
export const LeadSchema = z.object({
  id: z.number().int().positive().optional(),
  customerId: z.number().int().positive().optional().nullable(),
  source: z.string().max(200).optional().nullable(),
  status: z.enum(['new', 'contacted', 'qualified', 'converted', 'lost']),
  followUpDate: z.string().datetime().optional().nullable(),
  notes: z.string().max(5000).optional().nullable(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export type LeadInput = z.infer<typeof LeadSchema>;

// Shift validation schema
export const ShiftSchema = z.object({
  id: z.number().int().positive().optional(),
  employeeId: z.number().int().positive(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  notes: z.string().max(5000).optional().nullable(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
}).refine(
  (data) => new Date(data.endTime) > new Date(data.startTime),
  {
    message: 'End time must be after start time',
    path: ['endTime'],
  }
);

export type ShiftInput = z.infer<typeof ShiftSchema>;

// User validation schema
export const UserSchema = z.object({
  id: z.number().int().positive().optional(),
  username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  passwordHash: z.string().min(1),
  language: z.string().length(2).optional(),
  theme: z.enum(['light', 'dark']).optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export type UserInput = z.infer<typeof UserSchema>;

// Login schema (separate from User)
export const LoginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export type LoginInput = z.infer<typeof LoginSchema>;

// Search query validation
export const SearchQuerySchema = z.string().max(200).regex(/^[^\x00-\x1F]*$/, 'Invalid characters in search query');

// ID validation
export const IdSchema = z.number().int().positive();
