import mongoose from 'mongoose';
import { Notice, INoticeDocument, NoticePriority, UserRole, User, Student } from '../models/index.js';
import { NotificationService } from './notificationService.js';

export class NoticeService {
  /**
   * Publish a new Notice
   */
  static async publishNotice(
    publisherId: string,
    data: {
      title: string;
      body: string;
      priority?: NoticePriority;
      isPinned?: boolean;
      targetAudience?: {
        roles?: UserRole[];
        departments?: string[];
        hostels?: string[];
        semesters?: number[];
      };
      attachmentUrl?: string;
      expiryDate?: Date;
    }
  ): Promise<INoticeDocument> {
    const notice = await Notice.create({
      title: data.title,
      body: data.body,
      priority: data.priority || 'Normal',
      isPinned: !!data.isPinned,
      targetAudience: {
        roles: data.targetAudience?.roles || [],
        departments: (data.targetAudience?.departments || []).map((id) => new mongoose.Types.ObjectId(id)),
        hostels: (data.targetAudience?.hostels || []).map((id) => new mongoose.Types.ObjectId(id)),
        semesters: data.targetAudience?.semesters || [],
      },
      attachmentUrl: data.attachmentUrl || '',
      publisher: new mongoose.Types.ObjectId(publisherId),
      expiryDate: data.expiryDate || undefined,
      status: 'Published',
    });

    // If Urgent, broadcast notification to target users
    if (notice.priority === 'Urgent') {
      const targetQuery: any = { isActive: true };
      if (notice.targetAudience.roles && notice.targetAudience.roles.length > 0) {
        targetQuery.role = { $in: notice.targetAudience.roles };
      }
      const usersToNotify = await User.find(targetQuery).select('_id').lean();
      const userIds = usersToNotify.map((u) => u._id);

      await NotificationService.notifyMany(
        userIds,
        `🚨 Urgent Notice: ${notice.title}`,
        notice.body.substring(0, 120) + (notice.body.length > 120 ? '...' : ''),
        'Notice',
        `/notices?id=${notice._id}`
      );
    }

    return notice;
  }

  /**
   * Get active notices tailored for a specific user
   */
  static async getNoticesForUser(userId: string, userRole: UserRole): Promise<any[]> {
    const roleUpper = userRole.toUpperCase();
    let studentDetails: any = null;
    if (roleUpper === 'STUDENT') {
      studentDetails = await Student.findOne({ user: new mongoose.Types.ObjectId(userId) }).lean();
    }

    const query: any = {
      status: 'Published',
      $or: [
        { expiryDate: null },
        { expiryDate: { $gt: new Date() } },
      ],
    };

    if (roleUpper !== 'ADMIN') {
      const orConditions: any[] = [
        { 'targetAudience.roles': { $size: 0 } },
        { 'targetAudience.roles': roleUpper },
        { 'targetAudience.roles': userRole },
      ];

      if (studentDetails) {
        if (studentDetails.department) {
          orConditions.push({ 'targetAudience.departments': studentDetails.department });
        }
        if (studentDetails.hostel) {
          orConditions.push({ 'targetAudience.hostels': studentDetails.hostel });
        }
      }

      query.$and = [{ $or: orConditions }];
    }

    const notices = await Notice.find(query)
      .populate('publisher', 'name email role')
      .populate('targetAudience.departments', 'name code')
      .populate('targetAudience.hostels', 'name code')
      .sort({ isPinned: -1, priority: -1, publishDate: -1 })
      .lean();

    return notices;
  }

  /**
   * Archive notice
   */
  static async archiveNotice(noticeId: string): Promise<INoticeDocument> {
    const notice = await Notice.findByIdAndUpdate(
      noticeId,
      { $set: { status: 'Archived' } },
      { new: true }
    );
    if (!notice) throw new Error('Notice not found');
    return notice;
  }
}
