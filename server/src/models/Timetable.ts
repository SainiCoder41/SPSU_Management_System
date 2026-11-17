import mongoose, { Schema, Document } from 'mongoose';

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';

export interface ITimetableSlot {
  dayOfWeek: DayOfWeek;
  startTime: string; // "09:00"
  endTime: string;   // "10:00"
  subject: mongoose.Types.ObjectId;
  faculty: mongoose.Types.ObjectId;
  room: string;
}

export interface ITimetableDocument extends Document {
  department: mongoose.Types.ObjectId;
  semester: number;
  section: string;
  academicYear: number;
  slots: ITimetableSlot[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TimetableSlotSchema = new Schema<ITimetableSlot>(
  {
    dayOfWeek: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      required: true,
    },
    startTime: {
      type: String,
      required: true,
      trim: true,
    },
    endTime: {
      type: String,
      required: true,
      trim: true,
    },
    subject: {
      type: Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    faculty: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    room: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: true }
);

const TimetableSchema = new Schema<ITimetableDocument>(
  {
    department: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      required: true,
      index: true,
    },
    semester: {
      type: Number,
      required: true,
      index: true,
    },
    section: {
      type: String,
      required: true,
      trim: true,
    },
    academicYear: {
      type: Number,
      required: true,
      default: () => new Date().getFullYear(),
    },
    slots: [TimetableSlotSchema],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

TimetableSchema.index({ department: 1, semester: 1, section: 1, academicYear: 1 }, { unique: true });

export const Timetable = mongoose.model<ITimetableDocument>('Timetable', TimetableSchema);
