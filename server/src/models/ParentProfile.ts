import mongoose, { Schema, Document, Types } from 'mongoose';
import { ParentRelation } from '../types';

export interface IParentProfile extends Document {
  userId: Types.ObjectId;
  relation: ParentRelation;
  occupation?: string | null;
  linkedStudents: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const ParentProfileSchema = new Schema<IParentProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    relation: {
      type: String,
      required: true,
      enum: ['FATHER', 'MOTHER', 'GUARDIAN'],
    },
    occupation: { type: String, default: null },
    linkedStudents: [{ type: Schema.Types.ObjectId, ref: 'StudentProfile' }],
  },
  { timestamps: true }
);

export const ParentProfile = mongoose.model<IParentProfile>('ParentProfile', ParentProfileSchema);
