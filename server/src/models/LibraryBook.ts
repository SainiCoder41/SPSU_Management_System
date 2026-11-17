import mongoose, { Schema, Document } from 'mongoose';

export interface ILibraryBookDocument extends Document {
  title: string;
  author: string;
  isbn: string;
  category: string;
  totalCopies: number;
  availableCopies: number;
  shelfLocation: string;
  createdAt: Date;
  updatedAt: Date;
}

const LibraryBookSchema = new Schema<ILibraryBookDocument>(
  {
    title: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },
    isbn: { type: String, required: true, unique: true, trim: true },
    category: { type: String, default: 'Computer Science & Engineering', trim: true },
    totalCopies: { type: Number, default: 5, min: 1 },
    availableCopies: { type: Number, default: 5, min: 0 },
    shelfLocation: { type: String, default: 'Floor 1, Stack A-12', trim: true },
  },
  { timestamps: true }
);

export const LibraryBook = mongoose.model<ILibraryBookDocument>('LibraryBook', LibraryBookSchema);
