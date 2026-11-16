import { Event, IEventDocument } from '../models/Event.js';
import { Student } from '../models/Student.js';
import { User } from '../models/User.js';
import * as XLSX from 'xlsx';

export class EventService {
  static async createEvent(organizerId: string, data: any): Promise<IEventDocument> {
    const event = new Event({
      ...data,
      organizer: organizerId,
      registeredCount: 0,
      registrations: [],
    });
    await event.save();
    return event;
  }

  static async getEventsForUser(userId: string, role: string): Promise<IEventDocument[]> {
    const query: any = { status: { $ne: 'Cancelled' } };

    if (role === 'STUDENT') {
      const student = await Student.findOne({ user: userId });
      // Event is visible if targetAudience is empty OR matches role, department, semester (EVT-003)
      const events = await Event.find(query).populate('organizer', 'name email').sort({ dateTime: 1 });

      return events.filter((ev) => {
        const aud = ev.targetAudience;
        if (!aud) return true;

        if (aud.roles && aud.roles.length > 0 && !aud.roles.includes('STUDENT')) {
          return false;
        }

        if (student) {
          if (aud.departments && aud.departments.length > 0) {
            const hasDept = aud.departments.some(
              (d) => d.toString() === student.department?.toString()
            );
            if (!hasDept) return false;
          }

          if (aud.semesters && aud.semesters.length > 0) {
            if (!aud.semesters.includes(student.semester)) {
              return false;
            }
          }
        }

        return true;
      });
    }

    return Event.find(query).populate('organizer', 'name email').sort({ dateTime: 1 });
  }

  static async rsvpEvent(eventId: string, userId: string): Promise<IEventDocument> {
    const event = await Event.findById(eventId);
    if (!event) throw new Error('Event not found');

    if (!event.isRegistrationOpen || event.status !== 'Published') {
      throw new Error('Registration for this event is closed or unavailable');
    }

    const student = await Student.findOne({ user: userId });
    const existing = event.registrations.find((r) => r.user.toString() === userId);

    if (existing && existing.status === 'Confirmed') {
      throw new Error('You have already registered for this event');
    }

    if (event.registeredCount >= event.capacity) {
      throw new Error('Event capacity is full. Registration closed.');
    }

    if (existing) {
      existing.status = 'Confirmed';
      existing.registeredAt = new Date();
    } else {
      event.registrations.push({
        student: student ? (student._id as any) : null,
        user: userId as any,
        registeredAt: new Date(),
        status: 'Confirmed',
      });
    }

    event.registeredCount = event.registrations.filter((r) => r.status === 'Confirmed').length;
    await event.save();
    return event;
  }

  static async withdrawRsvp(eventId: string, userId: string): Promise<IEventDocument> {
    const event = await Event.findById(eventId);
    if (!event) throw new Error('Event not found');

    const reg = event.registrations.find((r) => r.user.toString() === userId && r.status === 'Confirmed');
    if (!reg) {
      throw new Error('No confirmed registration found to withdraw');
    }

    reg.status = 'Withdrawn';
    event.registeredCount = event.registrations.filter((r) => r.status === 'Confirmed').length;
    await event.save();
    return event;
  }

  static async exportParticipants(eventId: string): Promise<Buffer> {
    const event = await Event.findById(eventId)
      .populate('registrations.user', 'name email phone')
      .populate({
        path: 'registrations.student',
        populate: [{ path: 'department', select: 'name code' }, { path: 'hostel', select: 'name' }],
      });

    if (!event) throw new Error('Event not found');

    const rows = event.registrations
      .filter((r) => r.status === 'Confirmed')
      .map((r: any, idx: number) => ({
        'S.No': idx + 1,
        'Student Name': r.user?.name || '',
        'Email Address': r.user?.email || '',
        'Contact Phone': r.user?.phone || '',
        'Roll Number': r.student?.rollNumber || 'N/A',
        'Enrollment Number': r.student?.enrollmentNumber || 'N/A',
        'Department': r.student?.department?.code || '',
        'Semester': r.student?.semester || '',
        'Hostel': r.student?.hostel?.name || 'Day Scholar',
        'Registered At': new Date(r.registeredAt).toLocaleString(),
      }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Participants');

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }
}
