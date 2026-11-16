export type ComplaintStatus = 'Submitted' | 'Under Review' | 'Escalated' | 'Resolved' | 'Closed';

export type ComplaintCategory =
  | 'Academic'
  | 'Hostel'
  | 'Infrastructure'
  | 'Ragging / Harassment'
  | 'Canteen'
  | 'General';

export interface IComplaintNote {
  author?: {
    _id: string;
    name: string;
    role: string;
  };
  authorName: string;
  isInternal: boolean;
  text: string;
  createdAt: string;
}

export interface IComplaintAuditEntry {
  actor?: {
    _id: string;
    name: string;
  };
  action: string;
  timestamp: string;
  previousState: string;
  newState: string;
  comment: string;
}

export interface IComplaint {
  _id: string;
  ticketNumber: string;
  complainant: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  isAnonymous: boolean;
  category: ComplaintCategory;
  isSensitive: boolean;
  title: string;
  description: string;
  attachmentUrl?: string;
  assignedDepartment?: {
    _id: string;
    name: string;
    code: string;
  };
  assignedOwner?: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  status: ComplaintStatus;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  resolutionNote?: string;
  notes: IComplaintNote[];
  auditTrail: IComplaintAuditEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateComplaintInput {
  category: ComplaintCategory;
  title: string;
  description: string;
  isAnonymous?: boolean;
  attachmentUrl?: string;
  assignedDepartment?: string;
}
