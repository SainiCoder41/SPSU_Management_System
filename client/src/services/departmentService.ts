import { api } from './api';
import { Department } from '../types';

export const departmentService = {
  getDepartments: async (): Promise<Department[]> => {
    const res = await api.get('/departments');
    return res.data.data;
  },

  createDepartment: async (payload: any): Promise<Department> => {
    const res = await api.post('/departments', payload);
    return res.data.data;
  },

  updateDepartment: async (id: string, payload: any): Promise<Department> => {
    const res = await api.put(`/departments/${id}`, payload);
    return res.data.data;
  },
};
