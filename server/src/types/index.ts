export type Role =
  | 'ADMIN'
  | 'STUDENT'
  | 'FACULTY'
  | 'MENTOR'
  | 'WARDEN'
  | 'HOD'
  | 'PARENT'
  | 'COMPLAINT_OWNER'
  | 'DESIGNATED_AUTHORITY';

export interface IUser {
  _id: string;
  name: string;
  email: string;
  password?: string;
  role: Role;
  secondaryRoles?: Role[];
  phone?: string;
  isActive: boolean;
  avatar?: string;
  failedLoginAttempts?: number;
  lockUntil?: Date;
  passwordChangedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDepartment {
  _id: string;
  name: string;
  code: string;
  hod?: any;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IHostel {
  _id: string;
  name: string;
  type: 'BOYS' | 'GIRLS';
  warden?: any;
  capacity: number;
  occupancy: number;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IStaff {
  _id: string;
  user: any;
  employeeId: string;
  department: any;
  designation: string;
  specialization?: string;
  officeLocation?: string;
  joiningDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IStudent {
  _id: string;
  user: any;
  enrollmentNumber: string;
  rollNumber: string;
  program: string;
  department: any;
  semester: number;
  section: string;
  cgpa: number;
  admissionYear: number;
  hostel?: any;
  roomNumber?: string;
  mentor?: any;
  parent?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface IParent {
  _id: string;
  user: any;
  student: any;
  relation: string;
  occupation?: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}
