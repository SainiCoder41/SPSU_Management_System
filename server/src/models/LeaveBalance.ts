import mongoose, { Schema, Document } from 'mongoose';

export interface ILeaveBalanceDocument extends Document {
  user: mongoose.Types.ObjectId;
  leaveType: mongoose.Types.ObjectId;
  academicYear: number;
  totalQuota: number;
  usedDays: number;
  pendingDays: number;
  remainingDays: number;
}

const LeaveBalanceSchema = new Schema<ILeaveBalanceDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    leaveType: {
      type: Schema.Types.ObjectId,
      ref: 'LeaveType',
      required: true,
    },
    academicYear: {
      type: Number,
      required: true,
      default: () => new Date().getFullYear(),
    },
    totalQuota: {
      type: Number,
      required: true,
      default: 15,
    },
    usedDays: {
      type: Number,
      default: 0,
    },
    pendingDays: {
      type: Number,
      default: 0,
    },
    remainingDays: {
      type: Number,
      default: 15,
    },
  },
  {
    timestamps: true,
  }
);

LeaveBalanceSchema.index({ user: 1, leaveType: 1, academicYear: 1 }, { unique: true });

export const LeaveBalance = mongoose.model<ILeaveBalanceDocument>('LeaveBalance', LeaveBalanceSchema);
