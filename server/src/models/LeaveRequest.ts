import mongoose, { Schema, Document } from 'mongoose';
import { Role } from '../types/index.js';

export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected' | 'Returned' | 'Cancelled';

export interface IApprovalStep {
  approver: mongoose.Types.ObjectId;
  role: Role;
  action: 'Submitted' | 'Approved' | 'Rejected' | 'Returned' | 'Cancelled';
  actionDate: Date;
  comments: string;
}

export interface IAuditEntry {
  actor: mongoose.Types.ObjectId;
  action: string;
  timestamp: Date;
  previousState: string;
  newState: string;
  comment: string;
}

export interface ILeaveRequestDocument extends Document {
  applicant: mongoose.Types.ObjectId;
  applicantRole: Role;
  leaveType: mongoose.Types.ObjectId;
  startDate: Date;
  endDate: Date;
  numberOfDays: number;
  reason: string;
  emergencyContact?: string;
  attachmentUrl?: string;
  status: LeaveStatus;
  currentApprover?: mongoose.Types.ObjectId;
  approvalHistory: IApprovalStep[];
  auditTrail: IAuditEntry[];
}

const LeaveRequestSchema = new Schema<ILeaveRequestDocument>(
  {
    applicant: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    applicantRole: {
      type: String,
      enum: ['STUDENT', 'FACULTY', 'MENTOR', 'WARDEN', 'HOD', 'ADMIN', 'PARENT'],
      required: true,
    },
    leaveType: {
      type: Schema.Types.ObjectId,
      ref: 'LeaveType',
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    numberOfDays: {
      type: Number,
      required: true,
      min: 1,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    emergencyContact: {
      type: String,
      default: '',
    },
    attachmentUrl: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected', 'Returned', 'Cancelled'],
      default: 'Pending',
      index: true,
    },
    currentApprover: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
      default: null,
    },
    approvalHistory: [
      {
        approver: { type: Schema.Types.ObjectId, ref: 'User' },
        role: { type: String },
        action: { type: String, enum: ['Submitted', 'Approved', 'Rejected', 'Returned', 'Cancelled'] },
        actionDate: { type: Date, default: Date.now },
        comments: { type: String, default: '' },
      },
    ],
    auditTrail: [
      {
        actor: { type: Schema.Types.ObjectId, ref: 'User' },
        action: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        previousState: { type: String, required: true },
        newState: { type: String, required: true },
        comment: { type: String, default: '' },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const LeaveRequest = mongoose.model<ILeaveRequestDocument>('LeaveRequest', LeaveRequestSchema);
