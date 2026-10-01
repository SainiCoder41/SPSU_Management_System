import { Request, Response } from 'express';
import { User } from '../models/User';
import { StudentProfile } from '../models/StudentProfile';
import { StaffProfile } from '../models/StaffProfile';
import { Department } from '../models/Department';
import { Hostel } from '../models/Hostel';
import { ParentProfile } from '../models/ParentProfile';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { cache } from '../config/redis';
import { ImportService } from '../services/import.service';
import xlsx from 'xlsx';

export class AdminController {
  static async getStats(req: Request, res: Response) {
    try {
      const cacheKey = 'dashboard:admin:stats';
      const cached = await cache.get(cacheKey);
      if (cached) {
        return sendSuccess({ res, message: 'Admin stats', data: JSON.parse(cached) });
      }

      const [
        totalStudents,
        totalFaculty,
        totalMentors,
        totalWardens,
        activeStudents,
        totalDepartments,
        totalHostels,
        totalParents,
        studentsByBranch,
        studentsBySemester,
        studentsByHostel,
      ] = await Promise.all([
        StudentProfile.countDocuments(),
        StaffProfile.countDocuments({ employmentType: { $exists: true } }),
        User.countDocuments({ role: 'MENTOR' }),
        User.countDocuments({ role: 'WARDEN' }),
        StudentProfile.countDocuments({ currentStatus: 'ACTIVE' }),
        Department.countDocuments(),
        Hostel.countDocuments(),
        ParentProfile.countDocuments(),

        StudentProfile.aggregate([
          { $group: { _id: '$branch', count: { $sum: 1 } } },
        ]),
        StudentProfile.aggregate([
          { $group: { _id: '$semester', count: { $sum: 1 } } },
          { $sort: { _id: 1 } },
        ]),
        StudentProfile.aggregate([
          { $match: { hostelId: { $ne: null } } },
          {
            $lookup: {
              from: 'hostels',
              localField: 'hostelId',
              foreignField: '_id',
              as: 'hostel',
            },
          },
          { $unwind: '$hostel' },
          { $group: { _id: '$hostel.code', count: { $sum: 1 } } },
        ]),
      ]);

      const recentUsers = await User.find()
        .select('-passwordHash')
        .sort({ createdAt: -1 })
        .limit(10);

      const stats = {
        totalStudents,
        totalFaculty,
        totalMentors,
        totalWardens,
        activeStudents,
        totalDepartments,
        totalHostels,
        totalParents,
        studentsByBranch,
        studentsBySemester,
        studentsByHostel,
        recentUsers,
      };

      await cache.set(cacheKey, JSON.stringify(stats), 120);
      return sendSuccess({ res, message: 'Admin stats', data: stats });
    } catch (error: any) {
      return sendError(res, 500, error.message || 'Failed to fetch admin stats');
    }
  }

  static async getUsers(req: Request, res: Response) {
    try {
      const page = Math.max(1, parseInt(String(req.query.page || 1), 10));
      const limit = Math.min(100, parseInt(String(req.query.limit || 20), 10));
      const skip = (page - 1) * limit;

      const query: any = {};
      if (req.query.role) query.role = req.query.role;
      if (req.query.search) {
        const regex = new RegExp(String(req.query.search), 'i');
        query.$or = [{ firstName: regex }, { lastName: regex }, { email: regex }];
      }

      const [users, totalItems] = await Promise.all([
        User.find(query).select('-passwordHash').skip(skip).limit(limit).sort({ createdAt: -1 }),
        User.countDocuments(query),
      ]);

      return sendSuccess({
        res,
        message: 'Users list',
        data: users,
        pagination: { page, limit, totalItems, totalPages: Math.ceil(totalItems / limit) },
      });
    } catch (error: any) {
      return sendError(res, 500, error.message || 'Failed to fetch users');
    }
  }

  static async updateUserStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { isActive } = req.body;

      const user = await User.findByIdAndUpdate(id, { isActive }, { new: true }).select('-passwordHash');
      if (!user) return sendError(res, 404, 'User not found');

      return sendSuccess({ res, message: `User status updated to ${isActive ? 'active' : 'inactive'}`, data: user });
    } catch (error: any) {
      return sendError(res, 500, error.message || 'Failed to update user status');
    }
  }

  static async importStudents(req: Request, res: Response) {
    try {
      if (!req.file) {
        return sendError(res, 400, 'Please upload a CSV or XLSX file');
      }

      const report = await ImportService.processStudentImport(req.file.buffer);
      return sendSuccess({
        res,
        message: 'Import processed successfully',
        data: report,
      });
    } catch (error: any) {
      return sendError(res, 500, error.message || 'Import failed');
    }
  }

  static async exportStudents(req: Request, res: Response) {
    try {
      const students = await StudentProfile.find()
        .populate('userId', 'firstName lastName email phone gender')
        .populate('mentorId', 'fullName email')
        .populate('hostelId', 'code');

      const dataToExport = students.map((s: any) => ({
        'Enrollment Number': s.enrollmentNumber,
        'Registration Number': s.registrationNumber,
        'First Name': s.userId?.firstName || '',
        'Last Name': s.userId?.lastName || '',
        'Email': s.userId?.email || '',
        'Phone': s.userId?.phone || '',
        'Program': s.program,
        'Branch': s.branch,
        'Semester': s.semester,
        'Batch': s.batch,
        'Section': s.section,
        'Status': s.currentStatus,
        'Hostel': s.hostelId?.code || 'N/A',
        'Mentor': s.mentorId?.fullName || 'Unassigned',
      }));

      const worksheet = xlsx.utils.json_to_sheet(dataToExport);
      const workbook = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(workbook, worksheet, 'Students');

      const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=SPSU_Students_Directory.xlsx');
      return res.send(buffer);
    } catch (error: any) {
      return sendError(res, 500, error.message || 'Export failed');
    }
  }
}
