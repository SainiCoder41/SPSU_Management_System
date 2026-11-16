import mongoose, { Schema, Document } from 'mongoose';

export interface IParentDocument extends Document {
  user: mongoose.Types.ObjectId;
  student: mongoose.Types.ObjectId;
  relation: string;
  occupation?: string;
  address?: string;
}

const ParentSchema = new Schema<IParentDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    student: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    relation: {
      type: String,
      required: true,
      default: 'Parent',
      trim: true,
    },
    occupation: {
      type: String,
      default: '',
    },
    address: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export const Parent = mongoose.model<IParentDocument>('Parent', ParentSchema);
