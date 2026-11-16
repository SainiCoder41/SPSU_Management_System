import { api } from './api';
import { CampusEvent } from '../types/event';

export const eventService = {
  getEvents: async (): Promise<CampusEvent[]> => {
    const res = await api.get('/events');
    return res.data.data;
  },

  getEventById: async (id: string): Promise<CampusEvent> => {
    const res = await api.get(`/events/${id}`);
    return res.data.data;
  },

  createEvent: async (payload: any): Promise<CampusEvent> => {
    const res = await api.post('/events', payload);
    return res.data.data;
  },

  updateEvent: async (id: string, payload: any): Promise<CampusEvent> => {
    const res = await api.put(`/events/${id}`, payload);
    return res.data.data;
  },

  rsvpEvent: async (id: string): Promise<CampusEvent> => {
    const res = await api.post(`/events/${id}/rsvp`);
    return res.data.data;
  },

  withdrawRsvp: async (id: string): Promise<CampusEvent> => {
    const res = await api.post(`/events/${id}/withdraw`);
    return res.data.data;
  },

  getExportUrl: (id: string) => `/api/events/${id}/export`,
};
