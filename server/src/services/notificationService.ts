import mongoose from 'mongoose';
import { Notification, NotificationSourceModule } from '../models/index.js';

export class NotificationService {
  /**
   * Helper to push an in-app notification to a user
   */
  static async notify(
    recipientId: mongoose.Types.ObjectId | string,
    title: string,
    message: string,
    sourceModule: NotificationSourceModule = 'System',
    link: string = ''
  ) {
    try {
      const recipient = typeof recipientId === 'string' ? new mongoose.Types.ObjectId(recipientId) : recipientId;
      return await Notification.create({
        recipient,
        title,
        message,
        sourceModule,
        link,
        isRead: false,
      });
    } catch (err) {
      console.error('[NotificationService] Failed to create notification:', err);
      return null;
    }
  }

  /**
   * Helper to push notifications to multiple users
   */
  static async notifyMany(
    recipientIds: (mongoose.Types.ObjectId | string)[],
    title: string,
    message: string,
    sourceModule: NotificationSourceModule = 'System',
    link: string = ''
  ) {
    try {
      const docs = recipientIds.map((id) => ({
        recipient: typeof id === 'string' ? new mongoose.Types.ObjectId(id) : id,
        title,
        message,
        sourceModule,
        link,
        isRead: false,
      }));
      return await Notification.insertMany(docs);
    } catch (err) {
      console.error('[NotificationService] Failed to notify many:', err);
      return [];
    }
  }

  static async getNotifications(userId: string, limit = 30) {
    const list = await Notification.find({ recipient: new mongoose.Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    const unreadCount = await Notification.countDocuments({
      recipient: new mongoose.Types.ObjectId(userId),
      isRead: false,
    });

    return { notifications: list, unreadCount };
  }

  static async markAsRead(notificationId: string, userId: string) {
    return await Notification.findOneAndUpdate(
      { _id: notificationId, recipient: new mongoose.Types.ObjectId(userId) },
      { $set: { isRead: true } },
      { new: true }
    );
  }

  static async markAllAsRead(userId: string) {
    const res = await Notification.updateMany(
      { recipient: new mongoose.Types.ObjectId(userId), isRead: false },
      { $set: { isRead: true } }
    );
    return res.modifiedCount;
  }
}
