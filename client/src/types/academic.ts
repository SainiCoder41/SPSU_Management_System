export interface CourseMarks {
  subject: {
    _id: string;
    name: string;
    code: string;
    credits: number;
    type: string;
  };
  internalMarks: number;
  midTermMarks: number;
  endTermMarks: number;
  totalMarks: number;
  grade: string;
  gradePoints: number;
  credits: number;
  isPassed: boolean;
}

export interface Marksheet {
  _id: string;
  student: string;
  department: {
    _id: string;
    name: string;
    code: string;
  };
  semester: number;
  academicYear: number;
  courses: CourseMarks[];
  totalCredits: number;
  earnedCredits: number;
  sgpa: number;
  cgpa: number;
  backlogs: number;
  isPublished: boolean;
  createdAt: string;
}

export interface StudentResultsSummary {
  student: any;
  currentCGPA: number;
  totalSemestersCompleted: number;
  marksheets: Marksheet[];
}

export interface DepartmentAnalytics {
  departmentId: string;
  totalStudents: number;
  avgCGPA: number;
  totalBacklogs: number;
  studentDistribution: {
    residential: number;
    dayScholar: number;
  };
  cgpaDistribution: {
    firstClassWithDistinction: number;
    firstClass: number;
    secondClass: number;
    needsImprovement: number;
  };
}

export interface DigitalIdCard {
  idCardNumber: string;
  studentName: string;
  rollNumber: string;
  enrollmentNumber: string;
  program: string;
  department: string;
  semester: number;
  bloodGroup: string;
  emergencyContact: string;
  hostelBlock: string;
  roomNumber: string;
  validUntil: string;
  issuedDate: string;
  verificationUrl: string;
  isVerified: boolean;
}
