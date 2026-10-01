import { Response } from 'express';
import { AuthRequest } from '../types';
import { ParentProfile } from '../models/ParentProfile';
import { StudentProfile } from '../models/StudentProfile';
import { sendSuccess, sendError } from '../utils/apiResponse';

export class ParentController {
  static async getLinkedStudents(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return sendError(res, 401, 'Unauthorized');

      const parent = await ParentProfile.findOne({ userId: req.user.userId }).populate({
        path: 'linkedStudents',
        populate: [
          { path: 'userId', select: '-passwordHash' },
          { path: 'mentorId', select: 'firstName lastName fullName email phone' },
          {
            path: 'hostelId',
            select: 'code wardenId',
            populate: { path: 'wardenId', select: 'firstName lastName fullName phone' },
          },
        ],
      });

      if (!parent) return sendError(res, 404, 'Parent profile not found');

      return sendSuccess({ res, message: 'Linked students list', data: parent.linkedStudents });
    } catch (error: any) {
      return sendError(res, 500, error.message || 'Failed to fetch linked students');
    }
  }

  static async getStudentDetail(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return sendError(res, 401, 'Unauthorized');
      const { studentId } = req.params;

      const parent = await ParentProfile.findOne({ userId: req.user.userId });
      if (!parent) return sendError(res, 404, 'Parent profile not found');

      const isLinked = parent.linkedStudents.some(
        (id) => id.toString() === studentId || id.toString() === studentId
      );

      if (!isLinked) {
        return sendError(res, 403, 'Access denied: Student is not linked to your parent account');
      }

      const student = await StudentProfile.findById(studentId)
        .populate('userId', '-passwordHash')
        .populate('mentorId', 'firstName lastName fullName email phone')
        .populate({
          path: 'hostelId',
          select: 'code wardenId',
          populate: { path: 'wardenId', select: 'firstName lastName fullName phone' },
        });

      return sendSuccess({ res, message: 'Linked student details', data: student });
    } catch (error: any) {
      return sendError(res, 500, error.message || 'Failed to fetch student details');
    }
  }
}
