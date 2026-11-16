import mongoose, { Schema, Document } from 'mongoose';

export interface IStudentDocument extends Document {
  user: mongoose.Types.ObjectId;
  enrollmentNumber: string;
  rollNumber: string;
  program: string;
  department: mongoose.Types.ObjectId;
  semester: number;
  section: string;
  cgpa: number;
  admissionYear: number;
  hostel?: mongoose.Types.ObjectId;
  roomNumber?: string;
  mentor?: mongoose.Types.ObjectId;
  parent?: mongoose.Types.ObjectId;
}

const StudentSchema = new Schema<IStudentDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    enrollmentNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    rollNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    program: {
      type: String,
      required: true,
      default: 'B.Tech',
      trim: true,
    },
    department: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      required: true,
    },
    semester: {
      type: Number,
      required: true,
      min: 1,
      max: 8,
    },
    section: {
      type: String,
      required: true,
      trim: true,
      default: 'A',
    },
    cgpa: {
      type: Number,
      min: 0,
      max: 10,
      default: 0.0,
    },
    admissionYear: {
      type: Number,
      required: true,
      default: () => new Date().getFullYear(),
    },
    hostel: {
      type: Schema.Types.ObjectId,
      ref: 'Hostel',
      default: null,
    },
    roomNumber: {
      type: String,
      default: '',
    },
    mentor: {
      type: Schema.Types.ObjectId,
      ref: 'Staff',
      default: null,
    },
    parent: {
      type: Schema.Types.ObjectId,
      ref: 'Parent',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const Student = mongoose.model<IStudentDocument>('Student', StudentSchema);
