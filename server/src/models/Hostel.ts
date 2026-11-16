import mongoose, { Schema, Document } from 'mongoose';

export interface IHostelDocument extends Document {
  name: string;
  type: 'BOYS' | 'GIRLS';
  warden?: mongoose.Types.ObjectId;
  capacity: number;
  occupancy: number;
  description?: string;
}

const HostelSchema = new Schema<IHostelDocument>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['BOYS', 'GIRLS'],
      required: true,
    },
    warden: {
      type: Schema.Types.ObjectId,
      ref: 'Staff',
      default: null,
    },
    capacity: {
      type: Number,
      required: true,
      default: 100,
    },
    occupancy: {
      type: Number,
      default: 0,
    },
    description: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export const Hostel = mongoose.model<IHostelDocument>('Hostel', HostelSchema);
