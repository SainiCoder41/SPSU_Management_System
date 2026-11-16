import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.js';
import { NotificationService } from '../services/notificationService.js';

export const getMyNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { notifications, unreadCount } = await NotificationService.getNotifications(req.user!.id);
    res.status(200).json({
      success: true,
      unreadCount,
      count: notifications.length,
      data: notifications,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error fetching notifications' });
  }
};

export const markAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const notification = await NotificationService.markAsRead(req.params.id, req.user!.id);
    if (!notification) {
      res.status(404).json({ success: false, message: 'Notification not found' });
      return;
    }
    res.status(200).json({ success: true, message: 'Marked as read', data: notification });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error updating notification' });
  }
};

export const markAllAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const count = await NotificationService.markAllAsRead(req.user!.id);
    res.status(200).json({ success: true, message: `Marked ${count} notifications as read` });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error marking all notifications as read' });
  }
};
