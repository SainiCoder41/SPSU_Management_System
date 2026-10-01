import { api } from './api.ts';

export const hostelService = {
  async getHostels() {
    const response = await api.get('/hostels');
    return response.data.data;
  },

  async getHostelById(id: string) {
    const response = await api.get(`/hostels/${id}`);
    return response.data.data;
  },

  async assignWarden(id: string, wardenId: string) {
    const response = await api.patch(`/hostels/${id}/warden`, { wardenId });
    return response.data.data;
  },

  async getHostelStudents(id: string) {
    const response = await api.get(`/hostels/${id}/students`);
    return response.data.data;
  },
};
