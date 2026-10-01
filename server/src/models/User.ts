import mongoose, { Schema, Document } from 'mongoose';
import { UserRole, Gender } from '../types';

export interface IUser extends Document {
  firstName: string;
  middleName?: string | null;
  lastName: string;
  fullName: string;
  email: string;
  phone?: string;
  passwordHash: string;
  role: UserRole;
  profileImage?: string | null;
  gender?: Gender;
  dateOfBirth?: Date | null;
  isActive: boolean;
  lastLoginAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true, trim: true },
    middleName: { type: String, default: null, trim: true },
    lastName: { type: String, required: true, trim: true },
    fullName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: { type: String, default: '', trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: {
      type: String,
      required: true,
      enum: ['ADMIN', 'STUDENT', 'FACULTY', 'MENTOR', 'WARDEN', 'HOD', 'PARENT'],
      index: true,
    },
    profileImage: { type: String, default: null },
    gender: { type: String, enum: ['MALE', 'FEMALE', 'OTHER'], default: 'OTHER' },
    dateOfBirth: { type: Date, default: null },
    isActive: { type: Boolean, default: true, index: true },
    lastLoginAt: { type: Date, default: null },
  },
  { timestamps: true }
);

UserSchema.pre('save', function (next) {
  if (this.isModified('firstName') || this.isModified('lastName') || this.isModified('middleName')) {
    const parts = [this.firstName, this.middleName, this.lastName].filter(Boolean);
    this.fullName = parts.join(' ');
  }
  next();
});

export const User = mongoose.model<IUser>('User', UserSchema);
