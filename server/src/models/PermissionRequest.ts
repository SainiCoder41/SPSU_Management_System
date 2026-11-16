import mongoose, { Schema, Document } from 'mongoose';

export type PermissionStatus = 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';

export interface ISignOff {
  signee?: mongoose.Types.ObjectId;
  status: 'Pending' | 'Approved' | 'Rejected';
  actionDate?: Date;
  comments?: string;
}

export interface IPermissionAuditEntry {
  actor: mongoose.Types.ObjectId;
  action: string;
  timestamp: Date;
  previousState: string;
  newState: string;
  comment: string;
}

export interface IPermissionRequestDocument extends Document {
  applicant: mongoose.Types.ObjectId;
  student: mongoose.Types.ObjectId;
  permissionType: mongoose.Types.ObjectId;
  startDateTime: Date;
  endDateTime: Date;
  destination: string;
  reason: string;
  emergencyContact: string;
  hasLeaveConflict: boolean;
  leaveConflictDetails?: string;
  status: PermissionStatus;
  wardenSignOff: ISignOff;
  parentSignOff: ISignOff;
  auditTrail: IPermissionAuditEntry[];
}

const PermissionRequestSchema = new Schema<IPermissionRequestDocument>(
  {
    applicant: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    student: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      index: true,
    },
    permissionType: {
      type: Schema.Types.ObjectId,
      ref: 'PermissionType',
      required: true,
    },
    startDateTime: {
      type: Date,
      required: true,
    },
    endDateTime: {
      type: Date,
      required: true,
    },
    destination: {
      type: String,
      required: true,
      trim: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    emergencyContact: {
      type: String,
      required: true,
      trim: true,
    },
    hasLeaveConflict: {
      type: Boolean,
      default: false,
    },
    leaveConflictDetails: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected', 'Cancelled'],
      default: 'Pending',
      index: true,
    },
    wardenSignOff: {
      signee: { type: Schema.Types.ObjectId, ref: 'User' },
      status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
      actionDate: { type: Date },
      comments: { type: String, default: '' },
    },
    parentSignOff: {
      signee: { type: Schema.Types.ObjectId, ref: 'User' },
      status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
      actionDate: { type: Date },
      comments: { type: String, default: '' },
    },
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

export const PermissionRequest = mongoose.model<IPermissionRequestDocument>(
  'PermissionRequest',
  PermissionRequestSchema
);
