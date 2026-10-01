import mongoose, { Schema, Document, Types } from 'mongoose';
import { StudentStatus } from '../types';

export interface IStudentProfile extends Document {
  userId: Types.ObjectId;
  enrollmentNumber: string;
  registrationNumber: string;
  admissionYear: number;
  academicYear: string;
  program: string;
  degree: string;
  branch: string;
  specialization?: string | null;
  semester: number;
  batch: string;
  section: string;
  rollNumber: string;
  currentStatus: StudentStatus;
  mentorId?: Types.ObjectId | null;
  hostelId?: Types.ObjectId | null;
  parentIds: Types.ObjectId[];
  attendanceSummary?: {
    percentage?: number | null;
    lastUpdated?: Date | null;
  };
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
  emergencyContact?: {
    name?: string;
    relation?: string;
    phone?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const StudentProfileSchema = new Schema<IStudentProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    enrollmentNumber: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
    registrationNumber: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
    admissionYear: { type: Number, required: true },
    academicYear: { type: String, required: true, trim: true },
    program: { type: String, required: true, trim: true },
    degree: { type: String, required: true, trim: true },
    branch: { type: String, required: true, trim: true, index: true },
    specialization: { type: String, default: null, trim: true },
    semester: { type: Number, required: true, index: true },
    batch: { type: String, required: true, trim: true, index: true },
    section: { type: String, required: true, trim: true, index: true },
    rollNumber: { type: String, required: true, trim: true },
    currentStatus: {
      type: String,
      required: true,
      enum: ['ACTIVE', 'GRADUATED', 'SUSPENDED', 'ALUMNI', 'DROPPED'],
      default: 'ACTIVE',
    },
    mentorId: { type: Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    hostelId: { type: Schema.Types.ObjectId, ref: 'Hostel', default: null, index: true },
    parentIds: [{ type: Schema.Types.ObjectId, ref: 'ParentProfile' }],
    attendanceSummary: {
      percentage: { type: Number, default: 85 },
      lastUpdated: { type: Date, default: Date.now },
    },
    address: {
      line1: { type: String, default: '' },
      line2: { type: String, default: '' },
      city: { type: String, default: 'Udaipur' },
      state: { type: String, default: 'Rajasthan' },
      country: { type: String, default: 'India' },
      postalCode: { type: String, default: '' },
    },
    emergencyContact: {
      name: { type: String, default: '' },
      relation: { type: String, default: '' },
      phone: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

export const StudentProfile = mongoose.model<IStudentProfile>('StudentProfile', StudentProfileSchema);
