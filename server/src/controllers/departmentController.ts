import { Request, Response } from 'express';
import { Department } from '../models/Department.js';
import { Student } from '../models/Student.js';
import { Staff } from '../models/Staff.js';
import { cache } from '../config/redis.js';

export const getDepartments = async (req: Request, res: Response): Promise<void> => {
  try {
    const departments = await Department.find()
      .populate({
        path: 'hod',
        populate: { path: 'user', select: 'name email phone avatar' },
      })
      .sort({ name: 1 });

    // Attach student and staff counts for each department
    const deptsWithCounts = await Promise.all(
      departments.map(async (d) => {
        const [studentCount, facultyCount] = await Promise.all([
          Student.countDocuments({ department: d._id }),
          Staff.countDocuments({ department: d._id }),
        ]);
        return {
          ...d.toObject(),
          studentCount,
          facultyCount,
        };
      })
    );

    res.status(200).json({ success: true, count: deptsWithCounts.length, data: deptsWithCounts });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error fetching departments' });
  }
};

export const createDepartment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, code, description, hod } = req.body;

    const existing = await Department.findOne({ code: code.toUpperCase() });
    if (existing) {
      res.status(400).json({ success: false, message: `Department with code '${code}' already exists` });
      return;
    }

    const dept = new Department({
      name,
      code: code.toUpperCase(),
      description,
      hod: hod || null,
    });
    await dept.save();

    await cache.del('admin:stats');

    res.status(201).json({ success: true, message: 'Department created successfully', data: dept });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error creating department' });
  }
};

export const updateDepartment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, code, description, hod } = req.body;
    const dept = await Department.findById(req.params.id);

    if (!dept) {
      res.status(404).json({ success: false, message: 'Department not found' });
      return;
    }

    if (name) dept.name = name;
    if (code) dept.code = code.toUpperCase();
    if (description !== undefined) dept.description = description;
    if (hod !== undefined) dept.hod = hod || null;

    await dept.save();
    await cache.del('admin:stats');

    const updated = await Department.findById(dept._id).populate({
      path: 'hod',
      populate: { path: 'user', select: 'name email phone' },
    });

    res.status(200).json({ success: true, message: 'Department updated successfully', data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error updating department' });
  }
};
