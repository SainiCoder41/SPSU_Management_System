import mongoose, { Schema, Document, Types } from 'mongoose';
import { HostelCode } from '../types';

export interface IHostel extends Document {
  code: HostelCode;
  gender: 'MALE' | 'FEMALE';
  wardenId?: Types.ObjectId | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const HostelSchema = new Schema<IHostel>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      enum: ['BH1', 'BH2', 'BH3', 'BH4', 'GH1', 'GH2', 'GH3'],
      index: true,
    },
    gender: { type: String, required: true, enum: ['MALE', 'FEMALE'] },
    wardenId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Hostel = mongoose.model<IHostel>('Hostel', HostelSchema);
