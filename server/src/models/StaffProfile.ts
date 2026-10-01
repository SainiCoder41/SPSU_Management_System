import mongoose, { Schema, Document, Types } from 'mongoose';
import { EmploymentType } from '../types';

export interface IStaffProfile extends Document {
  userId: Types.ObjectId;
  employeeId: string;
  designation: string;
  departmentId?: Types.ObjectId | null;
  joiningDate?: Date;
  employmentType: EmploymentType;
  qualification?: string;
  specialization?: string;
  reportingHodId?: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const StaffProfileSchema = new Schema<IStaffProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    employeeId: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
    designation: { type: String, required: true, trim: true },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department', default: null, index: true },
    joiningDate: { type: Date, default: Date.now },
    employmentType: {
      type: String,
      required: true,
      enum: ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'VISITING'],
      default: 'FULL_TIME',
    },
    qualification: { type: String, default: '' },
    specialization: { type: String, default: '' },
    reportingHodId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

export const StaffProfile = mongoose.model<IStaffProfile>('StaffProfile', StaffProfileSchema);
