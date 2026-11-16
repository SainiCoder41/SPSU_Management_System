import mongoose, { Schema, Document } from 'mongoose';

export interface IPermissionTypeDocument extends Document {
  name: string;
  code: string;
  requiresWardenSignOff: boolean;
  requiresParentSignOff: boolean;
  maxDurationHours: number;
  description?: string;
  isActive: boolean;
}

const PermissionTypeSchema = new Schema<IPermissionTypeDocument>(
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
    requiresWardenSignOff: {
      type: Boolean,
      default: true,
    },
    requiresParentSignOff: {
      type: Boolean,
      default: false,
    },
    maxDurationHours: {
      type: Number,
      default: 24,
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

export const PermissionType = mongoose.model<IPermissionTypeDocument>('PermissionType', PermissionTypeSchema);
