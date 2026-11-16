import { Request, Response } from 'express';
import { Student } from '../models/Student.js';
import { Staff } from '../models/Staff.js';
import { Department } from '../models/Department.js';
import { Hostel } from '../models/Hostel.js';
import { User } from '../models/User.js';
import { cache } from '../config/redis.js';
import { parseAndImportStudents } from '../services/bulkImportService.js';

export const getStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const cacheKey = 'admin:stats';
    const cached = await cache.get(cacheKey);
    if (cached) {
      res.status(200).json({ success: true, data: JSON.parse(cached), fromCache: true });
      return;
    }

    const [
      totalStudents,
      totalStaff,
      totalDepartments,
      totalHostels,
      hostelStats,
      deptBreakdown,
      recentStudents,
    ] = await Promise.all([
      Student.countDocuments(),
      Staff.countDocuments(),
      Department.countDocuments(),
      Hostel.countDocuments(),
      Hostel.aggregate([
        {
          $group: {
            _id: null,
            totalCapacity: { $sum: '$capacity' },
            totalOccupancy: { $sum: '$occupancy' },
          },
        },
      ]),
      Student.aggregate([
        {
          $group: {
            _id: '$department',
            count: { $sum: 1 },
          },
        },
        {
          $lookup: {
            from: 'departments',
            localField: '_id',
            foreignField: '_id',
            as: 'dept',
          },
        },
        { $unwind: '$dept' },
        {
          $project: {
            code: '$dept.code',
            name: '$dept.name',
            count: 1,
          },
        },
      ]),
      Student.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('user', 'name email createdAt')
        .populate('department', 'code name'),
    ]);

    const statsData = {
      totalStudents,
      totalStaff,
      totalDepartments,
      totalHostels,
      hostelCapacity: hostelStats[0]?.totalCapacity || 0,
      hostelOccupancy: hostelStats[0]?.totalOccupancy || 0,
      deptBreakdown,
      recentStudents,
    };

    // Cache for 60 seconds
    await cache.set(cacheKey, JSON.stringify(statsData), 60);

    res.status(200).json({ success: true, data: statsData, fromCache: false });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error fetching statistics' });
  }
};

export const importStudents = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No spreadsheet file provided. Please upload .xlsx, .xls or .csv' });
      return;
    }

    const result = await parseAndImportStudents(req.file.buffer);

    // Invalidate stats cache
    await cache.del('admin:stats');

    res.status(200).json({
      success: true,
      message: `Batch import complete. Successfully imported ${result.importedCount} of ${result.totalRows} records.`,
      result,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to process file import' });
  }
};
