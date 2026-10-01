export type UserRole =
  | 'ADMIN'
  | 'STUDENT'
  | 'FACULTY'
  | 'MENTOR'
  | 'WARDEN'
  | 'HOD'
  | 'PARENT';

export interface User {
  _id: string;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  fullName: string;
  email: string;
  phone?: string;
  role: UserRole;
  profileImage?: string | null;
  gender?: string;
  dateOfBirth?: string | null;
  isActive: boolean;
  lastLoginAt?: string | null;
}

export interface StudentProfile {
  _id: string;
  userId: User;
  enrollmentNumber: string;
  registrationNumber: string;
  admissionYear: number;
  academicYear: string;
  program: string;
  degree: string;
  branch: string;
  specialization?: string | null;
  semester: number;
  batch: string;
  section: string;
  rollNumber: string;
  currentStatus: 'ACTIVE' | 'GRADUATED' | 'SUSPENDED' | 'ALUMNI' | 'DROPPED';
  mentorId?: User | null;
  hostelId?: {
    _id: string;
    code: string;
    gender: string;
    wardenId?: User | null;
  } | null;
  parentIds?: Array<{
    _id: string;
    userId: User;
    relation: string;
  }>;
  attendanceSummary?: {
    percentage: number;
    lastUpdated: string;
  };
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
}

export interface Department {
  _id: string;
  name: string;
  code: string;
  description?: string | null;
  hodId?: User | null;
  isActive: boolean;
}

export interface Hostel {
  _id: string;
  code: string;
  gender: string;
  wardenId?: User | null;
  isActive: boolean;
  residentCount?: number;
}

export interface StaffProfile {
  _id: string;
  userId: User;
  employeeId: string;
  designation: string;
  departmentId?: Department | null;
  joiningDate?: string;
  employmentType: string;
  qualification?: string;
  specialization?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}
