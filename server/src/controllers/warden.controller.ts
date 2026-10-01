import { Response } from 'express';
import { AuthRequest } from '../types';
import { Hostel } from '../models/Hostel';
import { StudentProfile } from '../models/StudentProfile';
import { sendSuccess, sendError } from '../utils/apiResponse';

export class WardenController {
  static async getMyHostel(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return sendError(res, 401, 'Unauthorized');

      const hostel = await Hostel.findOne({ wardenId: req.user.userId });
      if (!hostel) return sendError(res, 404, 'No hostel currently assigned to you');

      const residentCount = await StudentProfile.countDocuments({ hostelId: hostel._id });

      return sendSuccess({
        res,
        message: 'Assigned hostel details',
        data: { ...hostel.toObject(), residentCount },
      });
    } catch (error: any) {
      return sendError(res, 500, error.message || 'Failed to fetch hostel');
    }
  }

  static async getResidents(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return sendError(res, 401, 'Unauthorized');

      const hostel = await Hostel.findOne({ wardenId: req.user.userId });
      if (!hostel) return sendError(res, 404, 'No hostel currently assigned to you');

      const query: any = { hostelId: hostel._id };
      if (req.query.search) {
        const regex = new RegExp(String(req.query.search), 'i');
        query.$or = [{ enrollmentNumber: regex }, { registrationNumber: regex }, { rollNumber: regex }];
      }

      const residents = await StudentProfile.find(query)
        .populate('userId', '-passwordHash')
        .populate('mentorId', 'firstName lastName fullName email phone')
        .sort({ createdAt: -1 });

      return sendSuccess({ res, message: 'Hostel residents', data: residents });
    } catch (error: any) {
      return sendError(res, 500, error.message || 'Failed to fetch hostel residents');
    }
  }
}
