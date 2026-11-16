import { api } from './api';
import { PermissionRequest, PermissionType } from '../types/permission';

export interface SubmitPermissionPayload {
  permissionTypeId: string;
  startDateTime: string;
  endDateTime: string;
  destination: string;
  reason: string;
  emergencyContact: string;
}

export const permissionService = {
  getPermissionTypes: async (): Promise<PermissionType[]> => {
    const res = await api.get('/permissions/types');
    return res.data.data;
  },

  submitPermission: async (payload: SubmitPermissionPayload): Promise<PermissionRequest> => {
    const res = await api.post('/permissions', payload);
    return res.data.data;
  },

  getMyPermissions: async (): Promise<PermissionRequest[]> => {
    const res = await api.get('/permissions/my');
    return res.data.data;
  },

  getWardenQueue: async (): Promise<PermissionRequest[]> => {
    const res = await api.get('/permissions/warden-queue');
    return res.data.data;
  },

  getParentQueue: async (): Promise<PermissionRequest[]> => {
    const res = await api.get('/permissions/parent-queue');
    return res.data.data;
  },

  reviewWardenPermission: async (id: string, action: 'Approved' | 'Rejected', comments: string): Promise<PermissionRequest> => {
    const res = await api.post(`/permissions/${id}/warden-review`, { action, comments });
    return res.data.data;
  },

  signOffParentPermission: async (id: string, action: 'Approved' | 'Rejected', comments: string): Promise<PermissionRequest> => {
    const res = await api.post(`/permissions/${id}/parent-signoff`, { action, comments });
    return res.data.data;
  },

  cancelPermission: async (id: string): Promise<PermissionRequest> => {
    const res = await api.post(`/permissions/${id}/cancel`);
    return res.data.data;
  },
};
