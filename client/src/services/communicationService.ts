import { api } from './api';
import { INotice, CreateNoticeInput, IAppNotification } from '../types/communication';

export const communicationService = {
  // Notices
  getNotices: async (): Promise<INotice[]> => {
    const res = await api.get('/notices');
    return res.data.data;
  },

  getNoticeById: async (id: string): Promise<INotice> => {
    const res = await api.get(`/notices/${id}`);
    return res.data.data;
  },

  publishNotice: async (payload: CreateNoticeInput): Promise<INotice> => {
    const res = await api.post('/notices', payload);
    return res.data.data;
  },

  archiveNotice: async (id: string): Promise<INotice> => {
    const res = await api.patch(`/notices/${id}/archive`);
    return res.data.data;
  },

  // Notifications
  getMyNotifications: async (): Promise<{ notifications: IAppNotification[]; unreadCount: number }> => {
    const res = await api.get('/notifications');
    return {
      notifications: res.data.data,
      unreadCount: res.data.unreadCount,
    };
  },

  markAsRead: async (id: string): Promise<IAppNotification> => {
    const res = await api.patch(`/notifications/${id}/read`);
    return res.data.data;
  },

  markAllAsRead: async (): Promise<void> => {
    await api.patch('/notifications/read-all');
  },
};
