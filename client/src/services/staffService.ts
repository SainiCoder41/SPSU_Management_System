import { api } from './api';
import { Staff } from '../types';

export const staffService = {
  getStaff: async (params?: { department?: string; role?: string; search?: string }): Promise<Staff[]> => {
    const res = await api.get('/staff', { params });
    return res.data.data;
  },

  getStaffById: async (id: string): Promise<Staff> => {
    const res = await api.get(`/staff/${id}`);
    return res.data.data;
  },

  createStaff: async (payload: any): Promise<Staff> => {
    const res = await api.post('/staff', payload);
    return res.data.data;
  },

  updateStaff: async (id: string, payload: any): Promise<Staff> => {
    const res = await api.put(`/staff/${id}`, payload);
    return res.data.data;
  },
};
