import { api } from './api';
import { User } from '../types';

export interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
  user: User;
  profile?: any;
}

export const authService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', { email, password });
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  getMe: async (): Promise<{ user: User; profile: any }> => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};
