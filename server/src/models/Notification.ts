import mongoose, { Schema, Document } from 'mongoose';

export type NotificationSourceModule = 'Leave' | 'Event' | 'Permission' | 'Complaint' | 'Notice' | 'System';

export interface INotificationDocument extends Document {
  recipient: mongoose.Types.ObjectId;
  title: string;
  message: string;
  sourceModule: NotificationSourceModule;
  link?: string;
  isRead: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotificationDocument>(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    sourceModule: {
      type: String,
      enum: ['Leave', 'Event', 'Permission', 'Complaint', 'Notice', 'System'],
      default: 'System',
    },
    link: {
      type: String,
      default: '',
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

NotificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

export const Notification = mongoose.model<INotificationDocument>('Notification', NotificationSchema);
