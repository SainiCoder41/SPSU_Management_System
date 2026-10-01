import { api } from './api.ts';

export const studentService = {
  async getStudents(params?: any) {
    const response = await api.get('/students', { params });
    return response.data;
  },

  async getStudentById(id: string) {
    const response = await api.get(`/students/${id}`);
    return response.data.data;
  },

  async getMyProfile() {
    const response = await api.get('/students/me/profile');
    return response.data.data;
  },

  async createStudent(studentData: any) {
    const response = await api.post('/students', studentData);
    return response.data.data;
  },

  async updateStudent(id: string, updateData: any) {
    const response = await api.patch(`/students/${id}`, updateData);
    return response.data.data;
  },
};
