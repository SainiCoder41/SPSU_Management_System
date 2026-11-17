import { api } from './api';
import {
  Marksheet,
  StudentResultsSummary,
  DepartmentAnalytics,
  DigitalIdCard,
} from '../types/academic';

export const academicService = {
  getMyResults: async (): Promise<StudentResultsSummary> => {
    const res = await api.get('/academics/my-results');
    return res.data.data;
  },

  getStudentResults: async (studentId: string): Promise<StudentResultsSummary> => {
    const res = await api.get(`/academics/student/${studentId}/results`);
    return res.data.data;
  },

  enterMarks: async (payload: {
    studentId: string;
    semester: number;
    academicYear?: number;
    courses: Array<{
      subjectId: string;
      internalMarks: number;
      midTermMarks: number;
      endTermMarks: number;
    }>;
  }): Promise<Marksheet> => {
    const res = await api.post('/academics/marks', payload);
    return res.data.data;
  },

  getDepartmentAnalytics: async (departmentId: string): Promise<DepartmentAnalytics> => {
    const res = await api.get(`/academics/analytics/department/${departmentId}`);
    return res.data.data;
  },

  getMyIdCard: async (): Promise<DigitalIdCard> => {
    const res = await api.get('/academics/my-id-card');
    return res.data.data;
  },

  getStudentIdCard: async (studentId: string): Promise<DigitalIdCard> => {
    const res = await api.get(`/academics/student/${studentId}/id-card`);
    return res.data.data;
  },
};
