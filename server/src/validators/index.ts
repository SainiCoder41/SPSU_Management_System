import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address format'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

export const studentCreateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional().default('Student@1234'),
  phone: z.string().optional(),
  enrollmentNumber: z.string().min(3, 'Enrollment number is required'),
  rollNumber: z.string().min(3, 'Roll number is required'),
  program: z.string().default('B.Tech'),
  department: z.string().min(1, 'Department ID is required'),
  semester: z.number().int().min(1).max(8),
  section: z.string().default('A'),
  cgpa: z.number().min(0).max(10).default(0.0),
  admissionYear: z.number().int().min(2000).max(2100).default(new Date().getFullYear()),
  hostel: z.string().optional().nullable(),
  roomNumber: z.string().optional().nullable(),
  mentor: z.string().optional().nullable(),
});

export const studentUpdateSchema = studentCreateSchema.partial();

export const staffCreateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional().default('Staff@1234'),
  phone: z.string().optional(),
  employeeId: z.string().min(2, 'Employee ID is required'),
  department: z.string().min(1, 'Department is required'),
  designation: z.string().min(2, 'Designation is required'),
  role: z.enum(['FACULTY', 'MENTOR', 'WARDEN', 'HOD', 'ADMIN']).default('FACULTY'),
  specialization: z.string().optional(),
  officeLocation: z.string().optional(),
});

export const staffUpdateSchema = staffCreateSchema.partial();

export const departmentSchema = z.object({
  name: z.string().min(2, 'Department name is required'),
  code: z.string().min(2, 'Department code is required'),
  hod: z.string().optional().nullable(),
  description: z.string().optional(),
});

export const hostelSchema = z.object({
  name: z.string().min(2, 'Hostel name is required'),
  type: z.enum(['BOYS', 'GIRLS']),
  warden: z.string().optional().nullable(),
  capacity: z.number().int().min(1).default(100),
  description: z.string().optional(),
});
