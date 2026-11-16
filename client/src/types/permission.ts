import { User } from './index';

export type PermissionStatus = 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';

export interface PermissionType {
  _id: string;
  name: string;
  code: string;
  requiresWardenSignOff: boolean;
  requiresParentSignOff: boolean;
  maxDurationHours: number;
  description?: string;
  isActive: boolean;
}

export interface PermissionSignOff {
  signee?: User;
  status: 'Pending' | 'Approved' | 'Rejected';
  actionDate?: string;
  comments?: string;
}

export interface PermissionRequest {
  _id: string;
  applicant: User;
  student: any;
  permissionType: PermissionType;
  startDateTime: string;
  endDateTime: string;
  destination: string;
  reason: string;
  emergencyContact: string;
  hasLeaveConflict: boolean;
  leaveConflictDetails?: string;
  status: PermissionStatus;
  wardenSignOff: PermissionSignOff;
  parentSignOff: PermissionSignOff;
  createdAt: string;
}
