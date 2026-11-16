import { api } from './api';

export const portalService = {
  getMentorMentees: async () => {
    const res = await api.get('/mentor/mentees');
    return res.data.data;
  },

  getWardenResidents: async () => {
    const res = await api.get('/warden/residents');
    return res.data.data;
  },

  getHodOverview: async () => {
    const res = await api.get('/hod/overview');
    return res.data.data;
  },

  getParentStudent: async () => {
    const res = await api.get('/parent/student');
    return res.data.data;
  },
};
