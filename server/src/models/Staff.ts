import mongoose, { Schema, Document } from 'mongoose';

export interface IStaffDocument extends Document {
  user: mongoose.Types.ObjectId;
  employeeId: string;
  department: mongoose.Types.ObjectId;
  designation: string;
  specialization?: string;
  officeLocation?: string;
  joiningDate?: Date;
}

const StaffSchema = new Schema<IStaffDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    employeeId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    department: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      required: true,
    },
    designation: {
      type: String,
      required: true,
      trim: true,
    },
    specialization: {
      type: String,
      default: '',
    },
    officeLocation: {
      type: String,
      default: '',
    },
    joiningDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const Staff = mongoose.model<IStaffDocument>('Staff', StaffSchema);
