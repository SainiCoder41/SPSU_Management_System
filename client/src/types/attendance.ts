export type AttendanceStatus = 'Present' | 'Absent' | 'Late' | 'OnLeave';

export interface Subject {
  _id: string;
  name: string;
  code: string;
  department: {
    _id: string;
    name: string;
    code: string;
  };
  semester: number;
  credits: number;
  type: 'Theory' | 'Practical' | 'Elective';
  isActive: boolean;
}

export interface TimetableSlot {
  _id?: string;
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  startTime: string;
  endTime: string;
  subject: Subject;
  faculty: {
    _id: string;
    name: string;
    email: string;
  };
  room: string;
}

export interface Timetable {
  _id: string;
  department: string;
  semester: number;
  section: string;
  academicYear: number;
  slots: TimetableSlot[];
  isActive: boolean;
}

export interface SubjectAttendanceStat {
  subject: Subject;
  totalClasses: number;
  attendedClasses: number;
  excusedLeaves: number;
  percentage: number;
}

export interface AttendanceSummary {
  studentId: string;
  totalClasses: number;
  attendedClasses: number;
  cumulativePercentage: number;
  isLowAttendance: boolean;
  subjectBreakdown: SubjectAttendanceStat[];
}

export interface LowAttendanceRecord {
  student: {
    _id: string;
    user: {
      name: string;
      email: string;
      phone?: string;
    };
    rollNumber: string;
    enrollmentNumber: string;
    department: {
      name: string;
      code: string;
    };
    semester: number;
    section: string;
    mentor?: {
      user: {
        name: string;
        email: string;
      };
    };
  };
  summary: AttendanceSummary;
}
