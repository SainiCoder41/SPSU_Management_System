import mongoose, { Schema, Document } from 'mongoose';

export interface ICourseMarks {
  subject: mongoose.Types.ObjectId;
  internalMarks: number;
  midTermMarks: number;
  endTermMarks: number;
  totalMarks: number;
  grade: string;
  gradePoints: number;
  credits: number;
  isPassed: boolean;
}

export interface IMarksheetDocument extends Document {
  student: mongoose.Types.ObjectId;
  department: mongoose.Types.ObjectId;
  semester: number;
  academicYear: string;
  courses: ICourseMarks[];
  totalCredits: number;
  earnedCredits: number;
  sgpa: number;
  cgpa: number;
  backlogs: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CourseMarksSchema = new Schema<ICourseMarks>(
  {
    subject: {
      type: Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    internalMarks: { type: Number, default: 0, min: 0, max: 50 },
    midTermMarks: { type: Number, default: 0, min: 0, max: 30 },
    endTermMarks: { type: Number, default: 0, min: 0, max: 60 },
    totalMarks: { type: Number, default: 0, min: 0, max: 100 },
    grade: { type: String, default: 'F' },
    gradePoints: { type: Number, default: 0 },
    credits: { type: Number, default: 3 },
    isPassed: { type: Boolean, default: false },
  },
  { _id: false }
);

const MarksheetSchema = new Schema<IMarksheetDocument>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
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
      index: true,
    },
    academicYear: {
      type: String,
      required: true,
      default: () => String(new Date().getFullYear()),
    },
    courses: [CourseMarksSchema],
    totalCredits: { type: Number, default: 0 },
    earnedCredits: { type: Number, default: 0 },
    sgpa: { type: Number, default: 0.0 },
    cgpa: { type: Number, default: 0.0 },
    backlogs: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

MarksheetSchema.index({ student: 1, semester: 1 }, { unique: true });

export const Marksheet = mongoose.model<IMarksheetDocument>('Marksheet', MarksheetSchema);
