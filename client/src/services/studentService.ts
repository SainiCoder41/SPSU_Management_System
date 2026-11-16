import { api } from './api';
import { Student } from '../types';

export interface StudentFilterParams {
  page?: number;
  limit?: number;
  department?: string;
  semester?: number;
  section?: string;
  hostel?: string;
  query?: string;
}

export interface StudentListResponse {
  success: boolean;
  data: Student[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const studentService = {
  getStudents: async (params?: StudentFilterParams): Promise<StudentListResponse> => {
    const res = await api.get('/students', { params });
    return res.data;
  },

  getStudentById: async (id: string): Promise<Student> => {
    const res = await api.get(`/students/${id}`);
    return res.data.data;
  },

  createStudent: async (payload: any): Promise<Student> => {
    const res = await api.post('/students', payload);
    return res.data.data;
  },

  updateStudent: async (id: string, payload: any): Promise<Student> => {
    const res = await api.put(`/students/${id}`, payload);
    return res.data.data;
  },

  deleteStudent: async (id: string): Promise<void> => {
    await api.delete(`/students/${id}`);
  },

  exportStudentsUrl: '/api/students/export',
};
