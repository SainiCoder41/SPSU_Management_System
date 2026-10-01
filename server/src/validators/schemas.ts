import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const createStudentSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  middleName: z.string().optional().nullable(),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  dateOfBirth: z.string().optional().nullable(),
  
  enrollmentNumber: z.string().min(1, 'Enrollment number is required'),
  registrationNumber: z.string().min(1, 'Registration number is required'),
  admissionYear: z.number().int().min(2000).max(2100),
  academicYear: z.string().min(1, 'Academic year is required'),
  program: z.string().min(1, 'Program is required'),
  degree: z.string().min(1, 'Degree is required'),
  branch: z.string().min(1, 'Branch is required'),
  specialization: z.string().optional().nullable(),
  semester: z.number().int().min(1).max(10),
  batch: z.string().min(1, 'Batch is required'),
  section: z.string().min(1, 'Section is required'),
  rollNumber: z.string().min(1, 'Roll number is required'),
  
  mentorId: z.string().optional().nullable(),
  hostelId: z.string().optional().nullable(),
  parentIds: z.array(z.string()).optional(),
});

export const createStaffSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  middleName: z.string().optional().nullable(),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  role: z.enum(['FACULTY', 'MENTOR', 'WARDEN', 'HOD']),
  
  employeeId: z.string().min(1, 'Employee ID is required'),
  designation: z.string().min(1, 'Designation is required'),
  departmentId: z.string().optional().nullable(),
  employmentType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'VISITING']).optional(),
  qualification: z.string().optional(),
  specialization: z.string().optional(),
});

export const createDepartmentSchema = z.object({
  name: z.string().min(1, 'Department name is required'),
  code: z.string().min(1, 'Department code is required'),
  description: z.string().optional().nullable(),
  hodId: z.string().optional().nullable(),
});

export const assignWardenSchema = z.object({
  wardenId: z.string().min(1, 'Warden User ID is required'),
});

export const assignHodSchema = z.object({
  hodId: z.string().min(1, 'HOD User ID is required'),
});
