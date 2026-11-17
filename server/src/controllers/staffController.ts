import { Request, Response } from 'express';
import { Staff } from '../models/Staff.js';
import { User } from '../models/User.js';
import { AuditLog } from '../models/AuditLog.js';
import { cache } from '../config/redis.js';
import { parseAndImportStaff, exportStaffToExcel } from '../services/bulkImportService.js';
import { AuthRequest } from '../middlewares/auth.js';

export const getStaff = async (req: Request, res: Response): Promise<void> => {
  try {
    const { department, role, search } = req.query;
    const filter: any = {};

    if (department) {
      filter.department = department;
    }

    const staffQuery = Staff.find(filter)
      .populate('department', 'name code')
      .populate('user', 'name email phone role isActive avatar');

    let list = await staffQuery.exec();

    if (role) {
      list = list.filter((s: any) => s.user?.role === role);
    }

    if (search) {
      const q = String(search).toLowerCase();
      list = list.filter(
        (s: any) =>
          s.user?.name?.toLowerCase().includes(q) ||
          s.user?.email?.toLowerCase().includes(q) ||
          s.employeeId?.toLowerCase().includes(q)
      );
    }

    res.status(200).json({ success: true, count: list.length, data: list });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error fetching staff' });
  }
};

export const getStaffById = async (req: Request, res: Response): Promise<void> => {
  try {
    const staff = await Staff.findById(req.params.id)
      .populate('user', 'name email phone role isActive avatar')
      .populate('department', 'name code');

    if (!staff) {
      res.status(404).json({ success: false, message: 'Staff member not found' });
      return;
    }

    res.status(200).json({ success: true, data: staff });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error fetching staff details' });
  }
};

export const createStaff = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name,
      email,
      password,
      phone,
      employeeId,
      department,
      designation,
      role = 'FACULTY',
      specialization,
      officeLocation,
    } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(400).json({ success: false, message: 'User with this email already exists' });
      return;
    }

    const existingStaff = await Staff.findOne({ employeeId });
    if (existingStaff) {
      res.status(400).json({ success: false, message: 'Staff with this Employee ID already exists' });
      return;
    }

    const user = new User({
      name,
      email: email.toLowerCase(),
      password: password || 'Staff@1234',
      role,
      phone,
    });
    await user.save();

    const staff = new Staff({
      user: user._id,
      employeeId,
      department,
      designation,
      specialization,
      officeLocation,
    });
    await staff.save();

    await cache.del('admin:stats');

    const created = await Staff.findById(staff._id)
      .populate('user', 'name email phone role')
      .populate('department');

    res.status(201).json({ success: true, message: 'Staff member registered successfully', data: created });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error creating staff member' });
  }
};

export const updateStaff = async (req: Request, res: Response): Promise<void> => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) {
      res.status(404).json({ success: false, message: 'Staff not found' });
      return;
    }

    const { name, phone, department, designation, specialization, officeLocation, role } = req.body;

    if (name || phone || role) {
      await User.findByIdAndUpdate(staff.user, {
        ...(name && { name }),
        ...(phone && { phone }),
        ...(role && { role }),
      });
    }

    if (department) staff.department = department;
    if (designation) staff.designation = designation;
    if (specialization !== undefined) staff.specialization = specialization;
    if (officeLocation !== undefined) staff.officeLocation = officeLocation;

    await staff.save();

    const updated = await Staff.findById(staff._id)
      .populate('user', 'name email phone role')
      .populate('department');

    res.status(200).json({ success: true, message: 'Staff member updated successfully', data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error updating staff member' });
  }
};

export const toggleStaffStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) {
      res.status(404).json({ success: false, message: 'Staff member not found' });
      return;
    }

    if (staff.user.toString() === req.user!.id) {
      res.status(400).json({ success: false, message: 'Administrators cannot deactivate their own active account' });
      return;
    }

    const user = await User.findById(staff.user);
    if (!user) {
      res.status(404).json({ success: false, message: 'Linked user record not found' });
      return;
    }

    const prevState = user.isActive;
    user.isActive = !user.isActive;
    await user.save();

    await AuditLog.create({
      actor: req.user!.id,
      actorRole: req.user!.role,
      actorEmail: req.user!.email,
      action: user.isActive ? 'STAFF_ACTIVATED' : 'STAFF_DEACTIVATED',
      resourceType: 'Staff',
      resourceId: staff._id.toString(),
      previousState: { isActive: prevState },
      newState: { isActive: user.isActive },
      comment: `Staff profile status changed to ${user.isActive ? 'Active' : 'Inactive'}`,
    });

    res.status(200).json({
      success: true,
      message: `Staff member marked as ${user.isActive ? 'Active' : 'Inactive'}`,
      data: { id: staff._id, isActive: user.isActive },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error updating staff status' });
  }
};

export const importStaff = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'Please upload an Excel or CSV file' });
      return;
    }

    const result = await parseAndImportStaff(req.file.buffer);

    await AuditLog.create({
      actor: req.user!.id,
      actorRole: req.user!.role,
      actorEmail: req.user!.email,
      action: 'STAFF_BULK_IMPORT',
      resourceType: 'Staff',
      comment: `Bulk imported ${result.importedCount} staff records (${result.errors.length} errors)`,
    });

    await cache.del('admin:stats');

    res.status(200).json({
      success: true,
      message: `Import completed: ${result.importedCount} staff records created, ${result.errors.length} failed.`,
      data: result,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error during staff bulk import' });
  }
};

export const exportStaff = async (req: Request, res: Response): Promise<void> => {
  try {
    const buffer = await exportStaffToExcel();
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', 'attachment; filename="spsu_staff_directory.xlsx"');
    res.send(buffer);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error generating staff export' });
  }
};
