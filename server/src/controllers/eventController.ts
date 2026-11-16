import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.js';
import { EventService } from '../services/eventService.js';
import { Event } from '../models/Event.js';

export const getEvents = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const events = await EventService.getEventsForUser(req.user!.id, req.user!.role);
    res.status(200).json({ success: true, count: events.length, data: events });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error fetching events' });
  }
};

export const getEventById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'name email role')
      .populate('organizerDepartment', 'name code');

    if (!event) {
      res.status(404).json({ success: false, message: 'Event not found' });
      return;
    }

    res.status(200).json({ success: true, data: event });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error fetching event details' });
  }
};

export const createEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const event = await EventService.createEvent(req.user!.id, req.body);
    res.status(201).json({ success: true, message: 'Campus event created successfully', data: event });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message || 'Error creating event' });
  }
};

export const updateEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      res.status(404).json({ success: false, message: 'Event not found' });
      return;
    }

    // Must be organizer or Admin
    if (event.organizer.toString() !== req.user!.id && req.user!.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'Only event organizer or Admin can modify this event' });
      return;
    }

    Object.assign(event, req.body);
    await event.save();

    res.status(200).json({ success: true, message: 'Event updated successfully', data: event });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message || 'Error updating event' });
  }
};

export const rsvpEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const event = await EventService.rsvpEvent(req.params.id, req.user!.id);
    res.status(200).json({ success: true, message: 'RSVP confirmed successfully', data: event });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message || 'RSVP failed' });
  }
};

export const withdrawRsvp = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const event = await EventService.withdrawRsvp(req.params.id, req.user!.id);
    res.status(200).json({ success: true, message: 'RSVP registration withdrawn', data: event });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message || 'Withdrawal failed' });
  }
};

export const exportParticipants = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const buffer = await EventService.exportParticipants(req.params.id);
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="event_${req.params.id}_participants.xlsx"`
    );
    res.send(buffer);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to export participants' });
  }
};
