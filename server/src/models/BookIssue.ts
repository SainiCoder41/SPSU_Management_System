import mongoose, { Schema, Document } from 'mongoose';

export type BookIssueStatus = 'Issued' | 'Returned' | 'Overdue';

export interface IBookIssueDocument extends Document {
  book: mongoose.Types.ObjectId;
  student: mongoose.Types.ObjectId;
  issuedBy: mongoose.Types.ObjectId;
  issueDate: Date;
  dueDate: Date;
  returnDate?: Date;
  fineAmount: number;
  finePaid: boolean;
  status: BookIssueStatus;
  createdAt: Date;
  updatedAt: Date;
}

const BookIssueSchema = new Schema<IBookIssueDocument>(
  {
    book: { type: Schema.Types.ObjectId, ref: 'LibraryBook', required: true, index: true },
    student: { type: Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    issuedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    issueDate: { type: Date, default: () => new Date() },
    dueDate: {
      type: Date,
      default: () => {
        const d = new Date();
        d.setDate(d.getDate() + 14); // 14 days standard borrowing duration
        return d;
      },
    },
    returnDate: { type: Date },
    fineAmount: { type: Number, default: 0, min: 0 },
    finePaid: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['Issued', 'Returned', 'Overdue'],
      default: 'Issued',
      index: true,
    },
  },
  { timestamps: true }
);

export const BookIssue = mongoose.model<IBookIssueDocument>('BookIssue', BookIssueSchema);
