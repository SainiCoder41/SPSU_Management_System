import { Response } from 'express';
import { AuthRequest } from '../types';
import { StudentProfile } from '../models/StudentProfile';
import { sendSuccess, sendError } from '../utils/apiResponse';

export class MentorController {
  static async getMentees(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return sendError(res, 401, 'Unauthorized');

      const mentees = await StudentProfile.find({ mentorId: req.user.userId })
        .populate('userId', '-passwordHash')
        .populate('hostelId', 'code gender')
        .sort({ createdAt: -1 });

      return sendSuccess({ res, message: 'Assigned mentees', data: mentees });
    } catch (error: any) {
      return sendError(res, 500, error.message || 'Failed to fetch mentees');
    }
  }

  static async getMenteeById(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return sendError(res, 401, 'Unauthorized');
      const { id } = req.params;

      const mentee = await StudentProfile.findOne({ _id: id, mentorId: req.user.userId })
        .populate('userId', '-passwordHash')
        .populate('hostelId', 'code gender');

      if (!mentee) return sendError(res, 404, 'Mentee not found or not assigned to you');
      return sendSuccess({ res, message: 'Mentee profile details', data: mentee });
    } catch (error: any) {
      return sendError(res, 500, error.message || 'Failed to fetch mentee details');
    }
  }
}
