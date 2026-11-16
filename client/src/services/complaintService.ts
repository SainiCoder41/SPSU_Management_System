import { api } from './api';
import { IComplaint, CreateComplaintInput, ComplaintStatus } from '../types/complaint';

export const complaintService = {
  getMyComplaints: async (): Promise<IComplaint[]> => {
    const res = await api.get('/complaints/my');
    return res.data.data;
  },

  getComplaintsQueue: async (params?: {
    status?: ComplaintStatus;
    category?: string;
    sensitiveOnly?: boolean;
  }): Promise<IComplaint[]> => {
    const res = await api.get('/complaints/queue', { params });
    return res.data.data;
  },

  getComplaintById: async (id: string): Promise<IComplaint> => {
    const res = await api.get(`/complaints/${id}`);
    return res.data.data;
  },

  submitComplaint: async (payload: CreateComplaintInput): Promise<IComplaint> => {
    const res = await api.post('/complaints', payload);
    return res.data.data;
  },

  updateStatus: async (
    id: string,
    status: ComplaintStatus,
    resolutionNote?: string,
    comment?: string
  ): Promise<IComplaint> => {
    const res = await api.put(`/complaints/${id}/status`, {
      status,
      resolutionNote,
      comment,
    });
    return res.data.data;
  },

  addNote: async (id: string, text: string, isInternal: boolean = false): Promise<IComplaint> => {
    const res = await api.post(`/complaints/${id}/notes`, { text, isInternal });
    return res.data.data;
  },
};
