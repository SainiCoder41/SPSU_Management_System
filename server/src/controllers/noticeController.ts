import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.js';
import { NoticeService } from '../services/noticeService.js';
import { Notice } from '../models/Notice.js';

export const getNotices = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const notices = await NoticeService.getNoticesForUser(req.user!.id, req.user!.role);
    res.status(200).json({ success: true, count: notices.length, data: notices });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error fetching notices' });
  }
};

export const getNoticeById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const notice = await Notice.findById(req.params.id)
      .populate('publisher', 'name email role')
      .populate('targetAudience.departments', 'name code')
      .populate('targetAudience.hostels', 'name code');

    if (!notice) {
      res.status(404).json({ success: false, message: 'Notice not found' });
      return;
    }

    // Increment view count
    notice.viewCount = (notice.viewCount || 0) + 1;
    await notice.save();

    res.status(200).json({ success: true, data: notice });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error fetching notice' });
  }
};

export const publishNotice = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const notice = await NoticeService.publishNotice(req.user!.id, req.body);
    res.status(201).json({
      success: true,
      message: 'Notice published successfully',
      data: notice,
    });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message || 'Error publishing notice' });
  }
};

export const archiveNotice = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const notice = await NoticeService.archiveNotice(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Notice archived successfully',
      data: notice,
    });
  } catch (err: any) {
    const status = err.statusCode || 400;
    res.status(status).json({ success: false, message: err.message || 'Error archiving notice' });
  }
};
