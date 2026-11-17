import mongoose, { Schema, Document } from 'mongoose';

export interface IVisitorLogDocument extends Document {
  visitorName: string;
  phone: string;
  relation: string; // Parent, Guardian, Guest, Vendor
  studentVisited?: mongoose.Types.ObjectId;
  hostelBlock?: mongoose.Types.ObjectId;
  purpose: string;
  checkIn: Date;
  checkOut?: Date;
  gateNumber: string;
  recordedBy: mongoose.Types.ObjectId;
  status: 'Inside' | 'CheckedOut';
  createdAt: Date;
  updatedAt: Date;
}

const VisitorLogSchema = new Schema<IVisitorLogDocument>(
  {
    visitorName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    relation: { type: String, default: 'Parent / Family' },
    studentVisited: { type: Schema.Types.ObjectId, ref: 'Student' },
    hostelBlock: { type: Schema.Types.ObjectId, ref: 'Hostel' },
    purpose: { type: String, required: true, trim: true },
    checkIn: { type: Date, default: () => new Date() },
    checkOut: { type: Date },
    gateNumber: { type: String, default: 'Gate 1 (Main Entrance)' },
    recordedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['Inside', 'CheckedOut'], default: 'Inside', index: true },
  },
  { timestamps: true }
);

export const VisitorLog = mongoose.model<IVisitorLogDocument>('VisitorLog', VisitorLogSchema);
