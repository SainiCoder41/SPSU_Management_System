export type Role = 'ADMIN' | 'STUDENT' | 'FACULTY' | 'MENTOR' | 'WARDEN' | 'HOD' | 'PARENT';

export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: Role;
  phone?: string;
  avatar?: string;
  isActive?: boolean;
}

export interface Department {
  _id: string;
  name: string;
  code: string;
  description?: string;
  hod?: {
    _id: string;
    employeeId: string;
    user?: {
      _id: string;
      name: string;
      email: string;
      phone?: string;
    };
  };
  studentCount?: number;
  facultyCount?: number;
}

export interface Hostel {
  _id: string;
  name: string;
  type: 'BOYS' | 'GIRLS';
  capacity: number;
  occupancy: number;
  description?: string;
  warden?: {
    _id: string;
    employeeId: string;
    user?: {
      _id: string;
      name: string;
      email: string;
      phone?: string;
    };
  };
}

export interface Staff {
  _id: string;
  user: User;
  employeeId: string;
  department: Department;
  designation: string;
  specialization?: string;
  officeLocation?: string;
  joiningDate?: string;
}

export interface Student {
  _id: string;
  user: User;
  enrollmentNumber: string;
  rollNumber: string;
  program: string;
  department: Department;
  semester: number;
  section: string;
  cgpa: number;
  admissionYear: number;
  hostel?: Hostel;
  roomNumber?: string;
  mentor?: Staff;
  parent?: any;
}

export interface ParentRecord {
  _id: string;
  user: User;
  student: Student;
  relation: string;
  occupation?: string;
  address?: string;
}

export interface AdminStats {
  totalStudents: number;
  totalStaff: number;
  totalDepartments: number;
  totalHostels: number;
  hostelCapacity: number;
  hostelOccupancy: number;
  deptBreakdown: Array<{ code: string; name: string; count: number }>;
  recentStudents: Student[];
}
