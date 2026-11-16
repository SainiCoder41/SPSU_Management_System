import { api } from './api';
import { Hostel } from '../types';

export const hostelService = {
  getHostels: async (): Promise<Hostel[]> => {
    const res = await api.get('/hostels');
    return res.data.data;
  },

  createHostel: async (payload: any): Promise<Hostel> => {
    const res = await api.post('/hostels', payload);
    return res.data.data;
  },

  updateHostel: async (id: string, payload: any): Promise<Hostel> => {
    const res = await api.put(`/hostels/${id}`, payload);
    return res.data.data;
  },
};
