import { api } from './api.ts';

export const adminService = {
  async getStats() {
    const response = await api.get('/admin/stats');
    return response.data.data;
  },

  async getUsers(params?: any) {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  async updateUserStatus(id: string, isActive: boolean) {
    const response = await api.patch(`/admin/users/${id}/status`, { isActive });
    return response.data.data;
  },

  async importStudents(formData: FormData) {
    const response = await api.post('/admin/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },
};
