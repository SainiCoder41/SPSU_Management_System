import { api } from './api';
import { LeaveRequest, LeaveType, LeaveBalance, LeaveStatus } from '../types/leave';

export interface SubmitLeavePayload {
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  reason: string;
  emergencyContact?: string;
  attachmentUrl?: string;
}

export interface ReviewLeavePayload {
  action: 'Approved' | 'Rejected' | 'Returned';
  comments: string;
}

export const leaveService = {
  submitLeave: async (payload: SubmitLeavePayload): Promise<LeaveRequest> => {
    const res = await api.post('/leaves', payload);
    return res.data.data;
  },

  getMyLeaves: async (): Promise<LeaveRequest[]> => {
    const res = await api.get('/leaves/my');
    return res.data.data;
  },

  getMyBalances: async (): Promise<LeaveBalance[]> => {
    const res = await api.get('/leaves/balances');
    return res.data.data;
  },

  getPendingApprovals: async (): Promise<LeaveRequest[]> => {
    const res = await api.get('/leaves/pending');
    return res.data.data;
  },

  reviewLeave: async (id: string, payload: ReviewLeavePayload): Promise<LeaveRequest> => {
    const res = await api.post(`/leaves/${id}/review`, payload);
    return res.data.data;
  },

  cancelLeave: async (id: string, comment?: string): Promise<LeaveRequest> => {
    const res = await api.post(`/leaves/${id}/cancel`, { comment });
    return res.data.data;
  },

  getLeaveById: async (id: string): Promise<LeaveRequest> => {
    const res = await api.get(`/leaves/${id}`);
    return res.data.data;
  },

  getAllLeaves: async (params?: { status?: string; role?: string; leaveTypeId?: string }): Promise<LeaveRequest[]> => {
    const res = await api.get('/leaves', { params });
    return res.data.data;
  },

  getLeaveTypes: async (role?: string): Promise<LeaveType[]> => {
    const res = await api.get('/leaves/types', { params: { role } });
    return res.data.data;
  },

  createLeaveType: async (payload: any): Promise<LeaveType> => {
    const res = await api.post('/leaves/types', payload);
    return res.data.data;
  },
};
