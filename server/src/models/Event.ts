import mongoose, { Schema, Document } from 'mongoose';
import { Role } from '../types/index.js';

export interface IRegistration {
  student: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  registeredAt: Date;
  status: 'Confirmed' | 'Withdrawn';
}

export interface IEventDocument extends Document {
  title: string;
  description: string;
  category: 'Academic' | 'Cultural' | 'Sports' | 'Technical' | 'Workshop' | 'General';
  dateTime: Date;
  endDateTime: Date;
  venue: string;
  organizer: mongoose.Types.ObjectId;
  organizerDepartment?: mongoose.Types.ObjectId;
  targetAudience: {
    roles?: Role[];
    departments?: mongoose.Types.ObjectId[];
    semesters?: number[];
  };
  capacity: number;
  registeredCount: number;
  isRegistrationOpen: boolean;
  status: 'Draft' | 'Published' | 'Cancelled' | 'Archived';
  registrations: IRegistration[];
}

const EventSchema = new Schema<IEventDocument>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ['Academic', 'Cultural', 'Sports', 'Technical', 'Workshop', 'General'],
      default: 'General',
    },
    dateTime: {
      type: Date,
      required: true,
    },
    endDateTime: {
      type: Date,
      required: true,
    },
    venue: {
      type: String,
      required: true,
      trim: true,
    },
    organizer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    organizerDepartment: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      default: null,
    },
    targetAudience: {
      roles: [{ type: String }],
      departments: [{ type: Schema.Types.ObjectId, ref: 'Department' }],
      semesters: [{ type: Number }],
    },
    capacity: {
      type: Number,
      required: true,
      default: 100,
    },
    registeredCount: {
      type: Number,
      default: 0,
    },
    isRegistrationOpen: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ['Draft', 'Published', 'Cancelled', 'Archived'],
      default: 'Published',
    },
    registrations: [
      {
        student: { type: Schema.Types.ObjectId, ref: 'Student' },
        user: { type: Schema.Types.ObjectId, ref: 'User' },
        registeredAt: { type: Date, default: Date.now },
        status: { type: String, enum: ['Confirmed', 'Withdrawn'], default: 'Confirmed' },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Event = mongoose.model<IEventDocument>('Event', EventSchema);
