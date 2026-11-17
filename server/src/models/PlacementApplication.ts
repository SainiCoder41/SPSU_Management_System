import mongoose, { Schema, Document } from 'mongoose';

export type JobApplicationStatus = 'Applied' | 'Shortlisted' | 'Selected' | 'Rejected';

export interface IPlacementApplicationDocument extends Document {
  drive: mongoose.Types.ObjectId;
  student: mongoose.Types.ObjectId;
  resumeUrl?: string;
  appliedDate: Date;
  status: JobApplicationStatus;
  feedback?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PlacementApplicationSchema = new Schema<IPlacementApplicationDocument>(
  {
    drive: { type: Schema.Types.ObjectId, ref: 'PlacementDrive', required: true, index: true },
    student: { type: Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    resumeUrl: { type: String, default: '' },
    appliedDate: { type: Date, default: () => new Date() },
    status: {
      type: String,
      enum: ['Applied', 'Shortlisted', 'Selected', 'Rejected'],
      default: 'Applied',
      index: true,
    },
    feedback: { type: String, default: '' },
  },
  { timestamps: true }
);

PlacementApplicationSchema.index({ drive: 1, student: 1 }, { unique: true });

export const PlacementApplication = mongoose.model<IPlacementApplicationDocument>(
  'PlacementApplication',
  PlacementApplicationSchema
);
