import { Response } from 'express';
import { AuthRequest } from '../types';
import { Department } from '../models/Department';
import { StaffProfile } from '../models/StaffProfile';
import { StudentProfile } from '../models/StudentProfile';
import { sendSuccess, sendError } from '../utils/apiResponse';

export class HodController {
  static async getMyDepartment(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return sendError(res, 401, 'Unauthorized');

      const department = await Department.findOne({ hodId: req.user.userId }).populate('hodId', 'firstName lastName fullName email');
      if (!department) return sendError(res, 404, 'No department assigned under your HOD profile');

      const facultyCount = await StaffProfile.countDocuments({ departmentId: department._id });
      const studentCount = await StudentProfile.countDocuments({ branch: department.code });

      return sendSuccess({
        res,
        message: 'Department overview',
        data: { ...department.toObject(), facultyCount, studentCount },
      });
    } catch (error: any) {
      return sendError(res, 500, error.message || 'Failed to fetch department');
    }
  }

  static async getDepartmentFaculty(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return sendError(res, 401, 'Unauthorized');

      const department = await Department.findOne({ hodId: req.user.userId });
      if (!department) return sendError(res, 404, 'No department assigned under your HOD profile');

      const faculty = await StaffProfile.find({ departmentId: department._id })
        .populate('userId', '-passwordHash')
        .sort({ designation: 1 });

      return sendSuccess({ res, message: 'Department faculty members', data: faculty });
    } catch (error: any) {
      return sendError(res, 500, error.message || 'Failed to fetch faculty');
    }
  }

  static async getDepartmentStudents(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return sendError(res, 401, 'Unauthorized');

      const department = await Department.findOne({ hodId: req.user.userId });
      if (!department) return sendError(res, 404, 'No department assigned under your HOD profile');

      const students = await StudentProfile.find({ branch: department.code })
        .populate('userId', '-passwordHash')
        .populate('mentorId', 'firstName lastName fullName email')
        .populate('hostelId', 'code')
        .sort({ semester: 1, rollNumber: 1 });

      return sendSuccess({ res, message: 'Department students', data: students });
    } catch (error: any) {
      return sendError(res, 500, error.message || 'Failed to fetch students');
    }
  }
}
