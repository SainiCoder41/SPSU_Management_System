import mongoose, { Schema, Document } from 'mongoose';
import { UserRole } from './User.js';

export type NoticePriority = 'Normal' | 'Important' | 'Urgent';
export type NoticeStatus = 'Draft' | 'Published' | 'Archived';

export interface INoticeDocument extends Document {
  title: string;
  body: string;
  priority: NoticePriority;
  isPinned: boolean;
  targetAudience: {
    roles?: UserRole[];
    departments?: mongoose.Types.ObjectId[];
    hostels?: mongoose.Types.ObjectId[];
    semesters?: number[];
  };
  attachmentUrl?: string;
  publisher: mongoose.Types.ObjectId;
  publishDate: Date;
  expiryDate?: Date;
  status: NoticeStatus;
  viewCount: number;
}

const NoticeSchema = new Schema<INoticeDocument>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    body: {
      type: String,
      required: true,
      trim: true,
    },
    priority: {
      type: String,
      enum: ['Normal', 'Important', 'Urgent'],
      default: 'Normal',
      index: true,
    },
    isPinned: {
      type: Boolean,
      default: false,
      index: true,
    },
    targetAudience: {
      roles: [{ type: String }],
      departments: [{ type: Schema.Types.ObjectId, ref: 'Department' }],
      hostels: [{ type: Schema.Types.ObjectId, ref: 'Hostel' }],
      semesters: [{ type: Number }],
    },
    attachmentUrl: {
      type: String,
      default: '',
    },
    publisher: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    publishDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    expiryDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['Draft', 'Published', 'Archived'],
      default: 'Published',
      index: true,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

NoticeSchema.index({ isPinned: -1, priority: -1, publishDate: -1 });

export const Notice = mongoose.model<INoticeDocument>('Notice', NoticeSchema);
