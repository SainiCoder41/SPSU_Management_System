import { api } from './api.ts';

export const departmentService = {
  async getDepartments() {
    const response = await api.get('/departments');
    return response.data.data;
  },

  async getDepartmentById(id: string) {
    const response = await api.get(`/departments/${id}`);
    return response.data.data;
  },

  async createDepartment(data: any) {
    const response = await api.post('/departments', data);
    return response.data.data;
  },

  async assignHod(id: string, hodId: string) {
    const response = await api.patch(`/departments/${id}/hod`, { hodId });
    return response.data.data;
  },
};
