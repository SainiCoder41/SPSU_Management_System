import { User, Role } from './index';

export type EventCategory = 'Academic' | 'Cultural' | 'Sports' | 'Technical' | 'Workshop' | 'General';

export interface EventRegistration {
  student?: any;
  user: User;
  registeredAt: string;
  status: 'Confirmed' | 'Withdrawn';
}

export interface CampusEvent {
  _id: string;
  title: string;
  description: string;
  category: EventCategory;
  dateTime: string;
  endDateTime: string;
  venue: string;
  organizer: User;
  organizerDepartment?: any;
  targetAudience?: {
    roles?: Role[];
    departments?: any[];
    semesters?: number[];
  };
  capacity: number;
  registeredCount: number;
  isRegistrationOpen: boolean;
  status: 'Draft' | 'Published' | 'Cancelled' | 'Archived';
  registrations: EventRegistration[];
  createdAt: string;
}
