import mongoose, { Schema, Document } from 'mongoose';

export type PlacementStatus = 'Active' | 'Closed' | 'Upcoming';

export interface IPlacementDriveDocument extends Document {
  companyName: string;
  roleTitle: string;
  ctcPackageLPA: number;
  eligibilityCgpa: number;
  eligibleDepartments: mongoose.Types.ObjectId[];
  driveDate: Date;
  registrationDeadline: Date;
  location: string;
  description: string;
  status: PlacementStatus;
  createdAt: Date;
  updatedAt: Date;
}

const PlacementDriveSchema = new Schema<IPlacementDriveDocument>(
  {
    companyName: { type: String, required: true, trim: true },
    roleTitle: { type: String, required: true, trim: true },
    ctcPackageLPA: { type: Number, required: true },
    eligibilityCgpa: { type: Number, default: 6.5 },
    eligibleDepartments: [{ type: Schema.Types.ObjectId, ref: 'Department' }],
    driveDate: { type: Date, required: true },
    registrationDeadline: { type: Date, required: true },
    location: { type: String, default: 'SPSU Campus Auditorium / Virtual' },
    description: { type: String, default: '' },
    status: {
      type: String,
      enum: ['Active', 'Closed', 'Upcoming'],
      default: 'Active',
      index: true,
    },
  },
  { timestamps: true }
);

export const PlacementDrive = mongoose.model<IPlacementDriveDocument>('PlacementDrive', PlacementDriveSchema);
