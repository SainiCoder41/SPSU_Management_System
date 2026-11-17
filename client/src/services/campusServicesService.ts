import api from './api';
import {
  ILibraryBook,
  IBookIssue,
  IPlacementDrive,
  IPlacementApplication,
  IVisitorLog,
} from '../types/campusServices';

export const campusServices = {
  // Library
  getBooks: async (query?: string): Promise<ILibraryBook[]> => {
    const res = await api.get('/services/library/books', { params: { q: query } });
    return res.data.data;
  },

  getMyBorrowedBooks: async (): Promise<IBookIssue[]> => {
    const res = await api.get('/services/library/my-borrowed');
    return res.data.data;
  },

  issueBook: async (bookId: string, studentId: string): Promise<IBookIssue> => {
    const res = await api.post('/services/library/issue', { bookId, studentId });
    return res.data.data;
  },

  returnBook: async (issueId: string): Promise<IBookIssue> => {
    const res = await api.post(`/services/library/return/${issueId}`);
    return res.data.data;
  },

  // Placements
  getPlacementDrives: async (): Promise<IPlacementDrive[]> => {
    const res = await api.get('/services/placements/drives');
    return res.data.data;
  },

  applyForDrive: async (driveId: string, resumeUrl?: string): Promise<IPlacementApplication> => {
    const res = await api.post(`/services/placements/drives/${driveId}/apply`, { resumeUrl });
    return res.data.data;
  },

  // Visitors
  getVisitorLogs: async (status?: 'Inside' | 'CheckedOut'): Promise<IVisitorLog[]> => {
    const res = await api.get('/services/visitors', { params: { status } });
    return res.data.data;
  },

  checkInVisitor: async (data: any): Promise<IVisitorLog> => {
    const res = await api.post('/services/visitors/checkin', data);
    return res.data.data;
  },

  checkOutVisitor: async (logId: string): Promise<IVisitorLog> => {
    const res = await api.post(`/services/visitors/checkout/${logId}`);
    return res.data.data;
  },
};
