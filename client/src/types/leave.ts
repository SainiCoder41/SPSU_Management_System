import { User, Role } from './index';

export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected' | 'Returned' | 'Cancelled';

export interface LeaveType {
  _id: string;
  name: string;
  code: string;
  applicableRole: 'STUDENT' | 'STAFF' | 'ALL';
  defaultQuota: number;
  requiresAttachment: boolean;
  description?: string;
  isActive: boolean;
}

export interface LeaveBalance {
  leaveType: LeaveType;
  academicYear: number;
  totalQuota: number;
  usedDays: number;
  pendingDays: number;
  remainingDays: number;
}

export interface ApprovalStep {
  approver: User;
  role: Role;
  action: 'Submitted' | 'Approved' | 'Rejected' | 'Returned' | 'Cancelled';
  actionDate: string;
  comments: string;
}

export interface AuditEntry {
  actor: User;
  action: string;
  timestamp: string;
  previousState: string;
  newState: string;
  comment: string;
}

export interface LeaveRequest {
  _id: string;
  applicant: User;
  applicantRole: Role;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  numberOfDays: number;
  reason: string;
  emergencyContact?: string;
  attachmentUrl?: string;
  status: LeaveStatus;
  currentApprover?: User;
  approvalHistory: ApprovalStep[];
  auditTrail: AuditEntry[];
  createdAt: string;
  updatedAt: string;
}
