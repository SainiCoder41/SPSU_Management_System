export type NoticePriority = 'Normal' | 'Important' | 'Urgent';
export type NoticeStatus = 'Draft' | 'Published' | 'Archived';

export interface INotice {
  _id: string;
  title: string;
  body: string;
  priority: NoticePriority;
  isPinned: boolean;
  targetAudience: {
    roles?: string[];
    departments?: { _id: string; name: string; code: string }[];
    hostels?: { _id: string; name: string; code: string }[];
    semesters?: number[];
  };
  attachmentUrl?: string;
  publisher: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  publishDate: string;
  expiryDate?: string;
  status: NoticeStatus;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNoticeInput {
  title: string;
  body: string;
  priority?: NoticePriority;
  isPinned?: boolean;
  targetAudience?: {
    roles?: string[];
    departments?: string[];
    hostels?: string[];
    semesters?: number[];
  };
  attachmentUrl?: string;
  expiryDate?: string;
}

export type NotificationSourceModule = 'Leave' | 'Event' | 'Permission' | 'Complaint' | 'Notice' | 'System';

export interface IAppNotification {
  _id: string;
  recipient: string;
  title: string;
  message: string;
  sourceModule: NotificationSourceModule;
  link?: string;
  isRead: boolean;
  createdAt: string;
}
