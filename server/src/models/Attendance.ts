import mongoose, { Schema, Document } from 'mongoose';

export type AttendanceStatus = 'Present' | 'Absent' | 'Late' | 'OnLeave';

export interface IStudentAttendanceEntry {
  student: mongoose.Types.ObjectId;
  status: AttendanceStatus;
  remarks?: string;
}

export interface IAttendanceDocument extends Document {
  subject: mongoose.Types.ObjectId;
  department: mongoose.Types.ObjectId;
  semester: number;
  section: string;
  faculty: mongoose.Types.ObjectId;
  date: Date;
  timeSlot: {
    startTime: string;
    endTime: string;
  };
  records: IStudentAttendanceEntry[];
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  onLeaveCount: number;
  isLocked: boolean; // After configured correction window (ATT-001)
  createdAt: Date;
  updatedAt: Date;
}

const StudentAttendanceEntrySchema = new Schema<IStudentAttendanceEntry>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    status: {
      type: String,
      enum: ['Present', 'Absent', 'Late', 'OnLeave'],
      default: 'Present',
    },
    remarks: {
      type: String,
      default: '',
    },
  },
  { _id: false }
);

const AttendanceSchema = new Schema<IAttendanceDocument>(
  {
    subject: {
      type: Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
      index: true,
    },
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
    faculty: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    timeSlot: {
      startTime: { type: String, required: true },
      endTime: { type: String, required: true },
    },
    records: [StudentAttendanceEntrySchema],
    totalStudents: { type: Number, default: 0 },
    presentCount: { type: Number, default: 0 },
    absentCount: { type: Number, default: 0 },
    onLeaveCount: { type: Number, default: 0 },
    isLocked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

AttendanceSchema.index({ subject: 1, section: 1, date: 1, 'timeSlot.startTime': 1 }, { unique: true });

export const Attendance = mongoose.model<IAttendanceDocument>('Attendance', AttendanceSchema);
