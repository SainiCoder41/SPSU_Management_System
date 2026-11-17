import { api } from './api';
import {
  AttendanceSummary,
  Subject,
  Timetable,
  LowAttendanceRecord,
  AttendanceStatus,
} from '../types/attendance';

export const attendanceService = {
  getMyAttendance: async (): Promise<AttendanceSummary> => {
    const res = await api.get('/attendance/my');
    return res.data.data;
  },

  getStudentAttendance: async (studentId: string): Promise<AttendanceSummary> => {
    const res = await api.get(`/attendance/student/${studentId}`);
    return res.data.data;
  },

  getLowAttendance: async (params?: { departmentId?: string; threshold?: number }): Promise<LowAttendanceRecord[]> => {
    const res = await api.get('/attendance/low-attendance', { params });
    return res.data.data;
  },

  markAttendance: async (payload: {
    subjectId: string;
    departmentId: string;
    semester: number;
    section: string;
    date: string;
    startTime: string;
    endTime: string;
    records: Array<{ studentId: string; status: AttendanceStatus; remarks?: string }>;
  }) => {
    const res = await api.post('/attendance/mark', payload);
    return res.data.data;
  },

  getSubjects: async (params?: { department?: string; semester?: number }): Promise<Subject[]> => {
    const res = await api.get('/attendance/subjects', { params });
    return res.data.data;
  },

  createSubject: async (payload: Partial<Subject>): Promise<Subject> => {
    const res = await api.post('/attendance/subjects', payload);
    return res.data.data;
  },

  getTimetable: async (params: { department: string; semester: number; section: string }): Promise<Timetable | null> => {
    const res = await api.get('/attendance/timetable', { params });
    return res.data.data;
  },

  saveTimetable: async (payload: any): Promise<Timetable> => {
    const res = await api.post('/attendance/timetable', payload);
    return res.data.data;
  },
};
