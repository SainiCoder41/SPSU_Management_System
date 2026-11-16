import mongoose, { Schema, Document } from 'mongoose';

export type ComplaintStatus = 'Submitted' | 'Under Review' | 'Escalated' | 'Resolved' | 'Closed';
export type ComplaintCategory =
  | 'Academic'
  | 'Hostel'
  | 'Infrastructure'
  | 'Ragging / Harassment'
  | 'Canteen'
  | 'General';

export interface IComplaintNote {
  author: mongoose.Types.ObjectId;
  authorName: string;
  isInternal: boolean;
  text: string;
  createdAt: Date;
}

export interface IComplaintAuditEntry {
  actor: mongoose.Types.ObjectId;
  action: string;
  timestamp: Date;
  previousState: string;
  newState: string;
  comment: string;
}

export interface IComplaintDocument extends Document {
  ticketNumber: string;
  complainant: mongoose.Types.ObjectId;
  isAnonymous: boolean;
  category: ComplaintCategory;
  isSensitive: boolean;
  title: string;
  description: string;
  attachmentUrl?: string;
  assignedDepartment?: mongoose.Types.ObjectId;
  assignedOwner?: mongoose.Types.ObjectId;
  status: ComplaintStatus;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  resolutionNote?: string;
  notes: IComplaintNote[];
  auditTrail: IComplaintAuditEntry[];
}

const ComplaintSchema = new Schema<IComplaintDocument>(
  {
    ticketNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    complainant: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    category: {
      type: String,
      enum: ['Academic', 'Hostel', 'Infrastructure', 'Ragging / Harassment', 'Canteen', 'General'],
      required: true,
    },
    isSensitive: {
      type: Boolean,
      default: false,
      index: true,
    },
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
    attachmentUrl: {
      type: String,
      default: '',
    },
    assignedDepartment: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      default: null,
    },
    assignedOwner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    status: {
      type: String,
      enum: ['Submitted', 'Under Review', 'Escalated', 'Resolved', 'Closed'],
      default: 'Submitted',
      index: true,
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium',
    },
    resolutionNote: {
      type: String,
      default: '',
    },
    notes: [
      {
        author: { type: Schema.Types.ObjectId, ref: 'User' },
        authorName: { type: String, default: 'Staff' },
        isInternal: { type: Boolean, default: false },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    auditTrail: [
      {
        actor: { type: Schema.Types.ObjectId, ref: 'User' },
        action: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        previousState: { type: String, default: 'Draft' },
        newState: { type: String, required: true },
        comment: { type: String, default: '' },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Complaint = mongoose.model<IComplaintDocument>('Complaint', ComplaintSchema);
