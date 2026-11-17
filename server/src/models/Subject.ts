import mongoose, { Schema, Document } from 'mongoose';

export type SubjectType = 'Theory' | 'Practical' | 'Elective';

export interface ISubjectDocument extends Document {
  name: string;
  code: string;
  department: mongoose.Types.ObjectId;
  semester: number;
  credits: number;
  type: SubjectType;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SubjectSchema = new Schema<ISubjectDocument>(
  {
    name: {
      type: String,
      required: [true, 'Please provide subject name'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Please provide subject code'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    department: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      required: true,
      index: true,
    },
    semester: {
      type: Number,
      required: true,
      min: 1,
      max: 8,
      index: true,
    },
    credits: {
      type: Number,
      required: true,
      default: 3,
      min: 1,
      max: 10,
    },
    type: {
      type: String,
      enum: ['Theory', 'Practical', 'Elective'],
      default: 'Theory',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const Subject = mongoose.model<ISubjectDocument>('Subject', SubjectSchema);
