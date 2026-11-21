import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import { Role } from '../types/index.js';

export type UserRole = Role;
export type { Role };

export interface IUserDocument extends Document {
  name: string;
  email: string;
  password?: string;
  role: Role;
  secondaryRoles?: Role[];
  phone?: string;
  isActive: boolean;
  avatar?: string;
  failedLoginAttempts: number;
  lockUntil?: Date | null;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  passwordChangedAt?: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  isLocked(): boolean;
  hasRole(targetRole: Role): boolean;
}

const UserSchema = new Schema<IUserDocument>(
  {
    name: {
      type: String,
      required: [true, 'Please provide user full name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide user email'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: [true, 'Please provide user password'],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ['ADMIN', 'STUDENT', 'FACULTY', 'MENTOR', 'WARDEN', 'HOD', 'PARENT', 'COMPLAINT_OWNER', 'DESIGNATED_AUTHORITY'],
      required: true,
      index: true,
    },
    secondaryRoles: [
      {
        type: String,
        enum: ['ADMIN', 'STUDENT', 'FACULTY', 'MENTOR', 'WARDEN', 'HOD', 'PARENT', 'COMPLAINT_OWNER', 'DESIGNATED_AUTHORITY'],
      },
    ],
    phone: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    avatar: {
      type: String,
      default: '',
    },
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
      default: null,
    },
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },
    passwordChangedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err: any) {
    next(err);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Check if account is temporarily locked (NFR-004)
UserSchema.methods.isLocked = function (): boolean {
  return !!(this.lockUntil && this.lockUntil > new Date());
};

// Check role or secondary role (SH-003)
UserSchema.methods.hasRole = function (targetRole: Role): boolean {
  if (this.role === targetRole) return true;
  if (this.secondaryRoles && this.secondaryRoles.includes(targetRole)) return true;
  return false;
};

export const User = mongoose.model<IUserDocument>('User', UserSchema);
