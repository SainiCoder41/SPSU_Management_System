import mongoose, { Schema, Document } from 'mongoose';

export interface IDepartmentDocument extends Document {
  name: string;
  code: string;
  hod?: mongoose.Types.ObjectId;
  description?: string;
}

const DepartmentSchema = new Schema<IDepartmentDocument>(
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
    hod: {
      type: Schema.Types.ObjectId,
      ref: 'Staff',
      default: null,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export const Department = mongoose.model<IDepartmentDocument>('Department', DepartmentSchema);
