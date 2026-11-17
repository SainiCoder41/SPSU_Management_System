import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLogDocument extends Document {
  actor: mongoose.Types.ObjectId;
  actorRole: string;
  actorEmail?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  previousState?: any;
  newState?: any;
  comment?: string;
  ipAddress?: string;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLogDocument>(
  {
    actor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    actorRole: {
      type: String,
      required: true,
    },
    actorEmail: {
      type: String,
      default: '',
    },
    action: {
      type: String,
      required: true,
      index: true,
    },
    resourceType: {
      type: String,
      required: true,
      index: true,
    },
    resourceId: {
      type: String,
      default: '',
      index: true,
    },
    previousState: {
      type: Schema.Types.Mixed,
      default: null,
    },
    newState: {
      type: Schema.Types.Mixed,
      default: null,
    },
    comment: {
      type: String,
      default: '',
    },
    ipAddress: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

AuditLogSchema.index({ resourceType: 1, resourceId: 1, createdAt: -1 });

export const AuditLog = mongoose.model<IAuditLogDocument>('AuditLog', AuditLogSchema);
