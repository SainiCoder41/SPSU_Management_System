import { api } from './api';
import { IStudentRiskProfile } from '../types/ai';

export const aiService = {
  getMentorMenteesRisk: async (): Promise<IStudentRiskProfile[]> => {
    const res = await api.get('/ai/risk/mentees');
    return res.data.data;
  },

  getDepartmentRisk: async (departmentId: string): Promise<IStudentRiskProfile[]> => {
    const res = await api.get(`/ai/risk/department/${departmentId}`);
    return res.data.data;
  },

  getStudentRisk: async (studentId: string): Promise<IStudentRiskProfile> => {
    const res = await api.get(`/ai/risk/student/${studentId}`);
    return res.data.data;
  },

  sendMessage: async (
    message: string
  ): Promise<{ response: string; source: 'KB' | 'STUDENT_CONTEXT' | 'GENERAL'; contextualData?: any }> => {
    const res = await api.post('/ai/chat', { message });
    return res.data;
  },
};
