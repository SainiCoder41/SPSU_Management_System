import mongoose, { Schema, Document } from 'mongoose';

export interface ILeaveTypeDocument extends Document {
  name: string;
  code: string;
  applicableRole: 'STUDENT' | 'STAFF' | 'ALL';
  defaultQuota: number;
  requiresAttachment: boolean;
  description?: string;
  isActive: boolean;
}

const LeaveTypeSchema = new Schema<ILeaveTypeDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    applicableRole: {
      type: String,
      enum: ['STUDENT', 'STAFF', 'ALL'],
      default: 'ALL',
    },
    defaultQuota: {
      type: Number,
      required: true,
      default: 15,
    },
    requiresAttachment: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const LeaveType = mongoose.model<ILeaveTypeDocument>('LeaveType', LeaveTypeSchema);
